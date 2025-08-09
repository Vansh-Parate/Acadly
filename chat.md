# MentorNow Chat Implementation Context

## Project Overview
MentorNow is a React TypeScript mentoring platform with a Node.js/Express backend using Prisma ORM and PostgreSQL. The application connects students with mentors for educational sessions.

## Current Architecture

### Frontend (React + TypeScript)
- **Framework**: React with TypeScript, Vite build tool
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context (AuthContext)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: Sonner (toast)

### Backend (Node.js + Express)
- **Framework**: Express with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **CORS**: Configured for localhost development

### Database Schema (Prisma)
```prisma
model User {
  id          Int       @id @default(autoincrement())
  email       String    @unique
  password    String
  name        String?
  role        UserRole  @default(STUDENT)
  avatarUrl   String?
  sentMessages ChatMessage[] @relation("UserMessages")
  // ... other relations
}

model ChatMessage {
  id          Int       @id @default(autoincrement())
  sessionId   Int?
  fromUserId  Int
  message     String
  isAiMessage Boolean   @default(false)
  aiTopics    String[]
  createdAt   DateTime  @default(now())
  
  session     SessionRequest? @relation(fields: [sessionId], references: [id])
  fromUser    User      @relation("UserMessages", fields: [fromUserId], references: [id])
}

model SessionRequest {
  id          Int       @id @default(autoincrement())
  studentId   Int
  mentorId    Int
  subject     String
  status      RequestStatus @default(PENDING)
  messages    ChatMessage[]
  // ... other fields
}
```

## Current User Roles & Navigation

### Student Navigation
- `/dashboard` - Main dashboard with mentor search and recommendations
- `/mentors` - Find mentors page
- `/my-sessions` - Session management
- `/profile` - User profile

### Mentor Navigation  
- `/dashboard/mentor` - Mentor overview dashboard
- `/mentor/sessions` - Session management with requests/upcoming/chats placeholder
- `/mentor/profile` - Mentor profile and availability

### Admin Navigation
- `/dashboard/admin` - Admin dashboard

## Authentication Flow
- JWT token stored in AuthContext
- Role-based routing and access control
- Protected routes with `ProtectedRoute` component

## Key Components

### Header Component (`src/components/header.tsx`)
- Role-aware navigation
- Theme toggle
- User dropdown with logout

### Existing Chat References
1. **MentorSessions.tsx** has a "Chats" section with mock data showing:
   - Chat participant names
   - Message counts
   - Availability status
   - Last message time

2. **ChatMessage model** already exists in database schema

## API Endpoints Structure
- `/auth/*` - Authentication routes
- `/mentor/*` - Mentor-specific routes  
- `/sessions/*` - Session management
- `/dashboard/*` - Dashboard data

## Chat Implementation Requirements

### 1. Real-time Communication
- Implement WebSocket connection for real-time messaging
- Consider Socket.io for easier WebSocket management
- Handle connection states (connected, disconnected, reconnecting)

### 2. Database Schema Extensions
The ChatMessage model exists but may need enhancements:
- Add message types (text, file, system)
- Add read/unread status
- Consider message reactions/replies
- Add typing indicators

### 3. Frontend Chat Components Needed

#### Core Chat Components
- `ChatWindow` - Main chat interface
- `ChatList` - List of active conversations  
- `MessageBubble` - Individual message display
- `MessageInput` - Text input with send functionality
- `ChatHeader` - Chat participant info and controls

#### Chat Pages
- `/chat` - Main chat page
- `/chat/:sessionId` - Specific conversation

### 4. Backend Chat Routes
```typescript
// Suggested new routes to implement
POST /chat/sessions/:sessionId/messages
GET /chat/sessions/:sessionId/messages
GET /chat/conversations
PUT /chat/messages/:messageId/read
```

### 5. Real-time Features
- Live message delivery
- Typing indicators
- Online/offline status
- Message read receipts

### 6. Integration Points

