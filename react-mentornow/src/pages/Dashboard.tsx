import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProtectedRoute  from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen, 
  Users, 
  MessageSquare, 
  Calendar,
  GraduationCap,
  Star,
  TrendingUp,
  Settings,
  LogOut,
  User,
  Clock,
  Target,
  Bell,
  BarChart3,
  Video,
  FileText
} from 'lucide-react'
import { motion } from 'framer-motion'
import Header from '@/components/header'
import SearchBar from '@/components/search-bar'
import MatchingResults from '@/components/matching-results'
import NotificationCenter from '@/components/notifications/NotificationCenter'
import ProgressTracker from '@/components/analytics/ProgressTracker'
import SessionCalendar from '@/components/calendar/SessionCalendar'
import ChatWindow from '@/components/chat/ChatWindow'
import { API_BASE } from '@/lib/api'
import { notificationsAPI, progressAPI, scheduledSessionsAPI, chatAPI } from '@/lib/api'

function DashboardContent() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState({
    totalSessions: 12,
    completedSessions: 8,
    pendingSessions: 2,
    averageRating: 4.8,
  })

  // State for new features
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [scheduledSessions, setScheduledSessions] = useState<any[]>([])
  const [chatSessions, setChatSessions] = useState<any[]>([])
  const [selectedChatSession, setSelectedChatSession] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token')
      if (token) {
        // Fetch notifications
        notificationsAPI.getAll(token).then(data => {
          setNotifications(data.notifications || [])
          setUnreadCount(data.unreadCount || 0)
        }).catch(console.error)

        // Fetch scheduled sessions
        scheduledSessionsAPI.getAll(token).then(data => {
          setScheduledSessions(data.sessions || [])
        }).catch(console.error)

        // Fetch chat sessions
        chatAPI.getSessions(token).then(data => {
          setChatSessions(data.sessions || [])
        }).catch(console.error)
      }
    }
  }, [user])

  const handleMarkAsRead = async (id: string) => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        await notificationsAPI.markAsRead(token, Number(id))
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    }
  }

  const handleMarkAllAsRead = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        await notificationsAPI.markAllAsRead(token)
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
      } catch (error) {
        console.error('Error marking all notifications as read:', error)
      }
    }
  }

  const handleDeleteNotification = async (id: string) => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        await notificationsAPI.delete(token, Number(id))
        setNotifications(prev => prev.filter(n => n.id !== id))
        if (!notifications.find(n => n.id === id)?.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      } catch (error) {
        console.error('Error deleting notification:', error)
      }
    }
  }

  const handleSessionCreate = async (sessionData: any) => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const newSession = await scheduledSessionsAPI.create(token, sessionData)
        setScheduledSessions(prev => [...prev, newSession.session])
      } catch (error) {
        console.error('Error creating session:', error)
      }
    }
  }

  const handleSessionUpdate = async (id: string, updates: any) => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const updatedSession = await scheduledSessionsAPI.update(token, Number(id), updates)
        setScheduledSessions(prev => 
          prev.map(s => s.id === id ? updatedSession.session : s)
        )
      } catch (error) {
        console.error('Error updating session:', error)
      }
    }
  }

  const handleSessionDelete = async (id: string) => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        await scheduledSessionsAPI.delete(token, Number(id))
        setScheduledSessions(prev => prev.filter(s => s.id !== id))
      } catch (error) {
        console.error('Error deleting session:', error)
      }
    }
  }

  const [mentors, setMentors] = useState<any[]>([])
  useEffect(() => {
    fetch(`${API_BASE}/mentors`)
      .then((r) => r.json())
      .then((d) =>
        setMentors(
          Array.isArray(d?.mentors)
            ? d.mentors.map((m: any) => ({
                id: m.id,
                name: m.name || 'Mentor',
                avatarUrl: m.avatarUrl || undefined,
                subjects: String(m.profile?.subjects || '')
                  .split(',')
                  .map((s: string) => s.trim())
                  .filter(Boolean),
                rating: m.profile?.rating ?? 4.7,
                hourlyRate: m.profile?.hourlyRate ?? 0,
                successRate: m.profile?.successRate ?? 0.82,
                aiScore: m.profile?.aiScore ?? 0.75,
                availableNow: true,
                bio: 'Experienced mentor',
              }))
            : []
        )
      )
      .catch(() => setMentors([]))
  }, [])

  const handleLogout = () => logout()

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'STUDENT': return 'bg-blue-500'
      case 'MENTOR': return 'bg-green-500'
      case 'ADMIN': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'STUDENT': return <BookOpen className="h-4 w-4" />
      case 'MENTOR': return <GraduationCap className="h-4 w-4" />
      case 'ADMIN': return <Settings className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const renderStudentDashboard = () => (
    <div className="space-y-8">
      {/* Top header bar */}
      <Header />

      <div className="container mx-auto px-4 space-y-6">
        {/* Welcome and role badge */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className={`${getRoleColor(user?.role || '')} text-white`}>
              {getRoleIcon(user?.role || '')}
              <span className="ml-1">{user?.role}</span>
            </Badge>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Search bar and filters */}
            <SearchBar />

            {/* Recommended mentors from backend */}
            <MatchingResults mentors={mentors as any} />

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                  <Calendar className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSessions}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <Target className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedSessions}</div>
                  <p className="text-xs text-muted-foreground">Successfully completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingSessions}</div>
                  <p className="text-xs text-muted-foreground">Awaiting response</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <Star className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageRating}</div>
                  <p className="text-xs text-muted-foreground">From mentors</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest sessions and interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scheduledSessions.slice(0, 3).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Video className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{session.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {session.mentor?.name || 'Mentor'} • {session.subject}
                          </p>
                        </div>
                      </div>
                      <Badge variant={session.status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {session.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat Sessions List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Conversations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {chatSessions.map((session) => (
                        <div
                          key={session.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedChatSession?.id === session.id
                              ? 'bg-primary/10 border border-primary/20'
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => setSelectedChatSession(session)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {session.student?.id === user?.id ? session.mentor?.name : session.student?.name}
                              </p>
                              <p className="text-sm text-muted-foreground truncate">
                                {session.messages?.[0]?.message || 'No messages yet'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chat Window */}
              <div className="lg:col-span-2">
                {selectedChatSession ? (
                  <ChatWindow
                    sessionId={selectedChatSession.id}
                    otherUser={selectedChatSession.student?.id === user?.id ? selectedChatSession.mentor : selectedChatSession.student}
                    currentUser={user}
                  />
                ) : (
                  <Card className="h-96 flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                      <p className="text-muted-foreground">Choose a session to start chatting</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <SessionCalendar
              sessions={scheduledSessions}
              onSessionCreate={handleSessionCreate}
              onSessionUpdate={handleSessionUpdate}
              onSessionDelete={handleSessionDelete}
              userRole={user?.role as 'STUDENT' | 'MENTOR'}
              userId={user?.id || 0}
            />
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <ProgressTracker 
              data={{
                totalSessions: 0,
                completedSessions: 0,
                totalHours: 0,
                averageRating: 0,
                subjectsLearned: [],
                currentStreak: 0,
                longestStreak: 0,
                achievements: [],
                weeklyProgress: [],
                subjectBreakdown: [],
                monthlyStats: []
              }}
              userRole={user?.role as 'STUDENT' | 'MENTOR'}
            />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Stay updated with your latest activities</CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationCenter
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onDelete={handleDeleteNotification}
                  onAction={(notification) => {
                    // Handle notification actions
                    console.log('Notification action:', notification)
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )

  const renderMentorDashboard = () => (
    <div className="space-y-6 container mx-auto px-4">
      {/* Mentor content remains similar to previous version */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Total students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">Successfully completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.9</div>
            <p className="text-xs text-muted-foreground">From students</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderAdminDashboard = () => (
    <div className="space-y-6 container mx-auto px-4">
      {/* Admin content remains similar to previous version */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1234</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">Ongoing sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Support tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">Overall satisfaction</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {user?.role === 'STUDENT' && renderStudentDashboard()}
      {user?.role === 'MENTOR' && renderMentorDashboard()}
      {user?.role === 'ADMIN' && renderAdminDashboard()}
    </div>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute allowedRoles={["STUDENT", "MENTOR", "ADMIN"]}>
      <DashboardContent />
    </ProtectedRoute>
  )
}
