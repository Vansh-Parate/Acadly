---

## File structure (Complete)

```
/tutoring-platform
  /client
    /public
      favicon.ico
      notification-sound.mp3
    /src
      /components
        /common
          LoaderSpinner.jsx
          EmptyState.jsx
          ErrorBoundary.jsx
          NotificationToast.jsx
        /student
          QuestionInput.jsx
          AIAssistant.jsx
          MatchingResults.jsx
          MentorCard.jsx
          QuickTopics.jsx
        /mentor  
          AvailabilityToggle.jsx
          RequestCard.jsx
          EarningsOverview.jsx
          SessionTools.jsx
          PerformanceInsights.jsx
        /chat
          ChatInterface.jsx
          ChatMessage.jsx
          TypingIndicator.jsx
          SessionTimer.jsx
        /shared
          UserAvatar.jsx
          RatingStars.jsx
          SubjectBadge.jsx
          ProtectedRoute.jsx
      /pages
        LandingPage.jsx
        auth/
          LoginPage.jsx
          RegisterPage.jsx
        student/
          StudentDashboard.jsx
          SessionHistory.jsx
        mentor/
          MentorDashboard.jsx
          MentorProfile.jsx
          Analytics.jsx
        ChatPage.jsx
        ProfileEditor.jsx
      /hooks
        useAuth.js
        useSocket.js
        useAI.js
        useNotifications.js
        useMentorSearch.js
      /services
        api.js
        aiService.js
        socketService.js
        notificationService.js
      /utils
        formatters.js
        validators.js
        constants.js
      /styles
        globals.css
        tailwind.css
      App.jsx
      main.jsx

  /server
    /prisma
      schema.prisma
      migrations/
      seed.js
    /src
      /controllers
        authController.js
        profileController.js
        sessionController.js
        chatController.js
        aiController.js
        mentorController.js
      /routes
        auth.js
        profile.js
        sessions.js
        chat.js
        ai.js
        mentors.js
      /services
        authService.js
        profileService.js
        sessionService.js
        aiService.js
        matchingService.js
        notificationService.js
        paymentService.js
      /middleware
        auth.js
        validation.js
        rateLimit.js
        errorHandler.js
      /utils
        jwt.js
        bcrypt```

---

## **DETAILED MENTOR USER FLOW** 👨‍🏫

### **Mentor Journey Overview**

```
Registration → Profile Setup → Availability Setting → Receive Requests → Help Students → Earn Money → Optimize Performance
```

### **1. Mentor Onboarding Flow**

```
REGISTRATION:
├── Basic info: name, email, password
├── Role selection: "I want to help students as a mentor"
├── University verification: email domain or manual verification
└── Email confirmation

PROFILE CREATION:
├── Photo upload
├── Academic background:
│   ├── University/College name
│   ├── Year: "3rd Year", "Graduate", "Alumni"
│   ├── Major/Degree: "Computer Science", "Mathematics"
│   └── GPA (optional): builds credibility
├── Subject expertise:
│   ├── Primary subjects: Select from list
│   ├── Proficiency levels: Beginner/Intermediate/Advanced per subject
│   ├── Specific topics: "I'm great at Calculus, Linear Algebra, Statistics"
│   └── Sample solutions: Upload 2-3 examples of your explanations
├── Mentor preferences:
│   ├── Student levels: High School, Undergraduate, Graduate
│   ├── Session types: Quick help, Detailed tutoring, Exam prep
│   ├── Pricing model: Free only, Paid only, or Mixed (3 free then paid)
│   └── Max sessions per day: 5, 10, 15, Unlimited
├── Bio & motivation:
│   ├── "Why do you want to mentor?"
│   ├── "What's your teaching style?"
│   └── "Fun fact about yourself"

VERIFICATION & APPROVAL:
├── AI-generated subject quiz (optional)
├── Review by admin team
├── Trial period: first 5 sessions monitored
└── Full mentor status activated
```

### **2. Daily Mentor Experience**

```
LOGIN → AVAILABILITY CHECK:
├── Dashboard shows yesterday's earnings and ratings
├── "Ready to help students today?" prompt
├── Quick availability toggle: ON/OFF
├── Set hours: "Available for next 3 hours"
└── Subject focus: "Taking Math questions only today"

WAITING FOR REQUESTS:
├── Dashboard shows real-time stats
├── Background app listens for requests
├── Mentor can browse:
│   ├── Platform analytics: "20 students online now"
│   ├── Recent feedback from students
│   ├── AI insights about performance
│   └── Tips for better earnings

RECEIVING REQUEST NOTIFICATION:
├── Push notification: "New Calculus question - 98% match!"
├── Sound alert (can be customized)
├── In-app popup with 2-minute decision timer
├── Quick preview: subject, difficulty, urgency, match score
```

### **3. Request Decision Process**

