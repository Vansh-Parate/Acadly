import { Router } from 'express'
import { prisma } from '../prisma'

const router = Router()

// GET /mentors?subject=math&limit=10
router.get('/', async (req, res) => {
  const subject = String(req.query.subject || '').toLowerCase()
  const limit = Math.min(Number(req.query.limit || 10), 50)

  const mentors = await prisma.user.findMany({
    where: {
      role: 'MENTOR' as any,
      profile: subject
        ? {
            subjects: {
              contains: subject,
              mode: 'insensitive',
            },
          }
        : undefined,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      profile: { select: { subjects: true, averageRating: true, hourlyRate: true, successRate: true } as any },
    },
    take: limit,
    orderBy: { id: 'desc' },
  })

  return res.json({ mentors })
})

export default router


