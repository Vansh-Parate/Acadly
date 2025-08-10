export const API_BASE = 'http://localhost:3001'

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
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()),

  getMessages: (token: string, sessionId: number, page = 1, limit = 50) =>
    fetch(`${API_BASE}/chat/${sessionId}/messages?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()),

  sendMessage: (token: string, sessionId: number, message: string, fileData?: {
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
  }) =>
    fetch(`${API_BASE}/chat/${sessionId}/message`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ message, ...fileData }),
    }).then(r => r.json()),
}

// Notifications API
export const notificationsAPI = {
  getAll: (token: string, page = 1, limit = 20, unreadOnly = false) =>
    fetch(`${API_BASE}/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()),

  create: (token: string, data: {
    userId: number;
    type: 'MESSAGE' | 'SESSION' | 'RATING' | 'REMINDER' | 'SYSTEM';
    title: string;
    message: string;
    relatedId?: number;
    relatedType?: string;
  }) =>
    fetch(`${API_BASE}/notifications`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  markAsRead: (token: string, id: number) =>
    fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()),

  markAllAsRead: (token: string) =>
    fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()),

  delete: (token: string, id: number) =>
    fetch(`${API_BASE}/notifications/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()),
}

// Progress API
export const progressAPI = {
  getAll: (token: string, filters?: {
    subject?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })
    }
    
    return fetch(`${API_BASE}/progress?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json())
  },

  create: (token: string, data: {
    subject: string;
    score: number;
    maxScore: number;
    type: 'QUIZ' | 'ASSIGNMENT' | 'PROJECT' | 'SESSION' | 'MILESTONE';
    description?: string;
  }) =>
    fetch(`${API_BASE}/progress`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  getAnalytics: (token: string, period = 30) =>
    fetch(`${API_BASE}/progress/analytics?period=${period}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()),

  update: (token: string, id: number, data: {
    subject: string;
    score: number;
    maxScore: number;
    type: 'QUIZ' | 'ASSIGNMENT' | 'PROJECT' | 'SESSION' | 'MILESTONE';
    description?: string;
  }) =>
    fetch(`${API_BASE}/progress/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  delete: (token: string, id: number) =>
    fetch(`${API_BASE}/progress/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()),
}

// Scheduled Sessions API
export const scheduledSessionsAPI = {
  getAll: (token: string, filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })
    }
    
    return fetch(`${API_BASE}/scheduled-sessions?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json())
  },

  create: (token: string, data: {
    studentId: number;
    mentorId: number;
    title: string;
    description?: string;
    subject: string;
    startTime: string;
    endTime: string;
    meetingType: 'VIDEO' | 'AUDIO' | 'IN_PERSON';
    location?: string;
    meetingLink?: string;
  }) =>
    fetch(`${API_BASE}/scheduled-sessions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  update: (token: string, id: number, data: any) =>
    fetch(`${API_BASE}/scheduled-sessions/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  delete: (token: string, id: number) =>
    fetch(`${API_BASE}/scheduled-sessions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()),

  getCalendar: (token: string, startDate: string, endDate: string) =>
    fetch(`${API_BASE}/scheduled-sessions/calendar?startDate=${startDate}&endDate=${endDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()),
}