```
REQUEST POPUP SHOWS:
├── Student info: name, year, previous rating (if any)
├── Question: full text + image if provided
├── AI analysis:
│   ├── Difficulty: ⭐⭐⭐⭐☆ (4/5)
│   ├── Topics: ["Derivatives", "Chain Rule", "Applications"]
│   ├── Estimated time: "15-20 minutes"
│   ├── Common issues: "Students often confuse chain rule steps"
│   └── Success probability: "High - matches your expertise"
├── Urgency context: "Exam tomorrow morning" or "Homework due Friday"
├── Payment: "Free session" or "$5 for this session"

MENTOR DECISION FACTORS:
├── Do I understand this topic well? (confidence check)
├── Do I have enough time right now?
├── Is this difficulty level I'm comfortable with?
├── Does the payment match the time investment?

ACTIONS:
├── ACCEPT: "Yes, I can help with this!"
│   ├── Instant connection to chat
│   ├── AI provides conversation starters
│   └── Session begins immediately
├── DECLINE: Quick reasons
│   ├── "Too busy right now"
│   ├── "Outside my expertise"  
│   ├── "Too advanced for me"
│   └── "Need more context"
├── REQUEST MORE INFO: Ask student for clarification
└── SUGGEST ALTERNATIVE: "I can help in 30 minutes" or "Try [other mentor]"
```

### **4. Mentoring Session Flow**

```
CHAT INTERFACE (Mentor View):
├── Left panel: Full question with image and AI analysis
├── Main chat: Real-time messaging with student
├── Right panel: AI teaching assistant
│   ├── "Students often struggle with..."
│   ├── "Good analogies for this concept:"
│   ├── "Check if they understand X before moving to Y"
│   └── "Common follow-up questions"

MENTOR TOOLS:
├── Quick responses:
│   ├── "Let me break this down step by step"
│   ├── "What part specifically is confusing?"
│   ├── "Have you covered [prerequisite topic]?"
├── Formatting tools:
│   ├── Math symbols: ∫ ∑ π √ ∞ ± ≤ ≥
│   ├── Step numbering: auto-format
│   ├── Code blocks for programming help
├── Media sharing:
│   ├── Voice messages (up to 2 minutes)
│   ├── Quick sketches/diagrams
│   ├── Screen sharing (stretch goal)

SESSION MANAGEMENT:
├── Timer: track session length
├── "Take a break" - pause timer
├── "Need more time?" - extend session
├── "Problem solved?" - completion check
├── Emergency: "Escalate to senior mentor"

TEACHING BEST PRACTICES (AI SUGGESTIONS):
├── Start with: "What have you tried so far?"
├── Check understanding: "Does this make sense before we continue?"
├── Encourage: "You're doing great! This is a tricky concept"
├── Summarize: "Let's review what we covered"
```

### **5. Session Completion & Earnings**

```
COMPLETION PROCESS:
├── Student marks: "Problem solved!"
├── Mentor confirms: "Session complete"
├── Automatic mutual rating
├── Session summary generated by AI
├── Payment processing (if paid session)
├── Success metrics updated

POST-SESSION:
├── Rating notification: "Alex rated you 5⭐!"
├── Feedback: "Very patient and clear explanations"
├── Earnings update: "$5 added to your account"
├── AI insights: "Great job! Your explanation style worked well"
├── Next steps: "Ready for another student?"

WEEKLY SUMMARY:
├── Total earnings: "$67 this week"
├── Sessions completed: 23
├── Average rating: 4.8⭐ (trending up)
├── Best subjects: Calculus (4.9⭐), Physics (4.7⭐)
├── Peak hours: "Most requests 7-9 PM"
├── AI recommendations:
│   ├── "Consider adding Chemistry - high demand"
│   ├── "Your response time improved 20% this week"
│   └── "Students love your step-by-step approach"
```

### **6. Mentor Optimization Features**

```
AVAILABILITY MANAGEMENT:
├── Smart scheduling:
│   ├── "Based on patterns, you get most requests 6-9 PM"
│   ├── "Mondays are usually busy for Math"
│   └── "Set availability for peak times?"
├── Quick toggles:
│   ├── Available now: ON/OFF
│   ├── Subject focus: "Only taking Math questions"
│   ├── Break mode: "Back in 15 minutes"
│   └── Do not disturb: For focused study time

PERFORMANCE INSIGHTS:
├── Success rate tracking: 95% problem resolution
├── Response time: Average 45 seconds
├── Student retention: 78% return rate
├── Subject performance: Best at Calculus, learning Chemistry
├── Earnings optimization: "Increase rate to $6 for advanced topics"

MENTOR COMMUNITY:
├── Leaderboards: Top rated mentors
├── Success stories: Feature exceptional mentors
├── Mentor chat: Connect with other tutors
├── Training resources: AI-curated teaching tips
├── Feedback forum: Share experiences and get advice
```

