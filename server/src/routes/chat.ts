import express from 'express'
import { prisma } from '../prisma'
import jwt from 'jsonwebtoken'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

// Authentication middleware function
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

// GET /:sessionId/messages - Get messages for a specific session
router.get('/:sessionId/messages', requireAuth, async (req, res) => {
  const userId = (req as any).userId as number
  const sessionId = parseInt(req.params.sessionId)

  try {
    // Verify user has access to this session
    const session = await prisma.sessionRequest.findFirst({
      where: {
        id: sessionId,
        OR: [
          { studentId: userId },
          { mentorId: userId }
        ]
      }
    })

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      include: {
        fromUser: {
          select: { id: true, name: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return res.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

// POST /:sessionId/message - Send a message (legacy endpoint, now handled by WebSocket)
router.post('/:sessionId/message', requireAuth, async (req, res) => {
  const userId = (req as any).userId as number
  const sessionId = parseInt(req.params.sessionId)
  const { message, fileUrl, fileName, fileSize, fileType } = req.body

  try {
    // Verify user has access to this session
    const session = await prisma.sessionRequest.findFirst({
      where: {
        id: sessionId,
        OR: [
          { studentId: userId },
          { mentorId: userId }
        ]
      }
    })

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    const savedMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        fromUserId: userId,
        message,
        isAiMessage: false,
        aiTopics: [],
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

    // Create notification for the other user
    const otherUserId = userId === session.studentId ? session.mentorId : session.studentId
    
    await prisma.notification.create({
      data: {
        userId: otherUserId,
        type: 'MESSAGE',
        title: 'New message received',
        message: `You have a new message from ${savedMessage.fromUser.name}`,
        isRead: false,
        relatedId: sessionId,
        relatedType: 'session'
      }
    })

    return res.json({ message: savedMessage })
  } catch (error) {
    console.error('Error sending message:', error)
    return res.status(500).json({ error: 'Failed to send message' })
  }
})

// GET /:sessionId/typing - Get typing status (for compatibility)
router.get('/:sessionId/typing', requireAuth, async (req, res) => {
  // This is now handled by WebSocket, but keeping for compatibility
  return res.json({ typing: [] })
})

export default router


