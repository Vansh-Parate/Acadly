import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import dashboardRoutes from './routes/dashboard'
import mentorRoutes from './routes/mentor'
import mentorsRoutes from './routes/mentors'
import sessionsRoutes from './routes/sessions'
import chatRoutes from './routes/chat'
import notificationsRoutes from './routes/notifications'
import progressRoutes from './routes/progress'
import scheduledSessionsRoutes from './routes/scheduled-sessions'
import http from 'http'
import { WebSocketServer, WebSocket, RawData } from 'ws'
import { prisma } from './prisma'

dotenv.config()

const app = express()

// CORS configuration for both development and production
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Normalize the incoming origin by removing trailing slash
    const normalizedOrigin = origin.replace(/\/$/, '');
    
    // Define allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://acadly-mentor.vercel.app'
    ];
    
    // Add any additional origins from environment variable
    if (process.env.CORS_ORIGIN) {
      const envOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim().replace(/\/$/, ''));
      allowedOrigins.push(...envOrigins);
    }
        
    // Check if normalized origin is in allowed list
    if (allowedOrigins.includes(normalizedOrigin)) {
      console.log('CORS allowed:', normalizedOrigin);
      callback(null, true);
    } else {
      console.log('CORS blocked:', normalizedOrigin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/auth', authRoutes)
app.use('/dashboard', dashboardRoutes)
app.use('/mentor', mentorRoutes)
app.use('/mentors', mentorsRoutes)
app.use('/sessions', sessionsRoutes)
app.use('/chat', chatRoutes)
app.use('/notifications', notificationsRoutes)
app.use('/progress', progressRoutes)
app.use('/scheduled-sessions', scheduledSessionsRoutes)

const server = http.createServer(app)

// WebSocket setup
const wss = new WebSocketServer({ server })
type Client = { 
  userId?: number; 
  role?: 'STUDENT' | 'MENTOR' | 'ADMIN';
  sessionId?: number;
  isTyping?: boolean;
  lastTypingTime?: number;
}
const clients = new Map<WebSocket, Client>()

// Track typing users per session
const typingUsers = new Map<number, Set<number>>()

wss.on('connection', (ws: WebSocket) => {
  console.log('New WebSocket connection established')
  clients.set(ws, {})
  
  ws.on('message', async (raw: RawData) => {
    try {
      const msg = JSON.parse(String(raw)) as {
        type: string;
        userId?: number;
        role?: Client['role'];
        sessionId?: number;
        message?: string;
        isTyping?: boolean;
      }

      console.log('WebSocket message received:', msg.type, msg)

      const client = clients.get(ws)
      if (!client) return

      switch (msg.type) {
        case 'auth':
          client.userId = msg.userId
          client.role = msg.role
          console.log(`User authenticated: ${msg.userId} (${msg.role})`)
          
          // Send confirmation back to client
          try {
            ws.send(JSON.stringify({
              type: 'auth_success',
              userId: msg.userId,
              role: msg.role
            }))
            console.log(`Auth success sent to user ${msg.userId}`)
          } catch (error) {
            console.error('Error sending auth_success:', error)
          }
          break

        case 'join_session':
          client.sessionId = msg.sessionId
          console.log(`User ${client.userId} joined session ${msg.sessionId}`)
          
          // Notify other users in the session
          broadcastToSession(msg.sessionId!, {
            type: 'user_joined',
            userId: client.userId,
            role: client.role
          })
          break

        case 'leave_session':
          if (client.sessionId) {
            console.log(`User ${client.userId} left session ${client.sessionId}`)
            
            // Remove from typing users
            const typingSet = typingUsers.get(client.sessionId)
            if (typingSet) {
              typingSet.delete(client.userId!)
              if (typingSet.size === 0) {
                typingUsers.delete(client.sessionId)
              }
            }
            
            // Notify other users
            broadcastToSession(client.sessionId, {
              type: 'user_left',
              userId: client.userId,
              role: client.role
            })
            client.sessionId = undefined
          }
          break

        case 'typing_start':
          if (client.sessionId && client.userId) {
            let typingSet = typingUsers.get(client.sessionId)
            if (!typingSet) {
              typingSet = new Set()
              typingUsers.set(client.sessionId, typingSet)
            }
            typingSet.add(client.userId)
            client.isTyping = true
            client.lastTypingTime = Date.now()
            
            broadcastToSession(client.sessionId, {
              type: 'typing_start',
              userId: client.userId,
              role: client.role
            })
          }
          break

        case 'typing_stop':
          if (client.sessionId && client.userId) {
            const typingSet = typingUsers.get(client.sessionId)
            if (typingSet) {
              typingSet.delete(client.userId)
              if (typingSet.size === 0) {
                typingUsers.delete(client.sessionId)
              }
            }
            client.isTyping = false
            
            broadcastToSession(client.sessionId, {
              type: 'typing_stop',
              userId: client.userId,
              role: client.role
            })
          }
          break

        case 'message':
          if (client.sessionId && client.userId && msg.message) {
            console.log(`Message from user ${client.userId} in session ${client.sessionId}: ${msg.message}`)
            
            try {
              // Save message to database
              const savedMessage = await prisma.chatMessage.create({
                data: {
                  sessionId: client.sessionId,
                  fromUserId: client.userId,
                  message: msg.message,
                  isAiMessage: false,
                  aiTopics: []
                },
                include: {
                  fromUser: {
                    select: { id: true, name: true, avatarUrl: true }
                  }
                }
              })

              // Stop typing indicator
              const typingSet = typingUsers.get(client.sessionId)
              if (typingSet) {
                typingSet.delete(client.userId)
                if (typingSet.size === 0) {
                  typingUsers.delete(client.sessionId)
                }
              }
              client.isTyping = false

              // Broadcast message to all users in session
              broadcastToSession(client.sessionId, {
                type: 'new_message',
                message: {
                  id: savedMessage.id,
                  sessionId: savedMessage.sessionId,
                  fromUserId: savedMessage.fromUserId,
                  message: savedMessage.message,
                  isAiMessage: savedMessage.isAiMessage,
                  aiTopics: savedMessage.aiTopics,
                  createdAt: savedMessage.createdAt,
                  fromUser: savedMessage.fromUser
                }
              })

              // Create notification for the other user
              const session = await prisma.sessionRequest.findUnique({
                where: { id: client.sessionId },
                select: { studentId: true, mentorId: true }
              })

              if (session) {
                const otherUserId = client.userId === session.studentId ? session.mentorId : session.studentId
                
                await prisma.notification.create({
                  data: {
                    userId: otherUserId,
                    type: 'MESSAGE',
                    title: 'New message received',
                    message: `You have a new message from ${savedMessage.fromUser.name}`
                  }
                })
              }
            } catch (error) {
              console.error('Error saving message:', error)
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Failed to send message'
              }))
            }
          }
          break

        case 'test':
          console.log(`Test message from user ${client.userId}:`, msg)
          // Echo back the test message
          ws.send(JSON.stringify({
            type: 'test_response',
            message: 'Test message received!',
            originalMessage: msg,
            timestamp: Date.now()
          }))
          break

        default:
          console.log('Unknown message type:', msg.type)
          break
      }
    } catch (error) {
      console.error('WebSocket message error:', error)
    }
  })

  ws.on('close', (code, reason) => {
    const client = clients.get(ws)
    console.log(`WebSocket connection closed: ${code} - ${reason}`)
    
    if (client?.sessionId) {
      // Remove from typing users
      const typingSet = typingUsers.get(client.sessionId)
      if (typingSet) {
        typingSet.delete(client.userId!)
        if (typingSet.size === 0) {
          typingUsers.delete(client.sessionId)
        }
      }
      
      // Notify other users
      broadcastToSession(client.sessionId, {
        type: 'user_left',
        userId: client.userId,
        role: client.role
      })
    }
    clients.delete(ws)
  })

  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
  })
})