---

## Real-time WebSocket Events (Detailed)

### Student Events
```javascript
// Student sends question
socket.emit('student:ask_question', {
  question: "How do I solve this calculus problem?",
  subject: "Mathematics", 
  urgency: "ASAP",
  imageUrl: "https://..."
});

// Student cancels request
socket.emit('student:cancel_request', { requestId: 123 });

// Student joins accepted session  
socket.emit('student:join_session', { sessionId: 456 });
```

### Mentor Events
```javascript
// Mentor updates availability
socket.emit('mentor:availability', { 
  isAvailable: true,
  subjects: ["Mathematics", "Physics"],
  maxSessions: 5
});

// Mentor responds to request
socket.emit('mentor:respond_request', {
  requestId: 123,
  action: 'accept', // or 'decline'
  message: "I can help you with this calculus problem!"
});

// Mentor joins session
socket.emit('mentor:join_session', { sessionId: 456 });
```

### System Events
```javascript
// New request notification to qualified mentors
socket.emit('system:new_request', {
  requestId: 123,
  targetMentors: [userId1, userId2, userId3], // AI-selected
  priority: 'high'
});

// Real-time updates
socket.emit('system:request_update', {
  requestId: 123,
  status: 'accepted',
  mentorId: 789
});
```# Student-Mentor On-Demand Tutoring Platform — context.md

> **Elevator pitch**
>
> An AI-powered on-demand tutoring platform that connects students needing instant homework help with available mentors. Students ask questions and get matched with the best mentors in real-time, while mentors earn money helping with subjects they excel in. Features intelligent matching, AI chat assistance, and seamless mobile experience. Built for 36-hour hackathon using React + Tailwind + Framer Motion frontend, Express + Prisma + PostgreSQL backend.

---

## Goals (MVP)

### Core Features
1. **Student Flow**: Ask question → AI analysis → Mentor matching → Instant help session
2. **Mentor Flow**: Set availability → Receive smart requests → Help students → Earn money/reputation  
3. **AI-powered mentor matching** based on subject expertise, availability, and success patterns
4. **Real-time chat** with WebSocket for instant communication
5. **AI chat assistant** for quick answers using OpenAI API
6. **Session management** with ratings and history
7. **Secure authentication** with JWT

### Stretch Goals
* **Smart analytics dashboard** with AI insights
* **Video/audio calling** using WebRTC
* **Payment integration** with Stripe
* **Advanced scheduling** with calendar sync
* **Learning progress tracking** with AI analysis

---

## User Flows

### **STUDENT FLOW** 📚

#### **Primary Path: "I Need Help Now!"**

```
1. QUESTION ENTRY (30 seconds)
   Dashboard → "Ask Question" Button
   ├── Text input: "What's your question?"
   ├── Subject dropdown: [Math, Physics, Chemistry, Biology, etc.]
   ├── Optional photo upload of problem
   ├── Urgency: [ASAP, 30min, 1hr, No rush]
   └── Click "Get Help"

2. AI ANALYSIS (2-3 seconds)
   Loading screen shows:
   ├── "Analyzing your question..."
   ├── "Finding the best mentors..."
   └── AI determines: difficulty, urgency, topics, session time

3. SMART OPTIONS (Decision point)
   
   Option A: "🤖 Try AI Help First" (Free)
   ├── AI provides step-by-step explanation
   ├── Shows relevant formulas/concepts
   ├── "Still stuck?" → Continue to mentors
   └── "Problem solved!" → Rate AI help
   
   Option B: "👨‍🏫 Connect with Mentor" 
   ├── Shows 3-5 AI-matched mentors
   ├── Match scores: "98% match - Calculus expert"
   ├── Availability: "🟢 Available now" or "🟡 Available in 5min"
   ├── Pricing: "Free" or "$3/session"
   └── Mentor preview: photo, rating, quick bio

4. MENTOR REQUEST (If Option B chosen)
   ├── Click preferred mentor
   ├── Mentor profile popup with examples
   ├── "Request Help" button
   ├── AI pre-fills context for mentor
   └── Real-time status: "Sending request..."

5. CONNECTION PROCESS
   ├── Push notification sent to mentor
   ├── Student sees: "Waiting for [Mentor Name]..."
   ├── Real-time updates: "Mentor reviewing question..."
   ├── Response within 2-3 minutes
   
   If ACCEPTED:
   ├── "Great! [Mentor] will help you now"
   ├── Direct to chat interface
   ├── Question context already shared
   └── Start help session
   
   If DECLINED:
   ├── "Looking for another mentor..."
   ├── Auto-suggest next best match
   └── "Try AI help while we find someone?"

6. HELP SESSION
   Chat Interface:
   ├── Question already visible to mentor
   ├── Real-time text messaging
   ├── AI assistant in sidebar for quick facts
   ├── Mentor can send:
   │   ├── Text explanations
   │   ├── Step-by-step breakdowns
   │   ├── Voice messages (if enabled)
   │   └── Simple drawings/diagrams
   ├── Session timer (for paid sessions)
   └── "Problem solved?" button

7. SESSION COMPLETION
   ├── "Mark as Resolved" button
   ├── Quick rating: 1-5 stars with one-click
   ├── Optional feedback: "What was most helpful?"
   ├── Save solution to "My Solutions" library
   ├── AI suggests: "Practice similar problems?"
   └── Payment processing (if paid session)
```

