import { useAuth } from '../contexts/AuthContext'
import { LogOut, GraduationCap } from 'lucide-react'

export default function MentorDashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
              <GraduationCap className="inline mr-1 h-4 w-4" />
              Mentor
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Mentor Dashboard</h2>
          <p className="text-muted-foreground">
            This is the mentor dashboard. Here you can manage your sessions, students, and profile.
          </p>
        </div>
      </div>
    </div>
  )
}
