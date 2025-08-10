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

// GET /progress - Get user's progress entries
router.get('/', requireAuth, async (req, res) => {
  const userId = (req as any).userId as number
  const { subject, type, startDate, endDate, page = 1, limit = 50 } = req.query

  try {
    const where: any = { userId }
    
    if (subject) where.subject = subject
    if (type) where.type = type
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate as string)
      if (endDate) where.date.lte = new Date(endDate as string)
    }

    const progressEntries = await prisma.progressEntry.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    })

    const total = await prisma.progressEntry.count({ where })

    return res.json({
      progressEntries,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching progress entries:', error)
    return res.status(500).json({ error: 'Failed to fetch progress entries' })
  }
})

// POST /progress - Create a new progress entry
router.post('/', requireAuth, async (req, res) => {
  const userId = (req as any).userId as number
  const { subject, score, maxScore, type, description } = req.body

  try {
    const progressEntry = await prisma.progressEntry.create({
      data: {
        userId,
        subject,
        score: Number(score),
        maxScore: Number(maxScore),
        type,
        description
      }
    })

    return res.status(201).json({ progressEntry })
  } catch (error) {
    console.error('Error creating progress entry:', error)
    return res.status(500).json({ error: 'Failed to create progress entry' })
  }
})

// GET /progress/analytics - Get progress analytics
router.get('/analytics', requireAuth, async (req, res) => {
  const userId = (req as any).userId as number
  const { period = '30' } = req.query // days

  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number(period))

    // Get progress entries for the period
    const entries = await prisma.progressEntry.findMany({
      where: {
        userId,
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' }
    })

    // Calculate analytics
    const totalEntries = entries.length
    const averageScore = totalEntries > 0 
      ? entries.reduce((sum, entry) => sum + (entry.score / entry.maxScore), 0) / totalEntries * 100
      : 0

    // Group by subject
    const subjectStats = entries.reduce((acc, entry) => {
      if (!acc[entry.subject]) {
        acc[entry.subject] = { count: 0, totalScore: 0, maxScore: 0 }
      }
      acc[entry.subject].count++
      acc[entry.subject].totalScore += entry.score
      acc[entry.subject].maxScore += entry.maxScore
      return acc
    }, {} as Record<string, { count: number; totalScore: number; maxScore: number }>)

    // Calculate subject averages
    const subjectAverages = Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      averageScore: (stats.totalScore / stats.maxScore) * 100,
      count: stats.count
    }))

    // Weekly progress data
    const weeklyData = []
    for (let i = 0; i < Number(period); i += 7) {
      const weekStart = new Date(startDate)
      weekStart.setDate(weekStart.getDate() + i)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const weekEntries = entries.filter(entry => 
        entry.date >= weekStart && entry.date <= weekEnd
      )

      const weekAverage = weekEntries.length > 0
        ? weekEntries.reduce((sum, entry) => sum + (entry.score / entry.maxScore), 0) / weekEntries.length * 100
        : 0

      weeklyData.push({
        week: `Week ${Math.floor(i / 7) + 1}`,
        averageScore: weekAverage,
        count: weekEntries.length
      })
    }

    return res.json({
      totalEntries,
      averageScore,
      subjectAverages,
      weeklyData,
      period: Number(period)
    })
  } catch (error) {
    console.error('Error fetching progress analytics:', error)
    return res.status(500).json({ error: 'Failed to fetch progress analytics' })
  }
})

// PUT /progress/:id - Update a progress entry
router.put('/:id', requireAuth, async (req, res) => {
  const userId = (req as any).userId as number
  const entryId = Number(req.params.id)
  const { subject, score, maxScore, type, description } = req.body

  try {
    const progressEntry = await prisma.progressEntry.update({
      where: {
        id: entryId,
        userId // Ensure user can only update their own entries
      },
      data: {
        subject,
        score: Number(score),
        maxScore: Number(maxScore),
        type,
        description
      }
    })

    return res.json({ progressEntry })
  } catch (error) {
    console.error('Error updating progress entry:', error)
    return res.status(500).json({ error: 'Failed to update progress entry' })
  }
})

// DELETE /progress/:id - Delete a progress entry
router.delete('/:id', requireAuth, async (req, res) => {
  const userId = (req as any).userId as number
  const entryId = Number(req.params.id)

  try {
    await prisma.progressEntry.delete({
      where: {
        id: entryId,
        userId // Ensure user can only delete their own entries
      }
    })

    return res.json({ message: 'Progress entry deleted' })
  } catch (error) {
    console.error('Error deleting progress entry:', error)
    return res.status(500).json({ error: 'Failed to delete progress entry' })
  }
})

export default router