#### **Secondary Flows:**
- **Browse Mentors**: Explore mentor profiles → Save favorites → Request session
- **Scheduled Help**: Book future session → Calendar reminder → Join when time comes
- **Quick AI**: Instant AI answers for simple questions → No mentor needed

---

### **MENTOR FLOW** 👨‍🏫

#### **Onboarding & Setup**

```
1. REGISTRATION & PROFILE SETUP
   Register → Email verification → Profile creation
   ├── Personal info: name, photo, university, year
   ├── Subject expertise: 
   │   ├── Select subjects: [Math, Physics, Chemistry...]
   │   ├── Proficiency level: Beginner/Intermediate/Advanced
   │   ├── Specific topics: "Calculus, Linear Algebra, Statistics"
   │   └── Upload sample solutions (optional)
   ├── Availability settings:
   │   ├── Days: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
   │   ├── Time slots: 9AM-12PM, 1PM-5PM, 6PM-10PM
   │   ├── Instant availability toggle: "Available now"
   │   └── Max sessions per day
   ├── Pricing (optional):
   │   ├── Free sessions only
   │   ├── Paid: $2-10 per session
   │   └── Mixed: 3 free, then paid
   └── Bio: "I love helping with calculus! 3rd year Engineering student..."

2. VERIFICATION PROCESS
   ├── Email confirmation
   ├── University verification (optional)
   ├── Subject knowledge quiz (AI-generated)
   └── Profile review and approval
```

#### **Daily Mentor Experience**

```
3. MENTOR DASHBOARD
   Main screen shows:
   ├── Availability toggle: "🟢 Available for help"
   ├── Today's stats: "5 sessions • $15 earned • 4.8★ avg rating"
   ├── Pending requests: Red notification badge
   ├── Recent sessions with student feedback
   ├── AI insights: "Your math sessions have 95% success rate"
   └── Quick actions: [View Profile] [Update Availability] [Earnings]

4. RECEIVING REQUESTS (Real-time)
   When student submits question:
   ├── Push notification: "New Math question from Alex"
   ├── In-app notification with sound/vibration
   ├── Request popup shows:
   │   ├── Student's question with AI analysis
   │   ├── Subject: "Calculus - Limits"
   │   ├── Difficulty: "⭐⭐⭐ Intermediate"
   │   ├── Estimated time: "15-20 minutes"
   │   ├── Student info: year, previous ratings
   │   ├── AI context: "Student struggles with L'Hôpital's rule"
   │   └── Urgency: "🔴 Exam tomorrow" or "🟡 Homework due Friday"
   ├── Action buttons: [Accept] [Decline] [View Full Profile]
   └── Auto-decline timer: 2 minutes to respond

5. DECISION PROCESS
   Mentor reviews and considers:
   ├── Do I know this topic well?
   ├── Do I have 15-20 minutes free now?
   ├── Is this within my comfort zone?
   ├── Student seems genuine/respectful?
   
   If ACCEPT:
   ├── Click "Accept Request"
   ├── Automatic transition to chat interface
   ├── AI provides session starter suggestions
   └── Begin helping student
   
   If DECLINE:
   ├── Click "Decline" with optional reason
   ├── Request goes to next best mentor
   ├── No penalty for occasional declines
   └── AI learns from decline patterns

6. MENTORING SESSION
   Chat interface optimized for teaching:
   ├── Student question prominently displayed
   ├── AI analysis panel: difficulty, key concepts, common mistakes
   ├── Teaching tools:
   │   ├── Quick math symbols: ∫ ∑ π √ ∞
   │   ├── Text formatting: **bold** _italic_ `code`
   │   ├── Step numbering: auto-format "Step 1:"
   │   └── Voice message recording (30s max)
   ├── AI assistant suggestions:
   │   ├── "Students often get confused about..."
   │   ├── "Try explaining with this analogy..."
   │   └── "Common next questions for this topic..."
   ├── Session management:
   │   ├── Timer (for paid sessions)
   │   ├── "Extend session" option
   │   └── "Mark as resolved" when done
   └── Quick actions: [Send Formula] [Draw Diagram] [Voice Note]

7. SESSION COMPLETION
   ├── Student marks problem as "Resolved"
   ├── Mentor confirms completion
   ├── Automatic rating exchange
   ├── Payment processing (if paid)
   ├── AI generates session summary
   ├── Success metrics updated
   └── "Great job! Ready for next student?"

8. MENTOR ANALYTICS (AI-Powered)
   Weekly dashboard shows:
   ├── Sessions completed: 23 this week
   ├── Earnings: $67 total, $45 this week
   ├── Rating trend: 4.8 ⭐ (↗️ improving)
   ├── Best subjects: "You excel at Calculus and Physics"
   ├── Peak hours: "Most active 7-9 PM"
   ├── Student feedback themes: "Clear explanations", "Patient"
   ├── AI recommendations: "Consider adding Chemistry to boost earnings"
   └── Next week forecast: "Expect 15% more requests in Math"
```

