import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../prisma'
import { broadcastToMentor } from '../index'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

function requireAuth(req: any, res: any, next: any) {
  try {
    const auth = req.headers.authorization
    if (!auth) return res.status(401).json({ error: 'Missing Authorization header' })
    const token = (auth as string).replace('Bearer ', '')
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; role: 'STUDENT' | 'MENTOR' | 'ADMIN' }
    ;(req as any).userId = payload.userId
    ;(req as any).role = payload.role
    next()
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// GET /chat/:sessionId/messages
router.get('/:sessionId/messages', requireAuth, async (req, res) => {
  const sessionId = Number(req.params.sessionId)
  const { page = 1, limit = 50 } = req.query

  try {
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        fromUser: {
          select: { id: true, name: true, avatarUrl: true }
        }
      }
    })

    const total = await prisma.chatMessage.count({ where: { sessionId } })

    return res.json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

// POST /chat/:sessionId/message { message, fileUrl?, fileName?, fileSize?, fileType? }
router.post('/:sessionId/message', requireAuth, async (req, res) => {
  const userId = (req as any).userId as number
  const { message, fileUrl, fileName, fileSize, fileType } = req.body as { 
    message: string; 
    fileUrl?: string; 
    fileName?: string; 
    fileSize?: number; 
    fileType?: string; 
  }
  const sessionId = Number(req.params.sessionId)
  
  if (!message || !sessionId) return res.status(400).json({ error: 'message and sessionId required' })

  try {
    const session = await prisma.sessionRequest.findUnique({ 
      where: { id: sessionId },
      include: {
        student: { select: { id: true, name: true } },
        mentor: { select: { id: true, name: true } }
      }
    })
    
    if (!session) return res.status(404).json({ error: 'Session not found' })

    const created = await prisma.chatMessage.create({
      data: { 
        sessionId, 
        fromUserId: userId, 
        message,
        fileUrl,
        fileName,
        fileSize,
        fileType
      },
      include: {
        fromUser: {
          select: { id: true, name: true, avatarUrl: true }
        }
      }
    })

    // Create notification for the other participant
    const otherUserId = userId === session.studentId ? session.mentorId : session.studentId
    const otherUserName = userId === session.studentId ? session.mentor.name : session.student.name
    const senderName = userId === session.studentId ? session.student.name : session.mentor.name

    await prisma.notification.create({
      data: {
        userId: otherUserId,
        type: 'MESSAGE',
        title: `New message from ${senderName}`,
        message: fileUrl ? `${senderName} sent you a file: ${fileName}` : message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        relatedId: sessionId,
        relatedType: 'session'
      }
    })

    // Realtime: notify the other participant
    broadcastToMentor(otherUserId, { 
      type: 'chat_message', 
      message: created, 
      sessionId 
    })

    return res.status(201).json({ message: created })
  } catch (error) {
    console.error('Error creating message:', error)
    return res.status(500).json({ error: 'Failed to create message' })
  }
})

// GET /chat/sessions - Get user's chat sessions
router.get('/sessions', requireAuth, async (req, res) => {
  const userId = (req as any).userId as number

  try {
    const sessions = await prisma.sessionRequest.findMany({
      where: {
        OR: [
          { studentId: userId },
          { mentorId: userId }
        ],
        status: { in: ['ACCEPTED', 'FINISHED'] }
      },
      include: {
        student: {
          select: { id: true, name: true, avatarUrl: true }
        },
        mentor: {
          select: { id: true, name: true, avatarUrl: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            fromUser: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.json({ sessions })
  } catch (error) {
    console.error('Error fetching chat sessions:', error)
    return res.status(500).json({ error: 'Failed to fetch chat sessions' })
  }
})

export default router


