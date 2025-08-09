import { PrismaClient, UserRole, RequestStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function randomOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

async function main() {
  const reset = process.env.SEED_RESET !== 'false'
  if (reset) {
    await prisma.chatMessage.deleteMany()
    await prisma.sessionRequest.deleteMany()
    await prisma.profile.deleteMany()
    await prisma.user.deleteMany()
  }

  // Seed mentors
  const mentorInfos = [
    { email: 'mentor.alex@example.com', name: 'Alex Mentor', subjects: 'Mathematics, Physics, Calculus' },
    { email: 'mentor.priya@example.com', name: 'Priya Mentor', subjects: 'Chemistry, Biology, Organic Chem' },
    { email: 'mentor.sam@example.com', name: 'Sam Mentor', subjects: 'Computer Science, Data Structures, Algorithms' },
    { email: 'mentor.liu@example.com', name: 'Liu Mentor', subjects: 'Statistics, Linear Algebra' },
    { email: 'mentor.rahul@example.com', name: 'Rahul Mentor', subjects: 'Mechanics, Thermodynamics' },
  ]

  const mentors = [] as { id: number; email: string; name: string }[]
  for (const info of mentorInfos) {
    const user = await prisma.user.create({
      data: { email: info.email, password: await bcrypt.hash('seeded', 12), name: info.name, role: UserRole.MENTOR },
    })
    await prisma.profile.create({
      data: {
        userId: user.id,
        bio: 'Experienced mentor ready to help!',
        subjects: info.subjects,
        rating: Math.round((4 + Math.random()) * 10) / 10,
        hourlyRate: 20 + Math.floor(Math.random() * 15),
        availability: { active: true, slots: [{ day: 'Mon', start: '18:00', end: '20:00' }] },
        successRate: Math.round((0.7 + Math.random() * 0.3) * 100) / 100,
        aiScore: Math.round((0.5 + Math.random() * 0.5) * 100) / 100,
      },
    })
    mentors.push({ id: user.id, email: user.email, name: user.name || 'Mentor' })
  }

  // Seed students
  const studentNames = ['Alice', 'Brian', 'Chloe', 'Derek', 'Eva', 'Farhan', 'Grace', 'Hiro']
  const students = [] as { id: number; email: string; name: string }[]
  for (const name of studentNames) {
    const user = await prisma.user.create({
      data: { email: `${name.toLowerCase()}@example.com`, password: await bcrypt.hash('seeded', 12), name, role: UserRole.STUDENT },
    })
    students.push({ id: user.id, email: user.email, name })
  }

  // Create session requests over the past 6 weeks across different statuses
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const subjects = ['Calculus', 'Mechanics', 'Organic Chem', 'Biology', 'Data Structures', 'Algorithms', 'Statistics', 'Linear Algebra', 'Thermodynamics']
  const statuses: RequestStatus[] = [
    RequestStatus.PENDING,
    RequestStatus.ACCEPTED,
    RequestStatus.FINISHED,
    RequestStatus.CANCELLED,
  ]

  const totalToCreate = 200
  for (let i = 0; i < totalToCreate; i++) {
    const mentor = randomOf(mentors)
    const student = randomOf(students)
    const daysAgo = Math.floor(Math.random() * 42) // within last 6 weeks
    const createdAt = addDays(today, -daysAgo)
    const status = randomOf(statuses)

    await prisma.sessionRequest.create({
      data: {
        studentId: student.id,
        mentorId: mentor.id,
        subject: randomOf(subjects),
        message: 'Need help with this topic',
        status,
        createdAt,
        aiAnalysis: { difficulty: Math.ceil(Math.random() * 5) },
      },
    })
  }

  console.log('✔ Seed complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