#### **Mentor Secondary Flows:**

```
AVAILABILITY MANAGEMENT:
├── Quick toggle: Available/Busy
├── Schedule blocks: "Available Mon-Wed 6-9 PM"
├── Break mode: "Back in 15 minutes"
└── Vacation mode: "Away until next week"

PROFILE OPTIMIZATION:
├── Update bio based on AI suggestions
├── Add new subjects after demonstrating expertise
├── Upload example solutions for better matching
└── Set dynamic pricing based on demand

EARNINGS & ANALYTICS:
├── View detailed earnings breakdown
├── Track performance metrics
├── See student feedback patterns
├── Download monthly reports for taxes
```

---

## Primary personas & user stories

### Personas

* **Student (Urgent Learner):** High school/college student stuck on homework, often with tight deadlines, wants instant expert help
* **Mentor (Subject Expert):** University senior/grad student/teaching assistant who excels in specific subjects, wants flexible income and enjoys teaching
* **Admin (Platform Manager):** Monitors platform health, resolves disputes, optimizes AI matching

### Detailed User Stories

#### Student Stories:
* *As a Student*, I want to ask a question and immediately see if AI can help me for free before paying for a mentor
* *As a Student*, I want AI to match me with mentors who are experts in my specific question type, not just general subject area
* *As a Student*, I want to see mentor availability in real-time so I know if I can get help now vs later
* *As a Student*, I want to get help within 3 minutes of asking my question
* *As a Student*, I want my previous mentor preferences remembered so I can quickly reconnect with good tutors

#### Mentor Stories:
* *As a Mentor*, I want to receive only questions that match my expertise level and available time
* *As a Mentor*, I want to see AI analysis of each question so I can decide quickly if I can help
* *As a Mentor*, I want to earn money during my free time by helping students in subjects I'm strong in
* *As a Mentor*, I want AI insights about my teaching performance and suggestions for improvement
* *As a Mentor*, I want to control my availability granularly - "available for next 2 hours only"

---

## Tech stack (preferred)

* **Frontend:** React 18, Tailwind CSS, Framer Motion, React Query
* **Backend:** Node.js + Express, Socket.io for real-time
* **Database:** PostgreSQL + Prisma ORM
* **AI Services:** OpenAI API (GPT-3.5-turbo for speed and cost)
* **Authentication:** JWT with refresh tokens, bcrypt for passwords
* **File Upload:** Cloudinary for question images
* **Payment:** Stripe Connect for mentor payouts
* **Deployment:** Vercel (frontend), Railway (backend), Supabase (database)
* **Dev Tools:** Vite, ESLint, Prettier

---

## High-level architecture

```
[React Frontend] <--HTTPS--> [Express API] <--Prisma--> [PostgreSQL]
        |                         |                           
        |                    [OpenAI API]                     
        |                         |                           
     WebSocket <--Socket.io-------|                           
        |                         |                           
   [Push Notifications] <--FCM----|                           
```

---

## Detailed data models (Prisma schema)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique
  password      String    // bcrypt hashed
  name          String
  role          UserRole  @default(STUDENT)
  avatarUrl     String?
  isVerified    Boolean   @default(false)
  isActive      Boolean   @default(true)
  lastActive    DateTime  @default(now())
  
  // Relationships
  profile       Profile?
  sentRequests     SessionRequest[] @relation("StudentRequests")
  receivedRequests SessionRequest[] @relation("MentorRequests") 
  sentMessages     ChatMessage[]    @relation("MessageSender")
  givenRatings     Rating[]         @relation("RatingGiver")
  receivedRatings  Rating[]         @relation("RatingReceiver")
  
  // AI insights
  aiPreferences    Json?     // AI-learned preferences and patterns
  learningStyle    String?   // visual, auditory, kinesthetic
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@map("users")
}

