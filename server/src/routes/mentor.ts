import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../prisma'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

function requireMentor(req: any, res: any, next: any) {
  try {
    const auth = req.headers.authorization
    if (!auth) return res.status(401).json({ error: 'Missing Authorization header' })
    const token = (auth as string).replace('Bearer ', '')
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; role: 'STUDENT' | 'MENTOR' | 'ADMIN' }
    if (payload.role !== 'MENTOR') return res.status(403).json({ error: 'Mentor role required' })
    ;(req as any).userId = payload.userId
    next()
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// Ensure mentor profile exists
async function ensureProfile(userId: number) {
  const existing = await prisma.profile.findUnique({ where: { userId } })
  if (existing) return existing
  return prisma.profile.create({ data: { userId, bio: null, subjects: '', rating: 0 } })
}

// GET /mentor/profile
router.get('/profile', requireMentor, async (req, res) => {
  const userId = (req as any).userId as number
  const profile = await ensureProfile(userId)
  return res.json({ profile })
})

// PUT /mentor/profile
router.put('/profile', requireMentor, async (req, res) => {
  const userId = (req as any).userId as number
  const { bio, subjects, hourlyRate } = req.body as { bio?: string; subjects?: string; hourlyRate?: number }
  await ensureProfile(userId)
  const updated = await prisma.profile.update({
    where: { userId },
    data: {
      bio: bio ?? undefined,
      subjects: subjects ?? undefined,
      hourlyRate: typeof hourlyRate === 'number' ? hourlyRate : undefined,
    },
  })
  return res.json({ profile: updated })
})

// GET /mentor/availability
router.get('/availability', requireMentor, async (req, res) => {
  const userId = (req as any).userId as number
  await ensureProfile(userId)
  const profile = await prisma.profile.findUnique({ where: { userId } })
  const availability = (profile?.availability as any) || { active: false, slots: [] }
  return res.json({ availability })
})

// PUT /mentor/availability
router.put('/availability', requireMentor, async (req, res) => {
  const userId = (req as any).userId as number
  const { active, slots } = req.body as { active?: boolean; slots?: Array<{ day: string; start: string; end: string }> }
  await ensureProfile(userId)
  const profile = await prisma.profile.findUnique({ where: { userId } })
  const current = (profile?.availability as any) || { active: false, slots: [] }
  const next = {
    active: typeof active === 'boolean' ? active : current.active,
    slots: Array.isArray(slots) ? slots : current.slots,
  }
  const updated = await prisma.profile.update({ where: { userId }, data: { availability: next } })
  return res.json({ availability: updated.availability })
})

// GET /mentor/requests (pending)
router.get('/requests', requireMentor, async (req, res) => {
  const userId = (req as any).userId as number
  const requests = await prisma.sessionRequest.findMany({
    where: { mentorId: userId, status: 'PENDING' as any },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      studentId: true,
      subject: true,
      message: true,
      createdAt: true,
      student: { select: { email: true, name: true } },
    },
  })
  return res.json({ requests })
})

// GET /mentor/upcoming-sessions (accepted)
router.get('/upcoming-sessions', requireMentor, async (req, res) => {
  const userId = (req as any).userId as number
  const sessions = await prisma.sessionRequest.findMany({
    where: { mentorId: userId, status: 'ACCEPTED' as any },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      studentId: true,
      subject: true,
      message: true,
      createdAt: true,
      student: { select: { email: true, name: true } },
    },
  })
  return res.json({ sessions })
})

// PUT /mentor/requests/:id/accept
router.put('/requests/:id/accept', requireMentor, async (req, res) => {
  const userId = (req as any).userId as number
  const id = Number(req.params.id)
  const request = await prisma.sessionRequest.findUnique({ where: { id } })
  if (!request || request.mentorId !== userId) return res.status(404).json({ error: 'Request not found' })
  const updated = await prisma.sessionRequest.update({ where: { id }, data: { status: 'ACCEPTED' as any } })
  return res.json({ request: updated })
})

// PUT /mentor/requests/:id/decline
router.put('/requests/:id/decline', requireMentor, async (req, res) => {
  const userId = (req as any).userId as number
  const id = Number(req.params.id)
  const request = await prisma.sessionRequest.findUnique({ where: { id } })
  if (!request || request.mentorId !== userId) return res.status(404).json({ error: 'Request not found' })
  const updated = await prisma.sessionRequest.update({ where: { id }, data: { status: 'REJECTED' as any } })
  return res.json({ request: updated })
})

// GET /mentor/overview
router.get('/overview', requireMentor, async (req, res) => {
  const userId = (req as any).userId as number
  const [totalSessions, acceptedSessions, completedSessions, cancelledSessions, distinctStudents, subjectsThisMonth] = await Promise.all([
    prisma.sessionRequest.count({ where: { mentorId: userId } }),
    prisma.sessionRequest.count({ where: { mentorId: userId, status: 'ACCEPTED' as any } }),
    prisma.sessionRequest.count({ where: { mentorId: userId, status: 'FINISHED' as any } }),
    prisma.sessionRequest.count({ where: { mentorId: userId, status: 'CANCELLED' as any } }),
    prisma.sessionRequest.findMany({
      where: { mentorId: userId },
      select: { studentId: true },
      distinct: ['studentId'],
    }).then((rows) => rows.length),
    // subjects for current month for top subject calc
    (() => {
      const startOfMonth = new Date()
      startOfMonth.setHours(0, 0, 0, 0)
      startOfMonth.setDate(1)
      return prisma.sessionRequest.findMany({
        where: { mentorId: userId, createdAt: { gte: startOfMonth } },
        select: { subject: true },
      })
    })(),
  ])

  const startOfWeek = new Date()
  startOfWeek.setHours(0, 0, 0, 0)
  const day = startOfWeek.getDay()
  startOfWeek.setDate(startOfWeek.getDate() - day)
  const startOfMonth = new Date()
  startOfMonth.setHours(0, 0, 0, 0)
  startOfMonth.setDate(1)

  const [sessionsThisWeek, sessionsThisMonth] = await Promise.all([
    prisma.sessionRequest.count({ where: { mentorId: userId, createdAt: { gte: startOfWeek } } }),
    prisma.sessionRequest.count({ where: { mentorId: userId, createdAt: { gte: startOfMonth } } }),
  ])

  const attendanceProgress = totalSessions === 0 ? 0 : Math.round((completedSessions / totalSessions) * 100)
  const rewardPoints = completedSessions * 5
  const topSubject = (() => {
    const map: Record<string, number> = {}
    for (const s of subjectsThisMonth) {
      const key = (s.subject || '').trim()
      if (!key) continue
      map[key] = (map[key] || 0) + 1
    }
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1])
    return sorted[0]?.[0] || null
  })()

  return res.json({
    totalMentees: distinctStudents,
    upcomingSessions: acceptedSessions, // treating accepted as upcoming
    attendanceProgress,
    rewardPoints,
    finishedSessions: completedSessions,
    cancelledSessions,
    topSubject,
    totals: {
      totalSessions,
      acceptedSessions,
      thisMonth: sessionsThisMonth,
      thisWeek: sessionsThisWeek,
    },
  })
})

export default router


