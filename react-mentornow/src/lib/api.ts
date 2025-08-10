export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Lightweight WebSocket helper to receive realtime updates
let ws: WebSocket | null = null
export function getSocket() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return ws
  const wsUrl = (API_BASE as string).replace(/^http/, 'ws')
  ws = new WebSocket(wsUrl)
  return ws
}

// Student Sessions API
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

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(r => r.json()),

  signup: (email: string, password: string, name: string, role: string) =>
    fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role }),
    }).then(r => r.json()),
}

// Mentors API
export const mentorsAPI = {
  getAll: () => fetch(`${API_BASE}/mentors`).then(r => r.json()),
  getById: (id: number) => fetch(`${API_BASE}/mentors/${id}`).then(r => r.json()),
}

// Sessions API
export const sessionsAPI = {
  getAll: (token: string) =>
    fetch(`${API_BASE}/sessions`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()),

  create: (token: string, data: any) =>
    fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  update: (token: string, id: number, data: any) =>
    fetch(`${API_BASE}/sessions/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  delete: (token: string, id: number) =>
    fetch(`${API_BASE}/sessions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()),
}

// Chat API
export const chatAPI = {
  getSessions: (token: string) =>
    fetch(`${API_BASE}/chat/sessions`, {
      headers: { Authorization: `