model Profile {
  id            Int       @id @default(autoincrement())
  userId        Int       @unique
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Basic info
  bio           String?
  university    String?
  year          String?   // "3rd Year", "Graduate", "Alumni"
  
  // For mentors
  subjects      String[]  // ["Mathematics", "Physics", "Chemistry"]
  expertise     Json?     // {"Mathematics": ["Calculus", "Linear Algebra"], "Physics": ["Mechanics"]}
  hourlyRate    Int?      // in cents, null for free mentors
  isAvailable   Boolean   @default(false)
  availability  Json?     // {"monday": ["09:00-12:00", "14:00-17:00"], "tuesday": [...]}
  
  // AI-calculated metrics
  averageRating    Float     @default(0)
  totalSessions    Int       @default(0)
  successRate      Float     @default(0)  // percentage of resolved sessions
  responseTime     Int       @default(300) // average response time in seconds
  aiScore          Float     @default(0)   // overall AI-calculated mentor quality
  
  // Preferences
  maxSessionsPerDay Int      @default(10)
  preferredStudentLevel String? // "high_school", "undergraduate", "graduate"
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@map("profiles")
}

model SessionRequest {
  id            Int       @id @default(autoincrement())
  
  // Participants
  studentId     Int
  student       User      @relation("StudentRequests", fields: [studentId], references: [id])
  mentorId      Int
  mentor        User      @relation("MentorRequests", fields: [mentorId], references: [id])
  
  // Question details
  subject       String
  question      String
  questionImage String?   // Cloudinary URL
  urgency       Urgency   @default(NORMAL)
  
  // AI analysis
  difficulty    Int?      // 1-5 scale
  estimatedTime Int?      // in minutes
  aiTopics      String[]  // extracted topics
  urgencyScore  Float     @default(0.5) // 0-1 scale
  matchScore    Float?    // how well this mentor matches this question
  
  // Session management
  status        RequestStatus @default(PENDING)
  acceptedAt    DateTime?
  completedAt   DateTime?
  declineReason String?
  
  // Relationships
  chatMessages  ChatMessage[]
  rating        Rating?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@map("session_requests")
}

model ChatMessage {
  id            Int       @id @default(autoincrement())
  sessionId     Int
  session       SessionRequest @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  senderId      Int
  sender        User      @relation("MessageSender", fields: [senderId], references: [id])
  
  content       String
  messageType   MessageType @default(TEXT)
  imageUrl      String?   // for shared images
  isFromAI      Boolean   @default(false)
  
  // AI analysis
  sentiment     String?   // positive, neutral, negative
  containsCode  Boolean   @default(false)
  isQuestion    Boolean   @default(false)
  
  createdAt     DateTime  @default(now())
  
  @@map("chat_messages")
}

model Rating {
  id            Int       @id @default(autoincrement())
  sessionId     Int       @unique
  session       SessionRequest @relation(fields: [sessionId], references: [id])
  giverId       Int
  giver         User      @relation("RatingGiver", fields: [giverId], references: [id])
  receiverId    Int  
  receiver      User      @relation("RatingReceiver", fields: [receiverId], references: [id])
  
  stars         Int       // 1-5
  feedback      String?
  
  // AI analysis of feedback
  sentimentScore Float?
  feedbackTopics String[] // extracted themes
  
  createdAt     DateTime  @default(now())
  
  @@map("ratings")
}

// Enums
enum UserRole {
  STUDENT
  MENTOR
  ADMIN
}

enum RequestStatus {
  PENDING       // waiting for mentor response
  ACCEPTED      // mentor accepted, session active
  DECLINED      // mentor declined
  COMPLETED     // session finished successfully
  CANCELLED     // cancelled by student
  EXPIRED       // no response from mentor
}

enum Urgency {
  ASAP          // need help right now
  NORMAL        // within 30 minutes
  FLEXIBLE      // within few hours
  SCHEDULED     // planned for later
}

