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
  const messages = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
    select: { id: true, sessionId: true, fromUserId: true, message: true, createdAt: true },
  })
  return res.json({ messages })
})

// POST /chat/:sessionId/message { message }
router.post('/:sessionId/message', requireAuth, async (req, res) => {
  const userId = (req as any).userId as number
  const { message } = req.body as { message: string }
  const sessionId = Number(req.params.sessionId)
  if (!message || !sessionId) return res.status(400).json({ error: 'message and sessionId required' })

  const session = await prisma.sessionRequest.findUnique({ where: { id: sessionId } })
  if (!session) return res.status(404).json({ error: 'Session not found' })

  const created = await prisma.chatMessage.create({
    data: { sessionId, fromUserId: userId, message },
    select: { id: true, sessionId: true, fromUserId: true, message: true, createdAt: true },
  })

  // Realtime: notify mentor or student depending on sender
  const targetMentorId = userId === session.mentorId ? session.studentId : session.mentorId
  broadcastToMentor(targetMentorId, { type: 'chat_message', message: created, sessionId })

  return res.status(201).json({ message: created })
})

export default router


