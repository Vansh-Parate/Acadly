import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE } from '../lib/api'
import Header from '@/components/header'
import { CalendarDays, MessageCircle, UserCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { AnimatePresence, motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Request = { id: number; studentId: number; subject: string; message: string | null; createdAt: string; student?: { name?: string | null; email?: string | null } }
type Session = { id: number; subject: string; status: string; createdAt: string; student?: { name?: string | null; email?: string | null } }

export default function MentorSessions() {
  const { token, user } = useAuth()
  const [requests, setRequests] = useState<Request[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [availabilityActive, setAvailabilityActive] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  const [rescheduleFor, setRescheduleFor] = useState<Request | null>(null)
  const [newDate, setNewDate] = useState<string>("")
  const [newTime, setNewTime] = useState<string>("")

  useEffect(() => {
    if (!token) return
    setLoading(true)
    const headers = { Authorization: `Bearer ${token}` }
    Promise.all([
      fetch(`${API_BASE}/mentor/requests`, { headers }).then(r => r.json()).catch(()=>({requests:[]})),
      fetch(`${API_BASE}/sessions/history`, { headers }).then(r => r.json()).catch(()=>({sessions:[]})),
      fetch(`${API_BASE}/mentor/availability`, { headers }).then(r => r.json()).catch(()=>({availability:{active:false}})),
    ])
      .then(([r, s, a]) => {
        setRequests(Array.isArray(r?.requests) ? r.requests : [])
        setSessions(Array.isArray(s?.sessions) ? s.sessions : [])
        setAvailabilityActive(Boolean(a?.availability?.active))
      })
      .finally(() => setLoading(false))
  }, [token])

  const upcoming = useMemo(() => {
    // Take the three most recent ACCEPTED sessions; if none, fall back to latest sessions
    const accepted = sessions.filter(s => s.status === 'ACCEPTED')
    const base = (accepted.length ? accepted : sessions).slice().sort((a,b)=>+new Date(b.createdAt)-+new Date(a.createdAt))
    return base.slice(0,3)
  }, [sessions])

  const toggleAvailability = async () => {
    if (!token) return
    const next = !availabilityActive
    setAvailabilityActive(next)
    await fetch(`${API_BASE}/mentor/availability`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ active: next, slots: [] }),
    })
      .then(() => toast.success(`Availability ${next ? 'enabled' : 'disabled'}`))
      .catch(() => toast.error('Failed to update availability'))
  }

  const accept = async (id: number) => {
    if (!token) return
    try {
      // Accept
      await fetch(`${API_BASE}/mentor/requests/${id}/accept`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } })
      // Refetch sessions to get accurate createdAt; also remove the request with animation
      const accepted = requests.find(r => r.id === id)
      setRequests(prev => prev.filter(r => r.id !== id))
      if (accepted) {
        // Create a reflected session so it appears immediately with same user
        const synthetic: Session = {
          id: accepted.id,
          subject: accepted.subject,
          status: 'ACCEPTED',
          createdAt: new Date().toISOString(),
          student: { name: accepted.student?.name || undefined, email: accepted.student?.email || undefined },
        }
        setSessions(prev => [synthetic, ...prev])
      }
      toast.success('Request accepted')
    } catch {
      toast.error('Failed to accept')
    }
  }

  const decline = async (id: number) => {
    if (!token) return
    try {
      await fetch(`${API_BASE}/mentor/requests/${id}/decline`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } })
      setRequests(prev => prev.filter(r => r.id !== id))
      toast.success('Request declined')
    } catch {
      toast.error('Failed to decline')
    }
  }

  const openReschedule = (r: Request) => {
    setRescheduleFor(r)
    setNewDate("")
    setNewTime("")
  }

  const submitReschedule = async () => {
    const r = rescheduleFor
    if (!token || !r) return
    if (!newDate || !newTime) {
      toast.error('Please select date and time')
      return
    }
    const scheduledAt = new Date(`${newDate}T${newTime}:00`).toISOString()
    const email = r.student?.email || 'alice@example.com'
    try {
      const res = await fetch(`${API_BASE}/sessions/create-by-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ studentEmail: email, subject: r.subject, message: `Rescheduled`, scheduledAt }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      const created = data?.request as Partial<Session> | undefined
      if (created) {
        setSessions(prev => [{
          id: created.id as number,
          subject: created.subject || r.subject,
          status: (created.status as string) || 'ACCEPTED',
          createdAt: scheduledAt,
          student: created.student || { name: r.student?.name || undefined, email },
        }, ...prev])
      }
      toast.success('Session rescheduled')
      setRescheduleFor(null)
    } catch {
      toast.error('Failed to reschedule')
    }
  }

  const startMentoring = async (s: Session) => {
    if (!token) return
    const email = s.student?.email || 'alice@example.com'
    try {
      const res = await fetch(`${API_BASE}/sessions/create-by-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ studentEmail: email, subject: s.subject, message: 'Instant session' }),
      })
      if (!res.ok) throw new Error()
      toast.success('Session started')
    } catch {
      toast.error('Failed to start session')
    }
  }

  // Simple mock chats to match the layout
  const chats = [
    { name: 'Cary Goyette', count: 3, time: '10:33', available: true },
    { name: 'Pauline Jakubowski', count: 2, time: '19:36', available: true },
    { name: 'Luis Nienow', count: 1, time: '07:25', available: true },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Top header */}
        <div className="bg-secondary/50 rounded-lg border p-4 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">Welcome{user?.name ? `, ${user.name.split(' ')[0]}!` : '!'}</h1>
            <p className="text-muted-foreground text-sm">Let’s check your mentoring program</p>
          </div>
          <button
            onClick={toggleAvailability}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm shadow-sm transition-colors ${availabilityActive ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
            aria-pressed={availabilityActive}
          >
            <CalendarDays className="h-4 w-4" />
            {availabilityActive ? 'Available' : 'Unavailable'}
            <span className={`ml-1 inline-block h-2 w-2 rounded-full ${availabilityActive ? 'bg-white' : 'bg-red-500'}`} />
          </button>
        </div>

        {/* Three column layout */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Mentoring Requests */}
          <section className="md:col-span-1">
            <div className="rounded-lg border bg-card">
              <div className="px-4 py-3 border-b">
                <h2 className="font-medium">Mentoring Requests ({requests.length})</h2>
              </div>
              <div className="divide-y">
                {loading ? (
                  <div className="p-4 text-sm text-muted-foreground">Loading...</div>
                ) : requests.length === 0 ? (
                  <div className="p-6 text-sm text-muted-foreground">No pending requests</div>
                ) : (
                  <AnimatePresence initial={false}>
                    {requests.slice(0,3).map((r) => (
                      <motion.div
                        key={r.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="p-4 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <UserCircle2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{r.student?.name || r.student?.email || 'Mentee'}</div>
                            <div className="text-[11px] text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</div>
                            <button onClick={()=>openReschedule(r)} className="text-[11px] text-blue-600 underline mt-1">Change schedule</button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={()=>accept(r.id)} className="rounded-md bg-blue-600 text-white px-3 py-1.5 text-sm hover:bg-blue-700">Accept</button>
                          <button onClick={()=>decline(r.id)} className="rounded-md border px-3 py-1.5 text-sm">Decline</button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </section>

          {/* Upcoming Sessions */}
          <section className="md:col-span-1">
            <div className="rounded-lg border bg-card">
              <div className="px-4 py-3 border-b">
                <h2 className="font-medium">Upcoming Sessions ({upcoming.length})</h2>
              </div>
              <div className="divide-y">
                {upcoming.length === 0 ? (
                  <div className="p-6 text-sm text-muted-foreground">No upcoming sessions</div>
                ) : (
                  <AnimatePresence initial={false}>
                  {upcoming.map((s, idx) => {
                    const d = new Date(s.createdAt)
                    const date = d.toLocaleDateString(undefined,{ month:'short', day:'numeric'})
                    const time = d.toLocaleTimeString(undefined,{ hour:'2-digit', minute:'2-digit'})
                    const disabled = idx !== 0
                    return (
                      <motion.div
                        key={s.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className={`p-4 flex items-center justify-between gap-3 ${disabled ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-md border px-2 py-1 text-center">
                            <div className="text-[10px] text-muted-foreground uppercase">{date.split(' ')[0]}</div>
                            <div className="text-sm font-semibold">{date.split(' ')[1]}</div>
                            <div className="text-[10px] text-muted-foreground">{time}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Mentoring with</div>
                            <div className="text-sm font-medium">{s.student?.name || s.student?.email || 'Student'}</div>
                          </div>
                        </div>
                        <button onClick={()=>!disabled && startMentoring(s)} disabled={disabled} className={`rounded-md px-3 py-1.5 text-sm ${disabled ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                          Start Mentoring
                        </button>
                      </motion.div>
                    )
                  })}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </section>

          {/* Chats */}
          <section className="md:col-span-1">
            <div className="rounded-lg border bg-card">
              <div className="px-4 py-3 border-b">
                <h2 className="font-medium">Chats</h2>
              </div>
              <div className="divide-y">
                {chats.map((c) => (
                  <div key={c.name} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <MessageCircle className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{c.name}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                          Available
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] px-1">{c.count}</span>
                      <span className="text-[11px] text-muted-foreground">{c.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Reschedule Modal */}
        <Dialog open={!!rescheduleFor} onOpenChange={(v)=>!v && setRescheduleFor(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change schedule</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Date</label>
                <Input type="date" value={newDate} onChange={(e)=>setNewDate(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Time</label>
                <Input type="time" value={newTime} onChange={(e)=>setNewTime(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={()=>setRescheduleFor(null)}>Cancel</Button>
              <Button onClick={submitReschedule}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