enum MessageType {
  TEXT
  IMAGE
  VOICE
  SYSTEM        // automated messages
}
```

---

## API endpoints (REST)

### Authentication
* `POST /api/auth/register` - User registration
* `POST /api/auth/login` - User login  
* `POST /api/auth/refresh` - Refresh JWT token
* `POST /api/auth/logout` - Logout user

### Profile Management
* `GET /api/profile` - Get current user profile
* `PUT /api/profile` - Update profile
* `POST /api/profile/avatar` - Upload profile picture
* `GET /api/mentors` - Search/filter mentors
* `GET /api/mentors/:id` - Get specific mentor profile

### Session Management
* `POST /api/sessions/request` - Create session request
* `PUT /api/sessions/:id/accept` - Mentor accepts request
* `PUT /api/sessions/:id/decline` - Mentor declines request  
* `PUT /api/sessions/:id/complete` - Mark session complete
* `GET /api/sessions/history` - Get user's session history
* `POST /api/sessions/:id/rate` - Rate completed session

### AI Features
* `POST /api/ai/analyze-question` - Analyze question with AI
* `POST /api/ai/match-mentors` - Get AI-recommended mentors
* `POST /api/ai/chat-assist` - Get AI help for question
* `GET /api/ai/insights/:userId` - Get AI insights for user

### Chat & Real-time
* `GET /api/chat/:sessionId/messages` - Get chat history
* `POST /api/chat/:sessionId/message` - Send message (backup to WebSocket)

---

## WebSocket events (Socket.io)

### Student Events
* `student:request_help` - Send help request to mentors
* `student:cancel_request` - Cancel pending request
* `student:join_session` - Join accepted session chat
* `student:send_message` - Send chat message

### Mentor Events  
* `mentor:set_availability` - Update availability status
* `mentor:accept_request` - Accept help request
* `mentor:decline_request` - Decline help request
* `mentor:join_session` - Join session chat
* `mentor:send_message` - Send chat message

### System Events
* `notification` - Push notifications to users
* `request_update` - Real-time request status updates
* `session_update` - Session status changes
* `ai_response` - AI assistant responses
* `typing_indicator` - Show when someone is typing

---

## Frontend pages & components

### Pages
* **LandingPage** - Marketing + quick demo + CTA
* **LoginPage / RegisterPage** - Auth forms with role selection
* **StudentDashboard** - Question entry + recent sessions + quick AI help
* **MentorDashboard** - Availability controls + pending requests + earnings overview
* **MentorProfilePage** - Public mentor profile with ratings and examples
* **ChatPage** - Full-screen chat interface for active sessions
* **ProfileEditor** - Edit bio, subjects, availability, pricing
* **AnalyticsPage** - AI-powered insights and learning progress
* **SessionHistory** - Past sessions with search and filters

### Key Components

#### Core Components
* **QuestionInput** - Smart question entry with subject detection and photo upload
* **MentorCard** - Mentor preview with match score, availability, pricing, rating
* **SessionRequestCard** - For mentors to view and respond to incoming requests
* **ChatInterface** - Real-time messaging with AI assistance and teaching tools
* **AvailabilityToggle** - Quick on/off switch for mentors
* **RatingModal** - Session rating with quick feedback options

#### AI-Enhanced Components  
* **AIAssistant** - Floating help widget with contextual suggestions
* **MatchingResults** - AI-recommended mentors with confidence scores and reasoning
* **QuestionAnalysis** - Shows AI analysis of question difficulty and topics
* **InsightsDashboard** - Visualizes learning progress and mentor performance
* **SmartNotifications** - Prioritized notifications based on AI urgency detection

#### Utility Components
* **LoadingSpinner** - For AI analysis and mentor matching
* **EmptyState** - When no mentors available or no session history
* **ErrorBoundary** - Graceful error handling
* **ProtectedRoute** - Role-based access control
* **NotificationToast** - Real-time updates and confirmations

---

## AI Service Implementation

### OpenAI Integration
```javascript
// /server/src/services/aiService.js
const OpenAI = require('openai');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeQuestion(question, subject) {
    const prompt = `Analyze this ${subject} question and return JSON:
    {
      "difficulty": 1-5,
      "urgency": 0-1,
      "topics": ["topic1", "topic2"], 
      "estimatedTime": minutes,
      "mentorLevel": "beginner|intermediate|advanced",
      "commonMistakes": ["mistake1", "mistake2"]
    }
    
    Question: "${question}"`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content);
  }

  async getChatAssistance(question, subject, context = '') {
    const prompt = `You are a helpful tutoring assistant. Provide a concise, educational response to this ${subject} question.
    
    Context: ${context}
    Question: ${question}
    
    Be encouraging and educational. If it's complex, suggest getting human mentor help.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.choices[0].message.content;
  }

  async suggestSessionStarters(question, mentorExpertise) {
    const prompt = `Generate 2-3 conversation starters for a mentor to begin helping with this question.
    
    Question: ${question}
    Mentor expertise: ${mentorExpertise}
    
    Return friendly, encouraging opening messages.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message.content.split('\n').filter(line => line.trim());
  }
}

module.exports = AIService;
```

### Smart Matching Algorithm
```javascript
// /server/src/services/matchingService.js
class MatchingService {
  calculateMatchScore(questionAnalysis, mentor) {
    let score = 0;
    
    // Subject expertise match (40%)
    const subjectMatch = this.getSubjectExpertise(questionAnalysis.topics, mentor.expertise);
    score += subjectMatch * 0.4;
    
    // Availability (25%)
    const availabilityScore = mentor.isAvailable ? 1 : 0;
    score += availabilityScore * 0.25;
    
    // Success rate and rating (20%)
    const performanceScore = (mentor.successRate * 0.6) + (mentor.averageRating / 5 * 0.4);
    score += performanceScore * 0.2;
    
    // Response time (15%)
    const responseScore = Math.max(0, (600 - mentor.responseTime) / 600); // faster = better
    score += responseScore * 0.15;
    
    return Math.round(score * 100);
  }

