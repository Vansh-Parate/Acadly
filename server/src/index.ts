import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import dashboardRoutes from './routes/dashboard'
import mentorRoutes from './routes/mentor'
import mentorsRoutes from './routes/mentors'
import sessionsRoutes from './routes/sessions'
import chatRoutes from './routes/chat'
import http from 'http'
import { WebSocketServer, WebSocket, RawData } from 'ws'

dotenv.config()

const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN || /^http:\/\/localhost:\d+$/, credentials: true }))
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

const server = http.createServer(app)

// WebSocket setup
const wss = new WebSocketServer({ server })
type Client = { userId?: number; role?: 'STUDENT' | 'MENTOR' | 'ADMIN' }
const clients = new Map<WebSocket, Client>()

wss.on('connection', (ws: WebSocket) => {
  clients.set(ws, {})
  ws.on('message', (raw: RawData) => {
    try {
      const msg = JSON.parse(String(raw)) as { type: string; userId?: number; role?: Client['role'] }
      if (msg.type === 'auth') {
        clients.set(ws, { userId: msg.userId, role: msg.role })
      }
    } catch {
      // ignore malformed payloads
    }
  })
  ws.on('close', () => clients.delete(ws))
})

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
