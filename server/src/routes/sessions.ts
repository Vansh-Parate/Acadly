import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../prisma'

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

function requireMentor(req: any, res: any, next: any) {
  requireAuth(req, res, (err?: any) => {
    if (err) return
    const role = (req as any).role as string
    if (role !== 'MENTOR') return res.status(403).json({ error: 'Mentor role required' })
    next()
  })
}

// POST /sessions/request { mentorId, subject, message }
router.post('/request', requireAuth, async (req, res) => {
  const studentId = (req as any).userId as number
  const { mentorId, subject, message } = req.body as { mentorId: number; subject: string; message?: string }
  if (!mentorId || !subject) return res.status(400).json({ error: 'mentorId and subject are required' })
  const created = await prisma.sessionRequest.create({
    data: { studentId, mentorId, subject, message },
    select: { id: true, studentId: true, mentorId: true, subject: true, status: true, createdAt: true },
  })
  return res.status(201).json({ request: created })
})

// GET /sessions/history
router.get('/history', requireAuth, async (req, res) => {
  const userId = (req as any).userId as number
  const role = (req as any).role as 'STUDENT' | 'MENTOR' | 'ADMIN'
  const where = role === 'MENTOR' ? { mentorId: userId } : { studentId: userId }
  const sessions = await prisma.sessionRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      subject: true,
      status: true,
      createdAt: true,
      studentId: true,
      mentorId: true,
      student: { select: { email: true, name: true } },
    },
  })
  return res.json({ sessions })
})

// POST /sessions/create-by-email (mentor creates a session with a student by email)
router.post('/create-by-email', requireMentor, async (req, res) => {
  const mentorId = (req as any).userId as number
  const { studentEmail, subject, message, scheduledAt } = req.body as { studentEmail: string; subject: string; message?: string; scheduledAt?: string }
  if (!studentEmail || !subject) return res.status(400).json({ error: 'studentEmail and subject are required' })

  const student = await prisma.user.findUnique({ where: { email: studentEmail } })
  if (!student) return res.status(404).json({ error: 'Student not found' })

  const created = await prisma.sessionRequest.create({
    data: { studentId: student.id, mentorId, subject, message, status: 'ACCEPTED' as any, createdAt: scheduledAt ? new Date(scheduledAt) : undefined },
    select: { id: true, subject: true, status: true, createdAt: true, studentId: true, mentorId: true, student: { select: { email: true, name: true } } },
  })
  return res.status(201).json({ request: created })
})

export default router