  getSubjectExpertise(questionTopics, mentorExpertise) {
    // Check how many question topics the mentor covers
    let matches = 0;
    questionTopics.forEach(topic => {
      Object.values(mentorExpertise || {}).forEach(expertiseArray => {
        if (expertiseArray.some(skill => skill.toLowerCase().includes(topic.toLowerCase()))) {
          matches++;
        }
      });
    });
    return Math.min(1, matches / questionTopics.length);
  }

  async getTopMatches(questionAnalysis, availableMentors, limit = 5) {
    const scoredMentors = availableMentors.map(mentor => ({
      ...mentor,
      matchScore: this.calculateMatchScore(questionAnalysis, mentor),
      aiReasoning: this.generateMatchReasoning(questionAnalysis, mentor)
    }));

    return scoredMentors
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  generateMatchReasoning(analysis, mentor) {
    const reasons = [];
    if (mentor.averageRating > 4.5) reasons.push("Highly rated mentor");
    if (mentor.successRate > 0.9) reasons.push("Excellent success rate");
    if (mentor.responseTime < 120) reasons.push("Quick to respond");
    return reasons.join(" • ");
  }
}
```

---

## Frontend Implementation Examples

### Student Dashboard Component
```jsx
// /client/src/pages/StudentDashboard.jsx
import { useState } from 'react';
import { useAI } from '../hooks/useAI';
import QuestionInput from '../components/QuestionInput';
import AIAssistant from '../components/AIAssistant';
import MatchingResults from '../components/MatchingResults';

export default function StudentDashboard() {
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('');
  const [showMatching, setShowMatching] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  
  const { analyzeQuestion, getChatHelp, loading } = useAI();

  const handleQuestionSubmit = async (questionData) => {
    // AI analyzes question first
    const analysis = await analyzeQuestion(questionData.question, questionData.subject);
    setAiAnalysis(analysis);
    
    // Show AI help option vs mentor matching
    if (analysis.difficulty <= 2) {
      // Offer AI help first for easy questions
      const aiHelp = await getChatHelp(questionData.question, questionData.subject);
      // Show AI response with option to continue to mentors
    } else {
      // Go straight to mentor matching for complex questions
      setShowMatching(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Need Help?</h1>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <UserAvatar />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!showMatching ? (
          <QuestionInput 
            onSubmit={handleQuestionSubmit}
            loading={loading}
          />
        ) : (
          <MatchingResults 
            question={question}
            subject={subject}
            aiAnalysis={aiAnalysis}
          />
        )}
        
        <RecentSessions />
        <QuickTopics />
      </main>

      <AIAssistant />
    </div>
  );
}
```

### Mentor Dashboard Component
```jsx
// /client/src/pages/MentorDashboard.jsx
import { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import AvailabilityToggle from '../components/AvailabilityToggle';
import RequestCard from '../components/RequestCard';
import EarningsOverview from '../components/EarningsOverview';

export default function MentorDashboard() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [todayStats, setTodayStats] = useState({});
  
  const socket = useSocket();

  useEffect(() => {
    // Listen for incoming requests
    socket.on('new_request', (request) => {
      setPendingRequests(prev => [request, ...prev]);
      // Show notification with sound
      showNotification(`New ${request.subject} question from ${request.student.name}`);
    });

    socket.on('request_cancelled', (requestId) => {
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
    });

    return () => {
      socket.off('new_request');
      socket.off('request_cancelled');
    };
  }, []);

  const handleAcceptRequest = async (requestId) => {
    await api.put(`/sessions/${requestId}/accept`);
    socket.emit('mentor:accept_request', { requestId });
    // Navigate to chat interface
    navigate(`/chat/${requestId}`);
  };

  const handleDeclineRequest = async (requestId, reason) => {
    await api.put(`/sessions/${requestId}/decline`, { reason });
    socket.emit('mentor:decline_request', { requestId, reason });
    setPendingRequests(prev => prev.filter(req => req.id !== requestId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mentor Dashboard</h1>
              <p className="text-gray-600">Help students and earn money</p>
            </div>
            
            <AvailabilityToggle 
              isAvailable={isAvailable}
              onChange={setIsAvailable}
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Pending Requests */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Pending Requests</h2>
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm">
                {pendingRequests.length} waiting
              </span>
            </div>
            
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No pending requests</p>
                <p className="text-sm">Make sure you're available to receive requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map(request => (
                  <RequestCard 
                    key={request.id}
                    request={request}
                    onAccept={() => handleAcceptRequest(request.id)}
                    onDecline={(reason) => handleDeclineRequest(request.id, reason)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Stats & Controls */}
        <div className="space-y-6">
          <EarningsOverview stats={todayStats} />
          <QuickActions />
          <RecentSessions />
        </div>
      </main>
    </div>
  );
}
```