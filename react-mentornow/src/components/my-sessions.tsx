import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  MessageSquare, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Target,
  Star,
  FileText,
  Video,
  Phone,
  MapPin,
  Users,
  Award,
  BarChart3
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fetchStudentSessions, fetchStudentStats } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface Session {
  id: number
  subject: string
  mentor: {
    id: number
    name: string
    avatarUrl?: string
    rating: number
    hourlyRate: number
  }
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'FINISHED'
  message: string
  urgencyScore: number
  matchScore: number
  createdAt: string
  scheduledAt?: string
  duration?: number
  totalCost?: number
  progress?: number
  topics?: string[]
  aiAnalysis?: {
    difficulty: string
    estimatedTime: number
    recommendedApproach: string
    relatedTopics: string[]
  }
}

interface SessionStats {
  totalSessions: number
  completedSessions: number
  pendingSessions: number
  totalSpent: number
  averageRating: number
  totalHours: number
  subjects: { [key: string]: number }
  monthlySpending: { month: string; amount: number }[]
}

export default function MySessions() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [stats, setStats] = useState<SessionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchSessions()
    fetchStats()
  }, [])

    const fetchSessions = async () => {
    try {
      if (!user) return
      
      // Get token from localStorage or context
      const token = localStorage.getItem('token') || ''
      if (!token) {
        console.warn('No authentication token found')
        return
      }

      const sessionsData = await fetchStudentSessions(token)
      setSessions(sessionsData)
    } catch (error) {
      console.error('Error fetching sessions:', error)
      // Fallback to mock data if API fails
      const mockSessions: Session[] = [
        {
          id: 1,
          subject: 'Calculus',
          mentor: {
            id: 1,
            name: 'Dr. Alex Carter',
            avatarUrl: '/placeholder-user.jpg',
            rating: 4.9,
            hourlyRate: 45
          },
          status: 'ACCEPTED',
          message: 'I need help with integration techniques and understanding the fundamental theorem of calculus.',
          urgencyScore: 0.8,
          matchScore: 0.95,
          createdAt: '2024-01-15T10:00:00Z',
          scheduledAt: '2024-01-20T18:00:00Z',
          duration: 60,
          totalCost: 45,
          progress: 75,
          topics: ['Integration', 'Fundamental Theorem', 'Applications'],
          aiAnalysis: {
            difficulty: 'Intermediate',
            estimatedTime: 60,
            recommendedApproach: 'Start with basic integration rules, then move to applications',
            relatedTopics: ['Derivatives', 'Limits', 'Series']
          }
        }
      ]
      setSessions(mockSessions)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      if (!user) return
      
      // Get token from localStorage or context
      const token = localStorage.getItem('token') || ''
      if (!token) {
        console.warn('No authentication token found')
        return
      }

      const statsData = await fetchStudentStats(token)
      setStats(statsData)
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Fallback to mock data if API fails
      const mockStats: SessionStats = {
        totalSessions: 12,
        completedSessions: 8,
        pendingSessions: 2,
        totalSpent: 450,
        averageRating: 4.8,
        totalHours: 18,
        subjects: {
          'Calculus': 4,
          'Chemistry': 3,
          'Physics': 2,
          'Biology': 2,
          'Computer Science': 1
        },
        monthlySpending: [
          { month: 'Jan', amount: 150 },
          { month: 'Dec', amount: 200 },
          { month: 'Nov', amount: 100 }
        ]
      }
      setStats(mockStats)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500'
      case 'ACCEPTED': return 'bg-blue-500'
      case 'REJECTED': return 'bg-red-500'
      case 'CANCELLED': return 'bg-gray-500'
      case 'FINISHED': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'ACCEPTED': return <CheckCircle className="h-4 w-4" />
      case 'REJECTED': return <XCircle className="h-4 w-4" />
      case 'CANCELLED': return <XCircle className="h-4 w-4" />
      case 'FINISHED': return <CheckCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getUrgencyColor = (score: number) => {
    if (score >= 0.8) return 'text-red-600'
    if (score >= 0.6) return 'text-orange-600'
    return 'text-green-600'
  }

  const filteredSessions = sessions.filter(session => {
    if (activeTab === 'all') return true
    return session.status.toLowerCase() === activeTab
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSessions || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedSessions || 0}</div>
            <p className="text-xs text-muted-foreground">Successfully finished</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalSpent || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageRating || 0}</div>
            <p className="text-xs text-muted-foreground">From mentors</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sessions List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                My Sessions
              </CardTitle>
              <CardDescription>Track your learning progress and session history</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="accepted">Accepted</TabsTrigger>
                  <TabsTrigger value="finished">Finished</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab} className="mt-4">
                  <div className="space-y-4">
                    {filteredSessions.map((session) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            {/* Header */}
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={session.mentor.avatarUrl} />
                                <AvatarFallback>{session.mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{session.subject}</h3>
                                <p className="text-sm text-muted-foreground">with {session.mentor.name}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={`${getStatusColor(session.status)} text-white`}>
                                  {getStatusIcon(session.status)}
                                  <span className="ml-1">{session.status}</span>
                                </Badge>
                                <Badge variant="outline" className={getUrgencyColor(session.urgencyScore)}>
                                  Urgency: {Math.round(session.urgencyScore * 100)}%
                                </Badge>
                              </div>
                            </div>

                            {/* Session Details */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{session.duration ? `${session.duration} min` : 'TBD'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span>${session.totalCost || session.mentor.hourlyRate}/hr</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-muted-foreground" />
                                <span>{session.mentor.rating}/5.0</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-muted-foreground" />
                                <span>Match: {Math.round(session.matchScore * 100)}%</span>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            {session.progress !== undefined && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Progress</span>
                                  <span>{session.progress}%</span>
                                </div>
                                <Progress value={session.progress} className="h-2" />
                              </div>
                            )}

                            {/* AI Analysis */}
                            {session.aiAnalysis && (
                              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                  <BarChart3 className="h-4 w-4" />
                                  AI Analysis
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                  <div>
                                    <span className="text-muted-foreground">Difficulty:</span>
                                    <Badge variant="outline" className="ml-1">{session.aiAnalysis.difficulty}</Badge>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Est. Time:</span>
                                    <span className="ml-1">{session.aiAnalysis.estimatedTime} min</span>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-muted-foreground">Approach:</span>
                                    <span className="ml-1">{session.aiAnalysis.recommendedApproach}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Topics */}
                            {session.topics && (
                              <div className="flex flex-wrap gap-2">
                                {session.topics.map((topic, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Message */}
                            <p className="text-sm text-muted-foreground">{session.message}</p>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                              {session.status === 'ACCEPTED' && (
                                <Button size="sm" className="flex-1">
                                  <Video className="mr-2 h-4 w-4" />
                                  Join Session
                                </Button>
                              )}
                              {session.status === 'PENDING' && (
                                <div className="flex gap-2 flex-1">
                                  <Button size="sm" variant="outline" className="flex-1">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Message
                                  </Button>
                                  <Button size="sm" variant="outline" className="flex-1">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel
                                  </Button>
                                </div>
                              )}
                              {session.status === 'FINISHED' && (
                                <div className="flex gap-2 flex-1">
                                  <Button size="sm" variant="outline" className="flex-1">
                                    <Star className="mr-2 h-4 w-4" />
                                    Rate Session
                                  </Button>
                                  <Button size="sm" variant="outline" className="flex-1">
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Notes
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Learning Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total Hours</span>
                  <span className="font-medium">{stats?.totalHours || 0}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>This Month</span>
                  <span className="font-medium">{stats?.monthlySpending?.[0]?.amount || 0}h</span>
                </div>
                <Progress value={75} className="h-2" />
                <p className="text-xs text-muted-foreground">75% of monthly goal</p>
              </div>
            </CardContent>
          </Card>

          {/* Subject Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Subject Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.subjects && Object.entries(stats.subjects).map(([subject, count]) => (
                  <div key={subject} className="flex items-center justify-between">
                    <span className="text-sm">{subject}</span>
                    <Badge variant="outline">{count} sessions</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Spending Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Spending Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold">${stats?.totalSpent || 0}</div>
                <p className="text-xs text-muted-foreground">Total spent on sessions</p>
                <div className="space-y-2">
                  {stats?.monthlySpending?.map((month, index) => (
                    <div key={month.month} className="flex justify-between text-sm">
                      <span>{month.month}</span>
                      <span>${month.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" size="sm">
                <BookOpen className="mr-2 h-4 w-4" />
                Book New Session
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <MessageSquare className="mr-2 h-4 w-4" />
                View Messages
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