// Clean up typing indicators every 10 seconds
setInterval(() => {
  const now = Date.now()
  for (const [sessionId, typingSet] of typingUsers.entries()) {
    for (const [ws, client] of clients.entries()) {
      if (client.sessionId === sessionId && client.isTyping && client.lastTypingTime) {
        if (now - client.lastTypingTime > 5000) { // 5 seconds timeout
          typingSet.delete(client.userId!)
          client.isTyping = false
          
          broadcastToSession(sessionId, {
            type: 'typing_stop',
            userId: client.userId,
            role: client.role
          })
        }
      }
    }
    
    if (typingSet.size === 0) {
      typingUsers.delete(sessionId)
    }
  }
}, 10000)

function broadcastToSession(sessionId: number, payload: unknown) {
  const json = JSON.stringify(payload)
  for (const [ws, client] of clients.entries()) {
    if (client.sessionId === sessionId && ws.readyState === WebSocket.OPEN) {
      try { ws.send(json) } catch {}
    }
  }
}

function broadcastToUser(userId: number, payload: unknown) {
  const json = JSON.stringify(payload)
  for (const [ws, client] of clients.entries()) {
    if (client.userId === userId && ws.readyState === WebSocket.OPEN) {
      try { ws.send(json) } catch {}
    }
  }
}

export function broadcastToMentor(mentorId: number, payload: unknown) {
  const json = JSON.stringify(payload)
  for (const [ws, meta] of clients.entries()) {
    if (meta.userId === mentorId && meta.role === 'MENTOR' && ws.readyState === WebSocket.OPEN) {
      try { ws.send(json) } catch {}
    }
  }
}

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`)
})