#### With Existing Session Flow
- Chat should be accessible from:
  - MentorSessions "Start Mentoring" button
  - MySessionsPage active sessions
  - Dashboard session cards

#### With User Authentication
- Verify user permissions for chat access
- Ensure only session participants can access chat
- Maintain role-based features (mentor vs student views)

### 7. UI/UX Considerations
- Mobile-responsive chat interface
- Dark/light theme support (already implemented)
- Consistent with existing Tailwind + shadcn/ui design system
- Framer Motion animations for smooth interactions

## Implementation Strategy

### Phase 1: Basic Chat Infrastructure
1. Set up WebSocket server (Socket.io)
2. Create basic chat database operations
3. Implement chat API routes
4. Create core chat components

### Phase 2: Chat Interface
1. Build ChatWindow component
2. Integrate with existing session flow
3. Add to navigation/routing
4. Implement message persistence

### Phase 3: Real-time Features
1. Live message delivery
2. Typing indicators
3. Online status
4. Message read status

### Phase 4: Enhanced Features
1. File sharing capabilities
2. Message search
3. Chat history export
4. Notification system

## Technical Specifications

### WebSocket Events (Suggested)
```typescript
// Client -> Server
'join-chat': { sessionId: number }
'send-message': { sessionId: number, message: string }
'typing-start': { sessionId: number }
'typing-stop': { sessionId: number }

// Server -> Client  
'message-received': { message: ChatMessage }
'user-typing': { userId: number, isTyping: boolean }
'user-online': { userId: number }
'user-offline': { userId: number }
```

### Message Data Structure
```typescript
interface ChatMessage {
  id: number
  sessionId: number
  fromUserId: number
  message: string
  messageType: 'text' | 'system' | 'file'
  isRead: boolean
  createdAt: string
  fromUser: {
    id: number
    name: string
    role: 'STUDENT' | 'MENTOR'
    avatarUrl?: string
  }
}
```

## File Structure Additions
```
src/
├── components/
│   ├── chat/
│   │   ├── ChatWindow.tsx
│   │   ├── ChatList.tsx  
│   │   ├── MessageBubble.tsx
│   │   ├── MessageInput.tsx
│   │   ├── ChatHeader.tsx
│   │   └── TypingIndicator.tsx
│   └── ui/ (existing shadcn components)
├── pages/
│   ├── ChatPage.tsx
│   └── ChatSessionPage.tsx
├── hooks/
│   ├── useSocket.ts
│   ├── useChat.ts
│   └── useTyping.ts
└── lib/
    └── socket.ts

server/src/
├── routes/
│   └── chat.ts
├── socket/
│   ├── index.ts
│   ├── chatHandlers.ts
│   └── types.ts
└── middleware/
    └── socketAuth.ts
```

## Dependencies to Add

### Frontend
```json
{
  "socket.io-client": "^4.7.5",
  "@types/socket.io-client": "^3.0.0"
}
```

### Backend
```json
{
  "socket.io": "^4.7.5",
  "@types/socket.io": "^3.0.2"
}
```

## Security Considerations
- Validate session access (only participants can access chat)
- Sanitize message content
- Rate limiting for message sending
- Proper JWT validation for WebSocket connections

## Testing Strategy
- Unit tests for chat components
- Integration tests for WebSocket functionality
- End-to-end tests for complete chat flow
- Load testing for concurrent users

## Existing Integration Points
1. **MentorSessions.tsx** already shows chat placeholder - integrate real chat here
2. **SessionRequest model** links to ChatMessage - use this relationship
3. **Header component** can show chat notifications
4. **AuthContext** provides user data needed for chat

## Performance Considerations
- Implement message pagination for long conversations
- Use React.memo for message components
- Debounce typing indicators
- Optimize WebSocket event handlers
- Consider message caching strategies

This context provides the foundation for implementing a robust, real-time chat system that integrates seamlessly with the existing MentorNow platform architecture.