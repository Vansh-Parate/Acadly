import { ReactNode, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import { API_BASE } from '@/lib/api'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: ('STUDENT' | 'MENTOR' | 'ADMIN')[]
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = ['STUDENT', 'MENTOR', 'ADMIN'] 
}: ProtectedRouteProps) {
  const { user, token, login } = useAuth()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const check = async () => {
      try {
        const savedToken = token || localStorage.getItem('token')
        if (!savedToken) { setAuthorized(false); return }
        const res = await fetch(`${API_BASE}/auth/verify`, { headers: { Authorization: `Bearer ${savedToken}` } })
        if (!res.ok) { setAuthorized(false); return }
        const data = await res.json()
        if (data?.user) {
          // Ensure context has user/token
          if (!user) login(savedToken, data.user)
          if (!allowedRoles.includes(data.user.role)) { setAuthorized(false); return }
          setAuthorized(true)
        } else {
          setAuthorized(false)
        }
      } catch {
        setAuthorized(false)
      } finally {
        setLoading(false)
      }
    }
    check()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}