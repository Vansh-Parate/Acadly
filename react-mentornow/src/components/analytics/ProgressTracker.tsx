import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Target, 
  Award, 
  Clock, 
  BookOpen, 
  Star, 
  Calendar,
  Trophy,
  Zap,
  Users,
  CheckCircle,
  BarChart3,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { useAuth } from '@/contexts/AuthContext'
import { progressAPI } from '@/lib/api'

interface ProgressData {
  totalSessions: number
  completedSessions: number
  totalHours: number
  averageRating: number
  subjectsLearned: string[]
  currentStreak: number
  longestStreak: number
  achievements: Achievement[]
  weeklyProgress: WeeklyData[]
  subjectBreakdown: SubjectData[]
  monthlyStats: MonthlyData[]
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: Date
  progress: number
  maxProgress: number
}

interface WeeklyData {
  week: string
  sessions: number
  hours: number
  rating: number
}

interface SubjectData {
  subject: string
  sessions: number
  hours: number
  rating: number
  color: string
}

interface MonthlyData {
  month: string
  sessions: number
  hours: number
  rating: number
}

interface ProgressTrackerProps {
  data?: ProgressData
  userRole: 'STUDENT' | 'MENTOR'
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function ProgressTracker({ data: initialData, userRole }: ProgressTrackerProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [data, setData] = useState<ProgressData>(initialData || {
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
  })
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    const fetchProgressData = async () => {
      if (!token) return
      
      try {
        setLoading(true)
        const analytics = await progressAPI.getAnalytics(token, 30)
        
        // Transform API data to component format
        const transformedData: ProgressData = {
          totalSessions: analytics.totalEntries || 0,
          completedSessions: analytics.totalEntries || 0,
          totalHours: analytics.totalEntries * 1.5 || 0, // Estimate hours
          averageRating: analytics.averageScore || 0,
          subjectsLearned: analytics.subjectAverages?.map((s: any) => s.subject) || [],
          currentStreak: 7, // Mock data
          longestStreak: 14, // Mock data
          achievements: [
            {
              id: '1',
              title: 'First Session',
              description: 'Complete your first tutoring session',
              icon: 'trophy',
              unlockedAt: new Date(),
              progress: 1,
              maxProgress: 1
            },
            {
              id: '2',
              title: 'Consistent Learner',
              description: 'Complete 5 sessions in a week',
              icon: 'star',
              unlockedAt: new Date(),
              progress: 3,
              maxProgress: 5
            }
          ],
          weeklyProgress: analytics.weeklyProgress || [],
          subjectBreakdown: analytics.subjectAverages?.map((s: any, index: number) => ({
            subject: s.subject,
            sessions: s.count,
            hours: s.count * 1.5,
            rating: s.averageScore,
            color: COLORS[index % COLORS.length]
          })) || [],
          monthlyStats: analytics.weeklyProgress || []
        }
        
        setData(transformedData)
      } catch (error) {
        console.error('Error fetching progress data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgressData()
  }, [token])

  const completionRate = data.totalSessions > 0 ? (data.completedSessions / data.totalSessions) * 100 : 0
  const averageHoursPerSession = data.completedSessions > 0 ? data.totalHours / data.completedSessions : 0

  const getAchievementIcon = (icon: string) => {
    switch (icon) {
      case 'trophy': return <Trophy className="h-6 w-6" />
      case 'star': return <Star className="h-6 w-6" />
      case 'zap': return <Zap className="h-6 w-6" />
      case 'users': return <Users className="h-6 w-6" />
      case 'check': return <CheckCircle className="h-6 w-6" />
      default: return <Award className="h-6 w-6" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-muted-foreground">Loading progress data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Progress & Analytics</h2>
        <Badge variant="outline" className="flex items-center gap-1">
          <BarChart3 className="h-3 w-3" />
          {userRole === 'STUDENT' ? 'Learning' : 'Teaching'} Analytics
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              {completionRate.toFixed(1)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              {averageHoursPerSession.toFixed(1)}h per session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Out of 5.0 stars
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.currentStreak}</div>
            <p className="text-xs text-muted-foreground">
              {data.longestStreak} days longest
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {data.weeklyProgress.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.weeklyProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="sessions" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    No progress data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subject Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Subject Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {data.subjectBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.subjectBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ subject, sessions }) => `${subject}: ${sessions}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="sessions"
                      >
                        {data.subjectBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    No subject data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-6">
          <div className="grid gap-4">
            {data.subjectBreakdown.map((subject, index) => (
              <Card key={subject.subject}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: subject.color }}
                      />
                      <div>
                        <h3 className="font-semibold">{subject.subject}</h3>
                        <p className="text-sm text-muted-foreground">
                          {subject.sessions} sessions • {subject.hours.toFixed(1)} hours
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{subject.rating.toFixed(1)}</div>
                      <p className="text-xs text-muted-foreground">Average Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.achievements.map((achievement) => (
              <Card key={achievement.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                      {getAchievementIcon(achievement.icon)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="mt-2" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {data.monthlyStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sessions" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No trend data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
