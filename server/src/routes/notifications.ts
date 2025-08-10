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

// GET /notifications - Get user's notifications
router.get('/', requireAuth, async (req, res) => {
  const userId = (req as any).userId as number
  const { page = 1, limit = 20, unreadOnly = false } = req.query

  try {
    const where = {
      userId,
      ...(unreadOnly === 'true' && { isRead: false })
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true }
        }
      }
    })

    const total = await prisma.notification.count({ where })
    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    })

    return res.json({
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      unreadCount
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return res.status(500).json({ error: 'Failed to fetch notifications' })
  }
})

// POST /notifications - Create a new notification
router.post('/', requireAuth, async (req, res) => {
  const { userId, type, title, message, relatedId, relatedType } = req.body

  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        relatedId,
        relatedType
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true }
        }
      }
    })

    // Send real-time notification
    broadcastToMentor(userId, {
      type: 'new_notification',
      notification
    })

    return res.status(201).json({ notification })
  } catch (error) {
    console.error('Error creating notification:', error)
    return res.status(500).json({ error: 'Failed to create notification' })
  }
})

// PUT /notifications/:id/read - Mark notification as read
router.put('/:id/read', requireAuth, async (req, res) => {
  const userId = (req as any).userId as number
  const notificationId = Number(req.params.id)

  try {
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId // Ensure user can only mark their own notifications as read
      },
      data: { isRead: true }
    })

    return res.json({ notification })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return res.status(500).json({ error: 'Failed to mark notification as read' })
  }
})

// PUT /notifications/read-all - Mark all notifications as read
router.put('/read-all', requireAuth, async (req, res) => {
  const userId = (req as any).userId as number

  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    })

    return res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return res.status(500).json({ error: 'Failed to mark notifications as read' })
  }
})

// DELETE /notifications/:id - Delete a notification
router.delete('/:id', requireAuth, async (req, res) => {
  const userId = (req as any).userId as number
  const notificationId = Number(req.params.id)

  try {
    await prisma.notification.delete({
      where: {
        id: notificationId,
        userId // Ensure user can only delete their own notifications
      }
    })

    return res.json({ message: 'Notification deleted' })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return res.status(500).json({ error: 'Failed to delete notification' })
  }
})

export default router
