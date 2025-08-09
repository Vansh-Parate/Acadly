export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001'

// Lightweight WebSocket helper to receive realtime updates
let ws: WebSocket | null = null
export function getSocket() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return ws
  const wsUrl = (API_BASE as string).replace(/^http/, 'ws')
  ws = new WebSocket(wsUrl)
  return ws
}

// API functions for MySessions component
export const fetchStudentSessions = async (token: string) => {
  const response = await fetch(`${API_BASE}/dashboard/student/sessions`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch sessions')
  }
  
  return response.json()
}

export const fetchStudentStats = async (token: string) => {
  const response = await fetch(`${API_BASE}/dashboard/student/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch stats')
  }
  
  return response.json()
}

export const fetchDashboardStats = async (token: string) => {
  const response = await fetch(`${API_BASE}/dashboard/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats')
  }
  
  return response.json()
}
