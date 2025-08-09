import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProtectedRoute  from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Target
} from 'lucide-react'
import { motion } from 'framer-motion'
import Header from '@/components/header'
import SearchBar from '@/components/search-bar'
import MatchingResults from '@/components/matching-results'
import { API_BASE } from '@/lib/api'

function DashboardContent() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState({
    totalSessions: 12,
    completedSessions: 8,
    pendingSessions: 2,
    averageRating: 4.8,
  })

  useEffect(() => {
    // Fetch dashboard stats later if needed
  }, [])

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

        {/* Search bar and filters */}
        <SearchBar />

        {/* Recommended mentors from backend */}
        <MatchingResults mentors={mentors as any} />

        {/* My Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              My Sessions
            </CardTitle>
            <CardDescription>Your upcoming and recent sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                View detailed information about your sessions, progress, and analytics
              </div>
              <Link to="/my-sessions">
                <Button>
                  View All Sessions
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
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
