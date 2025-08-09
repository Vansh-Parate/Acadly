import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

router.get('/stats', async (req, res) => {
  try {
    const auth = req.headers.authorization
    if (!auth) return res.status(401).json({ error: 'Missing Authorization header' })
    const token = auth.replace('Bearer ', '')
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; role: 'STUDENT' | 'MENTOR' | 'ADMIN' }

    if (payload.role === 'STUDENT') {
      const stats = await getStudentStats(payload.userId)
      return res.json(stats)
    }
    if (payload.role === 'MENTOR') {
      const stats = await getMentorStats(payload.userId)
      return res.json(stats)
    }
    // ADMIN
    const stats = await getAdminStats()
    return res.json(stats)
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' })
  }
})

// Get student sessions with detailed information
router.get('/student/sessions', async (req, res) => {
  try {
    const auth = req.headers.authorization
    if (!auth) return res.status(401).json({ error: 'Missing Authorization header' })
    const token = auth.replace('Bearer ', '')
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; role: string }

    if (payload.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Access denied. Students only.' })
    }

    const sessions = await prisma.sessionRequest.findMany({
      where: { studentId: payload.userId },
      include: {
        mentor: {
          include: {
            profile: true
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedSessions = sessions.map(session => ({
      id: session.id,
      subject: session.subject,
      mentor: {
        id: session.mentor.id,
        name: session.mentor.name || 'Unknown',
        avatarUrl: session.mentor.avatarUrl,
        rating: session.mentor.profile?.rating || 0,
        hourlyRate: session.mentor.profile?.hourlyRate || 0
      },
      status: session.status,
      message: session.message || '',
      urgencyScore: session.urgencyScore,
      matchScore: session.matchScore || 0,
      createdAt: session.createdAt.toISOString(),
      scheduledAt: null, // TODO: Add scheduling functionality
      duration: null, // TODO: Add duration tracking
      totalCost: null, // TODO: Add cost calculation
      progress: getProgressForSession(session.status),
      topics: extractTopicsFromMessage(session.message || ''),
      aiAnalysis: (() => {
        const value = session.aiAnalysis as unknown
        if (!value) return null
        if (typeof value === 'string') {
          try { return JSON.parse(value) } catch { return value }
        }
        // Already a JSON object (Prisma JsonValue)
        return value
      })()
    }))

    res.json(formattedSessions)
  } catch (error) {
    console.error('Error fetching student sessions:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get detailed student statistics
router.get('/student/stats', async (req, res) => {
  try {
    const auth = req.headers.authorization
    if (!auth) return res.status(401).json({ error: 'Missing Authorization header' })
    const token = auth.replace('Bearer ', '')
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; role: string }

    if (payload.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Access denied. Students only.' })
    }

    const stats = await getStudentStats(payload.userId)
    res.json(stats)
  } catch (error) {
    console.error('Error fetching student stats:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

async function getStudentStats(userId: number) {
  const sessions = await prisma.sessionRequest.findMany({
    where: { studentId: userId }
  })

  const completedSessions = sessions.filter(s => s.status === 'FINISHED').length
  const pendingSessions = sessions.filter(s => s.status === 'PENDING').length
  const totalSessions = sessions.length

  // Calculate total spent (mock calculation for now)
  const totalSpent = completedSessions * 50 // Assuming $50 per session

  // Get subject breakdown
  const subjects: { [key: string]: number } = {}
  sessions.forEach(session => {
    subjects[session.subject] = (subjects[session.subject] || 0) + 1
  })

  // Mock monthly spending data
  const monthlySpending = [
    { month: 'Jan', amount: Math.floor(Math.random() * 200) + 50 },
    { month: 'Dec', amount: Math.floor(Math.random() * 200) + 50 },
    { month: 'Nov', amount: Math.floor(Math.random() * 200) + 50 }
  ]

  return {
    totalSessions,
    completedSessions,
    pendingSessions,
    totalSpent,
    averageRating: 4.8, // TODO: Calculate from actual ratings
    totalHours: completedSessions * 1.5, // Assuming 1.5 hours per session
    subjects,
    monthlySpending
  }
}

async function getMentorStats(userId: number) {
  const sessions = await prisma.sessionRequest.findMany({
    where: { mentorId: userId }
  })

  const completedSessions = sessions.filter(s => s.status === 'FINISHED').length
  const pendingSessions = sessions.filter(s => s.status === 'PENDING').length
  const totalSessions = sessions.length

  return {
    totalSessions,
    completedSessions,
    pendingSessions,
    averageRating: 4.9 // TODO: Calculate from actual ratings
  }
}

async function getAdminStats() {
  const totalUsers = await prisma.user.count()
  const activeSessions = await prisma.sessionRequest.count({
    where: { status: { in: ['PENDING', 'ACCEPTED'] } }
  })

  return {
    totalSessions: totalUsers * 2, // Mock calculation
    completedSessions: totalUsers * 1.5,
    pendingSessions: activeSessions,
    averageRating: 4.8
  }
}

function getProgressForSession(status: string): number {
  switch (status) {
    case 'PENDING': return 25
    case 'ACCEPTED': return 50
    case 'FINISHED': return 100
    case 'REJECTED': return 0
    case 'CANCELLED': return 0
    default: return 0
  }
}

function extractTopicsFromMessage(message: string): string[] {
  // Simple topic extraction - in production, use AI/ML for better extraction
  const commonTopics = [
    'Calculus', 'Algebra', 'Geometry', 'Trigonometry',
    'Chemistry', 'Organic Chemistry', 'Physical Chemistry',
    'Physics', 'Mechanics', 'Thermodynamics', 'Quantum Mechanics',
    'Biology', 'Anatomy', 'Genetics', 'Ecology',
    'Computer Science', 'Programming', 'Data Structures', 'Algorithms'
  ]
  
  return commonTopics.filter(topic => 
    message.toLowerCase().includes(topic.toLowerCase())
  ).slice(0, 3) // Limit to 3 topics
}

export default router
