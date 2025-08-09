import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home, User, Calendar, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import MySessions from '@/components/my-sessions'
import { useAuth } from '@/contexts/AuthContext'

export default function MySessionsPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-2xl font-bold">My Sessions</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                {user?.name || 'Student'}
              </div>
              <Link to="/">
                <Button variant="outline" size="sm" className="gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Session Overview
              </CardTitle>
              <CardDescription>
                Track your learning progress, manage sessions, and view detailed analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Total Sessions</div>
                    <div className="text-2xl font-bold">12</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <div className="p-2 rounded-full bg-green-500/10">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Active Sessions</div>
                    <div className="text-2xl font-bold">3</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <div className="p-2 rounded-full bg-blue-500/10">
                    <User className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Mentors</div>
                    <div className="text-2xl font-bold">8</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MySessions Component */}
        <MySessions />
      </main>
    </div>
  )
}
