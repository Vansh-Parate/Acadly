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

// GET /scheduled-sessions - Get user's scheduled sessions
router.get('/', requireAuth, async (req, res) => {
  const userId = (req as any).userId as number
  const { status, startDate, endDate, page = 1, limit = 20 } = req.query

  try {
    const where: any = {
      OR: [
        { studentId: userId },
        { mentorId: userId }
      ]
    }

    if (status) where.status = status
    if (startDate || endDate) {
      where.startTime = {}
      if (startDate) where.startTime.gte = new Date(startDate as string)
      if (endDate) where.startTime.lte = new Date(endDate as string)
    }

    const sessions = await prisma.scheduledSession.findMany({
      where,
      orderBy: { startTime: 'asc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        student: {
          select: { id: true, name: true, avatarUrl: true }
        },
        mentor: {
          select: { id: true, name: true, avatarUrl: true }
        }
      }
    })

    const total = await prisma.scheduledSession.count({ where })

    return res.json({
      sessions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching scheduled sessions:', error)
    return res.status(500).json({ error: 'Failed to fetch scheduled sessions' })
  }
})

// POST /scheduled-sessions - Create a new scheduled session
router.post('/', requireAuth, async (req, res) => {
  const userId = (req as any).userId as number
  const { studentId, mentorId, title, description, subject, startTime, endTime, meetingType, location, meetingLink } = req.body

  try {
    // Validate that the user is either the student or mentor
    if (userId !== studentId && userId !== mentorId) {
      return res.status(403).json({ error: 'You can only create sessions for yourself' })
    }

    const session = await prisma.scheduledSession.create({
      data: {
        studentId,
        mentorId,
        title,
        description,
        subject,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        meetingType,
        location,
        meetingLink
      },
      include: {
        student: {
          select: { id: true, name: true, avatarUrl: true }
        },
        mentor: {
          select: { id: true, name: true, avatarUrl: true }
        }
      }
    })

    // Create notifications for both student and mentor
    const otherUserId = userId === studentId ? mentorId : studentId
    
    await prisma.notification.createMany({
      data: [
        {
          userId: studentId,
          type: 'SESSION',
          title: 'New Session Scheduled',
          message: `Your session "${title}" with ${session.mentor.name} has been scheduled`,
          relatedId: session.id,
          relatedType: 'session'
        },
        {
          userId: mentorId,
          type: 'SESSION',
          title: 'New Session Scheduled',
          message: `Your session "${title}" with ${session.student.name} has been scheduled`,
          relatedId: session.id,
          relatedType: 'session'
        }
      ]
    })

    // Send real-time notifications
    broadcastToMentor(studentId, {
      type: 'session_scheduled',
      session
    })
    broadcastToMentor(mentorId, {
      type: 'session_scheduled',
      session
    })

    return res.status(201).json({ session })
  } catch (error) {
    console.error('Error creating scheduled session:', error)
    return res.status(500).json({ error: 'Failed to create scheduled session' })
  }
})

// PUT /scheduled-sessions/:id - Update a scheduled session
router.put('/:id', requireAuth, async (req, res) => {
  const userId = (req as any).userId as number
  const sessionId = Number(req.params.id)
  const updates = req.body

  try {
    // Check if user is part of this session
    const existingSession = await prisma.scheduledSession.findUnique({
      where: { id: sessionId },
      include: {
        student: { select: { id: true, name: true } },
        mentor: { select: { id: true, name: true } }
      }
    })

    if (!existingSession) {
      return res.status(404).json({ error: 'Session not found' })
    }

    if (userId !== existingSession.studentId && userId !== existingSession.mentorId) {
      return res.status(403).json({ error: 'You can only update sessions you are part of' })
    }

    const session = await prisma.scheduledSession.update({
      where: { id: sessionId },
      data: {
        ...updates,
        ...(updates.startTime && { startTime: new Date(updates.startTime) }),
        ...(updates.endTime && { endTime: new Date(updates.endTime) })
      },
      include: {
        student: {
          select: { id: true, name: true, avatarUrl: true }
        },
        mentor: {
          select: { id: true, name: true, avatarUrl: true }
        }
      }
    })

    // Create notification for the other participant
    const otherUserId = userId === existingSession.studentId ? existingSession.mentorId : existingSession.studentId
    const otherUserName = userId === existingSession.studentId ? existingSession.mentor.name : existingSession.student.name

    await prisma.notification.create({
      data: {
        userId: otherUserId,
        type: 'SESSION',
        title: 'Session Updated',
        message: `Your session "${session.title}" with ${otherUserName} has been updated`,
        relatedId: session.id,
        relatedType: 'session'
      }
    })

    // Send real-time notification
    broadcastToMentor(otherUserId, {
      type: 'session_updated',
      session
    })

    return res.json({ session })
  } catch (error) {
    console.error('Error updating scheduled session:', error)
    return res.status(500).json({ error: 'Failed to update scheduled session' })
  }
})

// DELETE /scheduled-sessions/:id - Cancel a scheduled session
router.delete('/:id', requireAuth, async (req, res) => {
  const userId = (req as any).userId as number
  const sessionId = Number(req.params.id)

  try {
    const existingSession = await prisma.scheduledSession.findUnique({
      where: { id: sessionId },
      include: {
        student: { select: { id: true, name: true } },
        mentor: { select: { id: true, name: true } }
      }
    })

    if (!existingSession) {
      return res.status(404).json({ error: 'Session not found' })
    }

    if (userId !== existingSession.studentId && userId !== existingSession.mentorId) {
      return res.status(403).json({ error: 'You can only cancel sessions you are part of' })
    }

    const session = await prisma.scheduledSession.update({
      where: { id: sessionId },
      data: { status: 'CANCELLED' },
      include: {
        student: {
          select: { id: true, name: true, avatarUrl: true }
        },
        mentor: {
          select: { id: true, name: true, avatarUrl: true }
        }
      }
    })

    // Create notification for the other participant
    const otherUserId = userId === existingSession.studentId ? existingSession.mentorId : existingSession.studentId
    const otherUserName = userId === existingSession.studentId ? existingSession.mentor.name : existingSession.student.name

    await prisma.notification.create({
      data: {
        userId: otherUserId,
        type: 'SESSION',
        title: 'Session Cancelled',
        message: `Your session "${session.title}" with ${otherUserName} has been cancelled`,
        relatedId: session.id,
        relatedType: 'session'
      }
    })

    // Send real-time notification
    broadcastToMentor(otherUserId, {
      type: 'session_cancelled',
      session
    })

    return res.json({ session })
  } catch (error) {
    console.error('Error cancelling scheduled session:', error)
    return res.status(500).json({ error: 'Failed to cancel scheduled session' })
  }
})

// GET /scheduled-sessions/calendar - Get sessions for calendar view
router.get('/calendar', requireAuth, async (req, res) => {
  const userId = (req as any).userId as number
  const { startDate, endDate } = req.query

  try {
    const where: any = {
      OR: [
        { studentId: userId },
        { mentorId: userId }
      ]
    }

    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      }
    }

    const sessions = await prisma.scheduledSession.findMany({
      where,
      orderBy: { startTime: 'asc' },
      include: {
        student: {
          select: { id: true, name: true, avatarUrl: true }
        },
        mentor: {
          select: { id: true, name: true, avatarUrl: true }
        }
      }
    })

    return res.json({ sessions })
  } catch (error) {
    console.error('Error fetching calendar sessions:', error)
    return res.status(500).json({ error: 'Failed to fetch calendar sessions' })
  }
})

export default router
