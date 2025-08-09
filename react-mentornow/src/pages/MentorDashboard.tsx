import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, GraduationCap, Users2, CalendarDays, CheckCircle2, Award, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { API_BASE } from '../lib/api'
import Header from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { AnimatedHighlightedAreaChart } from '@/components/ui/animated-highlighted-chart'

export default function MentorDashboard() {
  const { user, token, logout } = useAuth()
  const [availability, setAvailability] = useState<{ active: boolean; slots: Array<{ day: string; start: string; end: string }> }>({ active: false, slots: [] })
  const [pending, setPending] = useState<Array<{ id: number; studentId: number; subject: string; message: string | null; createdAt: string }>>([])
  const [loading, setLoading] = useState(false)
  const [overview, setOverview] = useState<{ totalMentees: number; upcomingSessions: number; attendanceProgress: number; rewardPoints: number; totals: { totalSessions: number; acceptedSessions: number; thisMonth: number; thisWeek: number } } | null>(null)
  const [allSessions, setAllSessions] = useState<Array<{ id: number; subject: string; status: string; createdAt: string; student?: { email?: string | null; name?: string | null } }>>([])
  const [weekOffset, setWeekOffset] = useState(0)
  const [dayIndex, setDayIndex] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 8

  useEffect(() => {
    if (!token || user?.role !== 'MENTOR') return
    const headers = { Authorization: `Bearer ${token}` }
    Promise.all([
      fetch(`${API_BASE}/mentor/availability`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/mentor/requests`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/mentor/overview`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/sessions/history`, { headers }).then(r => r.json()),
    ]).then(([a, r, o, h]) => {
      if (a?.availability) setAvailability(a.availability)
      if (r?.requests) setPending(r.requests)
      if (o) setOverview(o)
      if (Array.isArray(h?.sessions)) setAllSessions(h.sessions)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [token, user?.role])

  const weekDates = (() => {
    const now = new Date()
    now.setHours(0,0,0,0)
    const start = new Date(now)
    start.setDate(start.getDate() - start.getDay() + weekOffset*7)
    const arr: number[] = []
    for (let i=0;i<7;i++){ const d=new Date(start); d.setDate(start.getDate()+i); arr.push(d.getDate()) }
    const end = new Date(start); end.setDate(start.getDate()+6)
    const format = (d: Date) => d.toLocaleDateString(undefined,{ day:'2-digit', month:'short'})
    return { days: arr, label: `${format(start)} - ${format(end)}` }
  })()

  const filteredSessions = (() => {
    const now = new Date()
    now.setHours(0,0,0,0)
    const start = new Date(now)
    start.setDate(start.getDate() - start.getDay() + weekOffset*7)
    const end = new Date(start)
    end.setDate(start.getDate()+7)
    const sessionsInWeek = allSessions.filter(s => {
      const d = new Date(s.createdAt)
      return d >= start && d < end
    })
    if (dayIndex === null) return sessionsInWeek
    const dayDate = new Date(start)
    dayDate.setDate(start.getDate()+dayIndex)
    return sessionsInWeek.filter(s => {
      const d = new Date(s.createdAt)
      return d.getFullYear()===dayDate.getFullYear() && d.getMonth()===dayDate.getMonth() && d.getDate()===dayDate.getDate()
    })
  })()

  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filteredSessions.slice((currentPage-1)*pageSize, currentPage*pageSize)

  const activityData = (() => {
    // last 14 days
    const days = 14
    const today = new Date()
    today.setHours(0,0,0,0)
    const arr: { date: string; sessions: number }[] = []
    for (let i=days-1;i>=0;i--) {
      const d = new Date(today)
      d.setDate(today.getDate()-i)
      const count = allSessions.filter(s => {
        const t = new Date(s.createdAt)
        return t.getFullYear()===d.getFullYear() && t.getMonth()===d.getMonth() && t.getDate()===d.getDate()
      }).length
      arr.push({ date: d.toLocaleDateString(undefined,{ month:'short', day:'numeric'}), sessions: count })
    }
    return arr
  })()

  const chartTwoSeries = (() => {
    const days = 14
    const today = new Date()
    today.setHours(0,0,0,0)
    const rows: { month: string; desktop: number; mobile: number }[] = []
    for (let i=days-1;i>=0;i--) {
      const d = new Date(today)
      d.setDate(today.getDate()-i)
      const label = d.toLocaleDateString(undefined,{ month:'short', day:'numeric'})
      const total = allSessions.filter(s => {
        const t = new Date(s.createdAt)
        return t.getFullYear()===d.getFullYear() && t.getMonth()===d.getMonth() && t.getDate()===d.getDate()
      }).length
      const finished = allSessions.filter(s => {
        const t = new Date(s.createdAt)
        return s.status==='FINISHED' && t.getFullYear()===d.getFullYear() && t.getMonth()===d.getMonth() && t.getDate()===d.getDate()
      }).length
      rows.push({ month: label, desktop: total, mobile: finished })
    }
    return rows
  })()

  const toggleAvailability = async () => {
    if (!token) return
    const next = { active: !availability.active, slots: availability.slots }
    setAvailability(next)
    await fetch(`${API_BASE}/mentor/availability`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(next),
    })
  }

  const accept = async (id: number) => {
    if (!token) return
    await fetch(`${API_BASE}/mentor/requests/${id}/accept`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } })
    setPending(prev => prev.filter(p => p.id !== id))
  }

  const decline = async (id: number) => {
    if (!token) return
    await fetch(`${API_BASE}/mentor/requests/${id}/decline`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } })
    setPending(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome <span className="align-middle">👋</span></h1>
            <p className="text-muted-foreground text-sm">You have upcoming sessions</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
              <GraduationCap className="inline mr-1 h-4 w-4" />
              Mentor
            </div>
          </div>
        </div>
        {/* Top nav is handled by shared Header with mentor-aware links */}

         {/* KPI row - pixel-perfect to reference */}
         <div className="grid gap-4 md:grid-cols-5 mb-6">
           <Card className="shadow-sm">
             <CardContent className="py-2">
               <div className="flex items-center gap-3">
                 <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                   <Users2 className="h-3.5 w-3.5 text-blue-500" />
                 </span>
                 <div>
                   <div className="text-base font-semibold leading-none">{overview?.totalMentees ?? 0}</div>
                   <div className="text-[10px] text-muted-foreground mt-1">Total Mentee</div>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card className="shadow-sm">
             <CardContent className="py-2">
               <div className="flex items-center gap-3">
                 <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10">
                   <CalendarDays className="h-3.5 w-3.5 text-violet-500" />
                 </span>
                 <div>
                   <div className="text-base font-semibold leading-none">{overview?.upcomingSessions ?? 0}</div>
                   <div className="text-[10px] text-muted-foreground mt-1">Upcoming Session</div>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card className="shadow-sm">
             <CardContent className="py-2">
               <div className="flex items-center gap-3">
                 <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
                   <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                 </span>
                 <div>
                   <div className="text-base font-semibold leading-none">{overview?.attendanceProgress ?? 0}%</div>
                   <div className="text-[10px] text-muted-foreground mt-1">Attendance Progress</div>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card className="shadow-sm">
             <CardContent className="py-2">
               <div className="flex items-center gap-3">
                 <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/10">
                   <Award className="h-3.5 w-3.5 text-pink-500" />
                 </span>
                 <div>
                   <div className="text-base font-semibold leading-none">{overview?.rewardPoints ?? 0}</div>
                   <div className="text-[10px] text-muted-foreground mt-1">Reward Points</div>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card className="shadow-sm">
             <CardContent className="py-2">
               <div className="flex items-center justify-between text-xs font-medium">
                 <button className="p-1 rounded hover:bg-muted" onClick={() => setWeekOffset(weekOffset-1)}><ChevronLeft className="h-4 w-4" /></button>
                 <span className="px-2 py-1 rounded bg-muted text-foreground">{weekDates.label}</span>
                 <button className="p-1 rounded hover:bg-muted" onClick={() => setWeekOffset(weekOffset+1)}><ChevronRight className="h-4 w-4" /></button>
               </div>
               <div className="mt-2 grid grid-cols-7 gap-1 text-[10px] text-muted-foreground">
                 {weekDates.days.map((n,i)=> (
                   <button key={i} className="text-center" onClick={() => { setDayIndex(i===dayIndex ? null : i); setPage(1) }}>
                     <span className={"inline-block min-w-6 rounded-sm py-0.5 " + (i===dayIndex ? 'bg-foreground text-background' : 'bg-muted')}>{n}</span>
                   </button>
                 ))}
               </div>
             </CardContent>
           </Card>
         </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {/* My Mentor Activity - animated two-series sample dataset */}
          <div className="md:col-span-2">
            <AnimatedHighlightedAreaChart />
          </div>

          {/* Overview moved up (replaces students chart) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  {label:'Total Sessions',value:overview?.totals.totalSessions ?? 0,sign:'+'},
                  {label:'Accepted',value:overview?.totals.acceptedSessions ?? 0,sign:'+'},
                  {label:'Finished',value:overview?.finishedSessions ?? 0,sign:'+'},
                  {label:'Cancelled',value:overview?.cancelledSessions ?? 0,sign:'-'},
                  {label:'This Month',value:overview?.totals.thisMonth ?? 0,sign:'+'},
                  {label:'This Week',value:overview?.totals.thisWeek ?? 0,sign:'+'},
                ].map((s)=> (
                  <div key={s.label} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-muted-foreground">{s.label}</div>
                      {s.sign === '+' ? (
                        <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="font-semibold mt-1 text-base">{String(s.value)}</div>
                  </div>
                ))}
                {overview?.topSubject ? (
                  <div className="rounded-lg border p-3 col-span-2">
                    <div className="text-muted-foreground">Top Subject (Month)</div>
                    <div className="font-semibold mt-1 text-base">{overview.topSubject}</div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mentee List full width */}
        <div className="grid gap-6 md:grid-cols-3 mt-6">
          <Card className="md:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Mentee List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground border-b">
                    <tr>
                      <th className="text-left py-2">ID</th>
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Student</th>
                      <th className="text-left py-2">Subject</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((s)=> (
                      <tr key={s.id} className="border-b last:border-0">
                        <td className="py-3">RX-{String(s.id).padStart(4,'0')}</td>
                        <td>{new Date(s.createdAt).toLocaleString()}</td>
                        <td>{s.student?.name || s.student?.email || '—'}</td>
                        <td>{s.subject || '—'}</td>
                        <td>
                          <span className={'px-2 py-1 rounded-full text-xs ' + (s.status==='FINISHED' ? 'bg-emerald-100 text-emerald-700' : s.status==='PENDING' ? 'bg-yellow-100 text-yellow-700' : s.status==='ACCEPTED' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700')}>{s.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <div>
                  Showing {(filteredSessions.length===0)?0:((currentPage-1)*pageSize+1)}–{Math.min(currentPage*pageSize, filteredSessions.length)} of {filteredSessions.length}
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 rounded border disabled:opacity-50" disabled={currentPage<=1} onClick={()=>setPage(currentPage-1)}>Prev</button>
                  <span>Page {currentPage} / {totalPages}</span>
                  <button className="px-2 py-1 rounded border disabled:opacity-50" disabled={currentPage>=totalPages} onClick={()=>setPage(currentPage+1)}>Next</button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
