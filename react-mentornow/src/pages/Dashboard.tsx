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
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/header'
import SearchBar from '@/components/search-bar'
import MatchingResults from '@/components/matching-results'
import NotificationCenter from '@/components/notifications/NotificationCenter'
import ProgressTracker from '@/components/analytics/ProgressTracker'
import SessionCalendar from '@/components/calendar/SessionCalendar'
import ChatWindow from '@/components/chat/ChatWindow'
import { API_BASE } from '@/lib/api'
import { notificationsAPI, progressAPI, scheduledSessionsAPI, chatAPI, mentorsAPI } from '@/lib/api'
import { toast } from 'sonner'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
}

const tabVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

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
  const [mentors, setMentors] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isUsingSearchResults, setIsUsingSearchResults] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return
      
      try {
        setIsLoading(true)
        
        // Fetch all data in parallel
        const [sessionsData, mentorsData] = await Promise.all([
          scheduledSessionsAPI.getAll(token),
          mentorsAPI.getAll()
        ])
        
        setScheduledSessions(sessionsData.sessions || [])
        setMentors(mentorsData.mentors || [])
        
        // Set default stats since we don't have a stats API
        setStats({
          totalSessions: sessionsData.sessions?.length || 0,
          completedSessions: sessionsData.sessions?.filter((s: any) => s.status === 'COMPLETED')?.length || 0,
          pendingSessions: sessionsData.sessions?.filter((s: any) => s.status === 'PENDING')?.length || 0,
          averageRating: 4.8,
        })
        
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [token])

  // Handle search results
  const handleSearchResults = (results: any[]) => {
    setSearchResults(results)
    setIsUsingSearchResults(true)
  }

  const handleSearching = (searching: boolean) => {
    setIsSearching(searching)
  }

  const clearSearch = () => {
    setIsUsingSearchResults(false)
    setSearchResults([])
  }

  // Get the mentors to display (either search results or all mentors)
  const displayMentors = (isUsingSearchResults ? searchResults : mentors).map((mentor: any) => ({
    id: mentor.id,
    name: mentor.name || 'Unknown Mentor',
    avatarUrl: mentor.avatarUrl,
    subjects: Array.isArray(mentor.subjects) ? mentor.subjects : 
              (mentor.profile?.subjects ? 
                (Array.isArray(mentor.profile.subjects) ? mentor.profile.subjects : 
                 String(mentor.profile.subjects).split(',').map((s: string) => s.trim()).filter(Boolean)) : 
               []),
    rating: mentor.rating || mentor.profile?.rating || 0,
    hourlyRate: mentor.hourlyRate || mentor.profile?.hourlyRate || 0,
    successRate: mentor.successRate || mentor.profile?.successRate || 0.82,
    aiScore: mentor.aiScore || mentor.profile?.aiScore || 0.76,
    availableNow: mentor.availableNow || mentor.profile?.availability || false,
    bio: mentor.bio || mentor.profile?.description || "Helpful mentor with practical tips"
  }))

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
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto px-4 space-y-6">
        {/* Welcome and role badge */}
        <motion.div 
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          variants={itemVariants}
        >
          <div>
            <motion.h1 
              className="text-2xl md:text-3xl font-bold tracking-tight"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Dashboard
            </motion.h1>
            <motion.p 
              className="text-muted-foreground"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Welcome back, {user?.name}!
            </motion.p>
          </div>
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Badge className={`${getRoleColor(user?.role || '')} text-white`}>
              {getRoleIcon(user?.role || '')}
              <span className="ml-1">{user?.role}</span>
            </Badge>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </motion.div>
        </motion.div>

        {/* Main Dashboard Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <TabsTrigger value="overview" className="flex items-center gap-2 text-xs sm:text-sm">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2 text-xs sm:text-sm">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Chat</span>
                <span className="sm:hidden">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2 text-xs sm:text-sm">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Calendar</span>
                <span className="sm:hidden">Cal</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2 text-xs sm:text-sm">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Progress</span>
                <span className="sm:hidden">Progress</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 text-xs sm:text-sm relative">
                <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Notifications</span>
                <span className="sm:hidden">Notifs</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="h-4 w-4 p-0 text-xs absolute -top-1 -right-1">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="sync">
              {/* Overview Tab */}
              <TabsContent key="overview" value="overview" className="space-y-6">
                <motion.div
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-6"
                >
                  {/* Search bar and filters */}
                  <motion.div variants={itemVariants}>
                    <SearchBar 
                      onSearchResults={handleSearchResults}
                      onSearching={handleSearching}
                    />
                  </motion.div>

                  {/* Recommended mentors from backend */}
                  <motion.div variants={itemVariants}>
                    {isSearching ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          Searching mentors...
                        </div>
                      </div>
                    ) : (
                      <MatchingResults 
                        mentors={displayMentors as any} 
                        isSearchResults={isUsingSearchResults}
                        onClearSearch={clearSearch}
                      />
                    )}
                  </motion.div>

                  {/* Quick Stats */}
                  <motion.div 
                    className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                    variants={containerVariants}
                  >
                    {[
                      { title: "Total Sessions", value: stats.totalSessions, icon: Calendar, color: "text-blue-500" },
                      { title: "Completed", value: stats.completedSessions, icon: Target, color: "text-green-500" },
                      { title: "Pending", value: stats.pendingSessions, icon: Clock, color: "text-yellow-500" },
                      { title: "Average Rating", value: stats.averageRating, icon: Star, color: "text-yellow-500" }
                    ].map((stat, index) => (
                      <motion.div key={`stat-${stat.title}`} variants={cardVariants} whileHover="hover">
                        <Card className="h-full">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                              {stat.title === "Total Sessions" ? "All time" :
                               stat.title === "Completed" ? "Successfully completed" :
                               stat.title === "Pending" ? "Awaiting response" :
                               "From mentors"}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Recent Activity */}
                  <motion.div variants={itemVariants}>
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
                          {scheduledSessions.slice(0, 3).map((session, index) => (
                            <motion.div 
                              key={`session-${session.id}`} 
                              className="flex items-center justify-between p-3 border rounded-lg"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              whileHover={{ scale: 1.02 }}
                            >
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
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </TabsContent>

              {/* Chat Tab */}
              <TabsContent key="chat" value="chat" className="space-y-6">
                <motion.div
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chat Sessions List */}
                    <motion.div className="lg:col-span-1" variants={itemVariants}>
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Conversations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {chatSessions.map((session, index) => (
                              <motion.div
                                key={`chat-session-${session.id}`}
                                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                  selectedChatSession?.id === session.id
                                    ? 'bg-primary/10 border border-primary/20'
                                    : 'hover:bg-muted'
                                }`}
                                onClick={() => setSelectedChatSession(session)}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
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
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Chat Window */}
                    <motion.div className="lg:col-span-2" variants={itemVariants}>
                      {selectedChatSession ? (
                        <ChatWindow
                          sessionId={selectedChatSession.id}
                          otherUser={selectedChatSession.student?.id === user?.id ? selectedChatSession.mentor : selectedChatSession.student}
                          currentUser={user}
                        />
                      ) : (
                        <Card className="h-96 flex items-center justify-center">
                          <motion.div 
                            className="text-center"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                            <p className="text-muted-foreground">Choose a session to start chatting</p>
                          </motion.div>
                        </Card>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              </TabsContent>

              {/* Calendar Tab */}
              <TabsContent key="calendar" value="calendar" className="space-y-6">
                <motion.div
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <SessionCalendar
                    sessions={scheduledSessions}
                    onSessionCreate={handleSessionCreate}
                    onSessionUpdate={handleSessionUpdate}
                    onSessionDelete={handleSessionDelete}
                    userRole={user?.role as 'STUDENT' | 'MENTOR'}
                    userId={user?.id || 0}
                  />
                </motion.div>
              </TabsContent>

              {/* Progress Tab */}
              <TabsContent key="progress" value="progress" className="space-y-6">
                <motion.div
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
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
                </motion.div>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent key="notifications" value="notifications" className="space-y-6">
                <motion.div
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
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
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  )

  const renderMentorDashboard = () => (
    <motion.div 
      className="space-y-6 container mx-auto px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
      >
        {[
          { title: "Total Students", value: "45", icon: Users, color: "text-blue-500", desc: "Total students" },
          { title: "Sessions Completed", value: "127", icon: Target, color: "text-green-500", desc: "Successfully completed" },
          { title: "Pending Requests", value: "5", icon: Clock, color: "text-yellow-500", desc: "Awaiting response" },
          { title: "Average Rating", value: "4.9", icon: Star, color: "text-yellow-500", desc: "From students" }
        ].map((stat, index) => (
          <motion.div key={stat.title} variants={cardVariants} whileHover="hover">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )

  const renderAdminDashboard = () => (
    <motion.div 
      className="space-y-6 container mx-auto px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
      >
        {[
          { title: "Total Users", value: "1234", icon: Users, color: "text-blue-500", desc: "Registered users" },
          { title: "Active Sessions", value: "89", icon: TrendingUp, color: "text-green-500", desc: "Ongoing sessions" },
          { title: "Pending Issues", value: "23", icon: Clock, color: "text-yellow-500", desc: "Support tickets" },
          { title: "Platform Rating", value: "4.8", icon: Star, color: "text-yellow-500", desc: "Overall satisfaction" }
        ].map((stat, index) => (
          <motion.div key={stat.title} variants={cardVariants} whileHover="hover">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6">
        {user?.role === 'STUDENT' && renderStudentDashboard()}
        {user?.role === 'MENTOR' && renderMentorDashboard()}
        {user?.role === 'ADMIN' && renderAdminDashboard()}
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute allowedRoles={["STUDENT", "MENTOR", "ADMIN"]}>
      <DashboardContent />
    </ProtectedRoute>
  )
}
