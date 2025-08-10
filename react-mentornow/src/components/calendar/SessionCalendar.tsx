import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  MapPin, 
  Video, 
  Phone,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Dialog, { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, addDays, subDays } from 'date-fns'

interface Session {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  mentorId: number
  studentId: number
  mentor?: { name: string }
  student?: { name: string }
  subject: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'PENDING'
  meetingType: 'VIDEO' | 'AUDIO' | 'IN_PERSON'
  location?: string
  meetingLink?: string
}

interface TimeSlot {
  time: string
  available: boolean
  session?: Session
}

interface SessionCalendarProps {
  sessions: Session[]
  onSessionCreate: (session: Omit<Session, 'id'>) => void
  onSessionUpdate: (id: string, updates: Partial<Session>) => void
  onSessionDelete: (id: string) => void
  userRole: 'STUDENT' | 'MENTOR'
  userId: number
}

export default function SessionCalendar({
  sessions,
  onSessionCreate,
  onSessionUpdate,
  onSessionUpdate: onSessionUpdateProp,
  onSessionDelete,
  userRole,
  userId
}: SessionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(),
    subject: '',
    meetingType: 'VIDEO' as const,
    location: '',
    meetingLink: ''
  })

  // Transform API sessions to component format
  const transformedSessions = sessions.map(session => ({
    ...session,
    startTime: new Date(session.startTime),
    endTime: new Date(session.endTime),
    mentorName: session.mentor?.name || 'Unknown Mentor',
    studentName: session.student?.name || 'Unknown Student'
  }))

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentDate),
    end: endOfWeek(currentDate)
  })

  const timeSlots = Array.from({ length: 24 }, (_, i) => ({
    time: `${i.toString().padStart(2, '0')}:00`,
    available: true
  }))

  const getSessionsForDate = (date: Date) => {
    return transformedSessions.filter(session => isSameDay(session.startTime, date))
  }

  const getSessionsForTimeSlot = (date: Date, timeSlot: string) => {
    const hour = parseInt(timeSlot.split(':')[0])
    return transformedSessions.filter(session => {
      const sessionHour = session.startTime.getHours()
      return isSameDay(session.startTime, date) && sessionHour === hour
    })
  }

  const handleCreateSession = () => {
    const sessionData = {
      ...newSession,
      mentorId: userRole === 'MENTOR' ? userId : 0,
      studentId: userRole === 'STUDENT' ? userId : 0,
      mentorName: userRole === 'MENTOR' ? 'You' : 'Mentor',
      studentName: userRole === 'STUDENT' ? 'You' : 'Student'
    }
    onSessionCreate(sessionData)
    setIsCreateDialogOpen(false)
    setNewSession({
      title: '',
      description: '',
      startTime: new Date(),
      endTime: new Date(),
      subject: '',
      meetingType: 'VIDEO',
      location: '',
      meetingLink: ''
    })
  }

  const handleEditSession = () => {
    if (editingSession) {
      onSessionUpdate(editingSession.id, newSession)
      setIsEditDialogOpen(false)
      setEditingSession(null)
    }
  }

  const handleDeleteSession = (sessionId: string) => {
    onSessionDelete(sessionId)
    setIsEditDialogOpen(false)
    setEditingSession(null)
  }

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getMeetingTypeIcon = (type: Session['meetingType']) => {
    switch (type) {
      case 'VIDEO': return <Video className="h-3 w-3" />
      case 'AUDIO': return <Phone className="h-3 w-3" />
      case 'IN_PERSON': return <MapPin className="h-3 w-3" />
      default: return <CalendarIcon className="h-3 w-3" />
    }
  }

  // Show empty state if no sessions
  if (transformedSessions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold tracking-tight">Session Calendar</h2>
            <Badge variant="outline" className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {format(currentDate, 'MMMM yyyy')}
            </Badge>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newSession.title}
                    onChange={(e) => setNewSession(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Session title"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newSession.description}
                    onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Session description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Start Time</label>
                    <Input
                      type="datetime-local"
                      value={format(newSession.startTime, "yyyy-MM-dd'T'HH:mm")}
                      onChange={(e) => setNewSession(prev => ({ 
                        ...prev, 
                        startTime: new Date(e.target.value) 
                      }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">End Time</label>
                    <Input
                      type="datetime-local"
                      value={format(newSession.endTime, "yyyy-MM-dd'T'HH:mm")}
                      onChange={(e) => setNewSession(prev => ({ 
                        ...prev, 
                        endTime: new Date(e.target.value) 
                      }))}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    value={newSession.subject}
                    onChange={(e) => setNewSession(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g., Mathematics, Physics"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Meeting Type</label>
                  <Select
                    value={newSession.meetingType}
                    onValueChange={(value: 'VIDEO' | 'AUDIO' | 'IN_PERSON') => 
                      setNewSession(prev => ({ ...prev, meetingType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIDEO">Video Call</SelectItem>
                      <SelectItem value="AUDIO">Audio Call</SelectItem>
                      <SelectItem value="IN_PERSON">In Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={handleCreateSession} className="flex-1">
                    <Check className="h-4 w-4 mr-2" />
                    Create
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No sessions scheduled</h3>
              <p className="text-muted-foreground mb-4">
                You don't have any sessions scheduled for this week. Create your first session to get started!
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Your First Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold tracking-tight">Session Calendar</h2>
          <Badge variant="outline" className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            {format(currentDate, 'MMMM yyyy')}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(subDays(currentDate, 7))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(addDays(currentDate, 7))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newSession.title}
                    onChange={(e) => setNewSession(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Session title"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newSession.description}
                    onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Session description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Start Time</label>
                    <Input
                      type="datetime-local"
                      value={format(newSession.startTime, "yyyy-MM-dd'T'HH:mm")}
                      onChange={(e) => setNewSession(prev => ({ 
                        ...prev, 
                        startTime: new Date(e.target.value) 
                      }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">End Time</label>
                    <Input
                      type="datetime-local"
                      value={format(newSession.endTime, "yyyy-MM-dd'T'HH:mm")}
                      onChange={(e) => setNewSession(prev => ({ 
                        ...prev, 
                        endTime: new Date(e.target.value) 
                      }))}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    value={newSession.subject}
                    onChange={(e) => setNewSession(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g., Mathematics, Physics"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Meeting Type</label>
                  <Select
                    value={newSession.meetingType}
                    onValueChange={(value: 'VIDEO' | 'AUDIO' | 'IN_PERSON') => 
                      setNewSession(prev => ({ ...prev, meetingType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIDEO">Video Call</SelectItem>
                      <SelectItem value="AUDIO">Audio Call</SelectItem>
                      <SelectItem value="IN_PERSON">In Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={handleCreateSession} className="flex-1">
                    <Check className="h-4 w-4 mr-2" />
                    Create
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-8 border-b">
            <div className="p-3 border-r bg-muted/50"></div>
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="p-3 border-r text-center">
                <div className="text-sm font-medium">
                  {format(day, 'EEE')}
                </div>
                <div className={`text-lg ${
                  isToday(day) ? 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''
                }`}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {timeSlots.map((timeSlot) => (
              <div key={timeSlot.time} className="grid grid-cols-8 border-b">
                <div className="p-2 border-r bg-muted/50 text-xs text-muted-foreground flex items-center justify-center">
                  {timeSlot.time}
                </div>
                {weekDays.map((day) => {
                  const daySessions = getSessionsForTimeSlot(day, timeSlot.time)
                  return (
                    <div key={day.toISOString()} className="p-1 border-r min-h-[60px]">
                      {daySessions.map((session) => (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-primary/10 border border-primary/20 rounded p-2 mb-1 cursor-pointer hover:bg-primary/20 transition-colors"
                          onClick={() => {
                            setEditingSession(session)
                            setNewSession({
                              title: session.title,
                              description: session.description || '',
                              startTime: session.startTime,
                              endTime: session.endTime,
                              subject: session.subject,
                              meetingType: session.meetingType,
                              location: session.location || '',
                              meetingLink: session.meetingLink || ''
                            })
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              {getMeetingTypeIcon(session.meetingType)}
                              <span className="text-xs font-medium truncate">
                                {session.title}
                              </span>
                            </div>
                            <Badge 
                              className={`text-xs ${getStatusColor(session.status)}`}
                            >
                              {session.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {format(session.startTime, 'HH:mm')} - {format(session.endTime, 'HH:mm')}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Session Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Session</DialogTitle>
          </DialogHeader>
          {editingSession && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newSession.title}
                  onChange={(e) => setNewSession(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newSession.description}
                  onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  <Input
                    type="datetime-local"
                    value={format(newSession.startTime, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setNewSession(prev => ({ 
                      ...prev, 
                      startTime: new Date(e.target.value) 
                    }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">End Time</label>
                  <Input
                    type="datetime-local"
                    value={format(newSession.endTime, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setNewSession(prev => ({ 
                      ...prev, 
                      endTime: new Date(e.target.value) 
                    }))}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={newSession.subject}
                  onChange={(e) => setNewSession(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Meeting Type</label>
                <Select
                  value={newSession.meetingType}
                  onValueChange={(value: 'VIDEO' | 'AUDIO' | 'IN_PERSON') => 
                    setNewSession(prev => ({ ...prev, meetingType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIDEO">Video Call</SelectItem>
                    <SelectItem value="AUDIO">Audio Call</SelectItem>
                    <SelectItem value="IN_PERSON">In Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleEditSession} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Update
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteSession(editingSession.id)}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
