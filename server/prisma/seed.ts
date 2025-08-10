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

function addHours(base: Date, hours: number): Date {
  const d = new Date(base)
  d.setHours(d.getHours() + hours)
  return d
}

async function main() {
  const reset = process.env.SEED_RESET !== 'false'
  if (reset) {
    // Delete in order to respect foreign key constraints
    await prisma.chatMessage.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.progressEntry.deleteMany()
    await prisma.scheduledSession.deleteMany()
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

  const sessionRequests = []
  const totalToCreate = 50
  for (let i = 0; i < totalToCreate; i++) {
    const mentor = randomOf(mentors)
    const student = randomOf(students)
    const daysAgo = Math.floor(Math.random() * 42) // within last 6 weeks
    const createdAt = addDays(today, -daysAgo)
    const status = randomOf(statuses)

    const sessionRequest = await prisma.sessionRequest.create({
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
    sessionRequests.push(sessionRequest)
  }

  // Create scheduled sessions
  const scheduledSessions = []
  for (let i = 0; i < 30; i++) {
    const mentor = randomOf(mentors)
    const student = randomOf(students)
    const daysFromNow = Math.floor(Math.random() * 30) // within next 30 days
    const startTime = addDays(today, daysFromNow)
    startTime.setHours(9 + Math.floor(Math.random() * 12), 0, 0, 0) // 9 AM to 9 PM
    const endTime = addHours(startTime, 1 + Math.floor(Math.random() * 2)) // 1-3 hour sessions

    const session = await prisma.scheduledSession.create({
      data: {
        studentId: student.id,
        mentorId: mentor.id,
        title: `${randomOf(subjects)} Session`,
        description: 'Regular tutoring session',
        subject: randomOf(subjects),
        startTime,
        endTime,
        status: randomOf(['SCHEDULED', 'COMPLETED', 'CANCELLED']),
        meetingType: randomOf(['VIDEO', 'AUDIO', 'IN_PERSON']),
        location: randomOf(['Zoom', 'Google Meet', 'Campus Library', 'Coffee Shop']),
        meetingLink: randomOf(['https://zoom.us/j/123456789', 'https://meet.google.com/abc-defg-hij', null]),
      },
    })
    scheduledSessions.push(session)
  }

  // Create chat messages for accepted/finished sessions
  const acceptedSessions = sessionRequests.filter(s => s.status === RequestStatus.ACCEPTED || s.status === RequestStatus.FINISHED)
  for (const session of acceptedSessions.slice(0, 20)) { // Limit to 20 sessions to avoid too many messages
    const messageCount = 5 + Math.floor(Math.random() * 10) // 5-15 messages per session
    for (let i = 0; i < messageCount; i++) {
      const isStudent = Math.random() > 0.5
      const senderId = isStudent ? session.studentId : session.mentorId
      const messageTime = addHours(session.createdAt, i * 2) // Messages every 2 hours

      await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          fromUserId: senderId,
          message: randomOf([
            'Hi! I have a question about the homework.',
            'Can you explain this concept again?',
            'Thanks for the help!',
            'I think I understand now.',
            'Could you send me the notes?',
            'When is our next session?',
            'I found this helpful resource.',
            'The assignment is due tomorrow.',
            'Can we reschedule?',
            'Great session today!'
          ]),
          isAiMessage: false,
          aiTopics: [],
          createdAt: messageTime,
        },
      })
    }
  }

  // Create progress entries for students
  const progressTypes = ['QUIZ', 'ASSIGNMENT', 'PROJECT', 'SESSION', 'MILESTONE']
  for (const student of students) {
    const entryCount = 10 + Math.floor(Math.random() * 20) // 10-30 entries per student
    for (let i = 0; i < entryCount; i++) {
      const daysAgo = Math.floor(Math.random() * 90) // within last 90 days
      const entryDate = addDays(today, -daysAgo)
      const score = 60 + Math.floor(Math.random() * 40) // 60-100 score
      const maxScore = 100

      await prisma.progressEntry.create({
        data: {
          userId: student.id,
          subject: randomOf(subjects),
          score,
          maxScore,
          type: randomOf(progressTypes),
          description: randomOf([
            'Midterm exam',
            'Homework assignment',
            'Final project',
            'Practice quiz',
            'Lab report',
            'Group presentation',
            'Research paper',
            'Online assessment'
          ]),
          date: entryDate,
        },
      })
    }
  }

  // Create notifications for users
  const notificationTypes = ['MESSAGE', 'SESSION', 'RATING', 'REMINDER', 'SYSTEM']
  for (const user of [...students, ...mentors]) {
    const notificationCount = 5 + Math.floor(Math.random() * 10) // 5-15 notifications per user
    for (let i = 0; i < notificationCount; i++) {
      const daysAgo = Math.floor(Math.random() * 30) // within last 30 days
      const createdAt = addDays(today, -daysAgo)
      const type = randomOf(notificationTypes)
      
      let title, message
      switch (type) {
        case 'MESSAGE':
          title = 'New message received'
          message = 'You have a new message from your mentor/student'
          break
        case 'SESSION':
          title = 'Session reminder'
          message = 'Your session starts in 1 hour'
          break
        case 'RATING':
          title = 'New rating received'
          message = 'You received a 5-star rating!'
          break
        case 'REMINDER':
          title = 'Homework reminder'
          message = 'Don\'t forget to complete your assignment'
          break
        case 'SYSTEM':
          title = 'System update'
          message = 'New features are available'
          break
        default:
          title = 'Notification'
          message = 'You have a new notification'
      }

      await prisma.notification.create({
        data: {
          userId: user.id,
          type: type as any,
          title,
          message,
          isRead: Math.random() > 0.3, // 70% read
          relatedId: randomOf([1, 2, 3, 4, 5]),
          relatedType: randomOf(['session', 'message', 'rating']),
          createdAt,
        },
      })
    }
  }

  // Create an admin user
  await prisma.user.create({
    data: { 
      email: 'admin@example.com', 
      password: await bcrypt.hash('admin123', 12), 
      name: 'Admin User', 
      role: UserRole.ADMIN 
    },
  })

  console.log('✔ Seed complete with comprehensive data for all features!')
  console.log('📊 Created:')
  console.log(`   - ${mentors.length} mentors`)
  console.log(`   - ${students.length} students`)
  console.log(`   - ${sessionRequests.length} session requests`)
  console.log(`   - ${scheduledSessions.length} scheduled sessions`)
  console.log(`   - Chat messages for ${acceptedSessions.length} sessions`)
  console.log(`   - Progress entries for all students`)
  console.log(`   - Notifications for all users`)
  console.log('🔑 Login credentials:')
  console.log('   - Students: alice@example.com, brian@example.com, etc. (password: seeded)')
  console.log('   - Mentors: mentor.alex@example.com, mentor.priya@example.com, etc. (password: seeded)')
  console.log('   - Admin: admin@example.com (password: admin123)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


