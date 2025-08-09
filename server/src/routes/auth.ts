import { Router } from 'express'
import { prisma } from '../prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body as {
      email: string
      password: string
      name?: string
      role?: 'STUDENT' | 'MENTOR' | 'ADMIN'
    }

    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ error: 'User already exists' })

    const hashed = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        role: (role || 'STUDENT') as any,
      },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, createdAt: true },
    })

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    })

    return res.status(201).json({ message: 'User created successfully', user, token })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string }
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    const safeUser = { id: user.id, email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl, createdAt: user.createdAt }

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    })

    return res.json({ user: safeUser, token })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/verify', async (req, res) => {
  try {
    const auth = req.headers.authorization
    if (!auth) return res.status(401).json({ error: 'Missing Authorization header' })
    const token = auth.replace('Bearer ', '')

    const payload = jwt.verify(token, JWT_SECRET) as { userId: number }
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, createdAt: true },
    })
    if (!user) return res.status(401).json({ error: 'Invalid token' })

    return res.json({ user })
  } catch (e) {
    console.error(e)
    return res.status(401).json({ error: 'Invalid token' })
  }
})

export default router
