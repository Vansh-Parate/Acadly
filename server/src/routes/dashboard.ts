import { Router } from 'express'
import jwt from 'jsonwebtoken'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

router.get('/stats', (req, res) => {
  try {
    const auth = req.headers.authorization
    if (!auth) return res.status(401).json({ error: 'Missing Authorization header' })
    const token = auth.replace('Bearer ', '')
    const payload = jwt.verify(token, JWT_SECRET) as { role: 'STUDENT' | 'MENTOR' | 'ADMIN' }

    if (payload.role === 'STUDENT') {
      return res.json({ totalSessions: 12, completedSessions: 8, pendingSessions: 2, averageRating: 4.8 })
    }
    if (payload.role === 'MENTOR') {
      return res.json({ totalSessions: 127, completedSessions: 127, pendingSessions: 5, averageRating: 4.9 })
    }
    // ADMIN
    return res.json({ totalSessions: 2345, completedSessions: 1999, pendingSessions: 89, averageRating: 4.8 })
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' })
  }
})

export default router
