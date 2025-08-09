import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import dashboardRoutes from './routes/dashboard'
import mentorRoutes from './routes/mentor'
import mentorsRoutes from './routes/mentors'
import sessionsRoutes from './routes/sessions'

dotenv.config()

const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN || /^http:\/\/localhost:\d+$/, credentials: true }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/auth', authRoutes)
app.use('/dashboard', dashboardRoutes)
app.use('/mentor', mentorRoutes)
app.use('/mentors', mentorsRoutes)
app.use('/sessions', sessionsRoutes)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`)
})
