import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Dialog, { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { API_BASE } from '@/lib/api'
import { toast } from 'sonner'
import ChatWindow from '@/components/chat/ChatWindow'

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

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

export default function MentorDashboard() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<any[]>([])
  const [acceptedSessions, setAcceptedSessions] = useState<any[]>([])
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([])
  const [chatOpen, setChatOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
    fetchAcceptedSessions()
    fetchUpcomingSessions()
  }, [])

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/mentor/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setRequests(data.requests || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
    }
  }

  const fetchAcceptedSessions = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/chat/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setAcceptedSessions(data.sessions || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching accepted sessions:', error)
      setLoading(false)
    }
  }

  const fetchUpcomingSessions = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/mentor/upcoming-sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setUpcomingSessions(data.sessions || [])
    } catch (error) {
      console.error('Error fetching upcoming sessions:', error)
      // If the endpoint doesn't exist yet, we'll use accepted sessions as upcoming
      setUpcomingSessions([])
    }
  }

  const accept = async (requestId: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/mentor/requests/${requestId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        // Find the request that was accepted
        const acceptedRequest = requests.find(req => req.id === requestId)
        if (acceptedRequest) {
          // Create new upcoming session with animation data
          const newUpcomingSession = {
            ...acceptedRequest,
            status: 'ACCEPTED',
            acceptedAt: new Date().toISOString(),
            // Add animation properties
            animateIn: true,
            fromPending: true
          }
          
          // Add to upcoming sessions with animation
          setUpcomingSessions(prev => [newUpcomingSession, ...prev])
          
          // Remove from pending requests with animation
          setRequests(prev => prev.filter(req => req.id !== requestId))
          
          // Update stats
          const updatedStats = stats.map(stat => 
            stat.title === "Pending Requests" 
              ? { ...stat, value: (requests.length - 1).toString() }
              : stat.title === "Upcoming Sessions"
              ? { ...stat, value: (upcomingSessions.length + 1).toString() }
              : stat
          )
        }
        
        // Refresh other data
        fetchAcceptedSessions()
        toast.success('Request accepted!')
      } else {
        toast.error('Failed to accept request.')
      }
    } catch (error) {
      console.error('Error accepting request:', error)
      toast.error('Failed to accept request.')
    }
  }

  const decline = async (requestId: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/mentor/requests/${requestId}/decline`, {
      method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        // Remove from pending requests with animation
        setRequests(prev => prev.filter(req => req.id !== requestId))
        
        // Update stats
        const updatedStats = stats.map(stat => 
          stat.title === "Pending Requests" 
            ? { ...stat, value: (requests.length - 1).toString() }
            : stat
        )
        toast.success('Request declined.')
      } else {
        toast.error('Failed to decline request.')
      }
    } catch (error) {
      console.error('Error declining request:', error)
      toast.error('Failed to decline request.')
    }
  }

  const startChat = (session: any) => {
    setSelectedSession(session)
    setChatOpen(true)
  }

  const stats = [
    { title: "Total Students", value: "45", icon: Users, color: "text-blue-500", desc: "Active students" },
    { title: "Sessions Completed", value: "127", icon: Target, color: "text-green-500", desc: "Successfully completed" },
    { title: "Pending Requests", value: requests.length.toString(), icon: Clock, color: "text-yellow-500", desc: "Awaiting response" },
    { title: "Upcoming Sessions", value: upcomingSessions.length.toString(), icon: Calendar, color: "text-purple-500", desc: "Scheduled sessions" }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span>Loading dashboard...</span>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div 
      className="min-h-screen bg-background p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Mentor Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Welcome back, {user?.name}! Here's your mentoring overview.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
        >
          {stats.map((stat, index) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Requests */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Requests
                </CardTitle>
                <CardDescription>
                  Students waiting for your response
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.length === 0 ? (
                    <motion.div 
                      className="text-center py-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No pending requests</h3>
                      <p className="text-muted-foreground">All requests have been processed!</p>
                    </motion.div>
                  ) : (
                    <AnimatePresence>
                      {requests.map((request, index) => (
                        <motion.div
                          key={request.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, scale: 0.95 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
               <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={request.student?.avatarUrl} />
                              <AvatarFallback>
                                {request.student?.name?.charAt(0) || 'S'}
                              </AvatarFallback>
                            </Avatar>
                 <div>
                              <p className="font-medium">{request.student?.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {request.subject} • {request.duration} minutes
                              </p>
                 </div>
               </div>
                          <div className="flex gap-2">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                size="sm"
                                onClick={() => accept(request.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => decline(request.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Decline
                              </Button>
                            </motion.div>
                 </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
               </div>
             </CardContent>
           </Card>
          </motion.div>

          {/* Upcoming Sessions */}
          <motion.div variants={itemVariants}>
          <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Sessions
                </CardTitle>
                <CardDescription>
                  Accepted sessions ready to start
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                  {upcomingSessions.length === 0 ? (
                    <motion.div 
                      className="text-center py-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No upcoming sessions</h3>
                      <p className="text-muted-foreground">Accept requests to see upcoming sessions here!</p>
                    </motion.div>
                  ) : (
                    <AnimatePresence>
                      {upcomingSessions.map((session, index) => (
                        <motion.div
                          key={session.id}
                          className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-950/20"
                          initial={session.fromPending ? { opacity: 0, y: -20, scale: 0.9 } : { opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ 
                            delay: session.fromPending ? 0 : index * 0.1,
                            duration: session.fromPending ? 0.4 : 0.3,
                            type: session.fromPending ? "spring" : "easeOut"
                          }}
                          whileHover={{ scale: 1.02 }}
                          onAnimationComplete={() => {
                            // Remove animation flags after animation completes
                            if (session.fromPending) {
                              setUpcomingSessions(prev => 
                                prev.map(s => 
                                  s.id === session.id 
                                    ? { ...s, fromPending: false, animateIn: false }
                                    : s
                                )
                              )
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={session.student?.avatarUrl} />
                              <AvatarFallback>
                                {session.student?.name?.charAt(0) || 'S'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{session.student?.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {session.subject} • Accepted {session.acceptedAt ? new Date(session.acceptedAt).toLocaleDateString() : 'recently'}
                              </p>
                            </div>
                    </div>
                          <div className="flex gap-2">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                size="sm"
                                onClick={() => startChat(session)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Start Session
                              </Button>
                            </motion.div>
                  </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </div>

        {/* Mentee List */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Mentee List
              </CardTitle>
              <CardDescription>
                All students you're currently mentoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Student</th>
                      <th className="text-left p-2">Subject</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Last Session</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {acceptedSessions.map((session, index) => (
                      <motion.tr
                        key={session.id}
                        className="border-b hover:bg-muted/50"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={session.student?.avatarUrl} />
                              <AvatarFallback>
                                {session.student?.name?.charAt(0) || 'S'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{session.student?.name}</span>
                          </div>
                        </td>
                        <td className="p-2 text-sm text-muted-foreground">
                          {session.subject || 'General'}
                        </td>
                        <td className="p-2">
                          <Badge variant="default" className="bg-green-600">
                            Active
                          </Badge>
                        </td>
                        <td className="p-2 text-sm text-muted-foreground">
                          {session.messages?.length > 0 ? 'Recently' : 'Never'}
                        </td>
                        <td className="p-2">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startChat(session)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Chat
                            </Button>
                          </motion.div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        </div>

      {/* Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-4xl h-[80vh] p-0">
          <motion.div
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            className="h-full"
          >
            {selectedSession && (
              <ChatWindow
                sessionId={selectedSession.id}
                otherUser={selectedSession.student}
                currentUser={user}
              />
            )}
          </motion.div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
