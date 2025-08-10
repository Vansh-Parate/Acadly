import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, AlertCircle, Info, MessageSquare, Calendar, Star, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'

export interface Notification {
  id: string
  type: 'MESSAGE' | 'SESSION' | 'RATING' | 'REMINDER' | 'SYSTEM'
  title: string
  message: string
  createdAt: Date
  isRead: boolean
  relatedId?: number
  relatedType?: string
}

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDelete: (id: string) => void
  onAction?: (notification: Notification) => void
}

export default function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onAction
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  // Transform API notifications to component format
  const transformedNotifications = notifications.map(notification => ({
    ...notification,
    timestamp: new Date(notification.createdAt),
    type: notification.type.toLowerCase() as any
  }))

  const unreadCount = transformedNotifications.filter(n => !n.isRead).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case 'session':
        return <Calendar className="h-4 w-4 text-purple-500" />
      case 'rating':
        return <Star className="h-4 w-4 text-yellow-500" />
      case 'reminder':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'system':
        return <Info className="h-4 w-4 text-gray-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:bg-green-950/20'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20'
      case 'error':
        return 'border-red-200 bg-red-50 dark:bg-red-950/20'
      case 'message':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-950/20'
      case 'session':
        return 'border-purple-200 bg-purple-50 dark:bg-purple-950/20'
      case 'rating':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20'
      case 'reminder':
        return 'border-orange-200 bg-orange-50 dark:bg-orange-950/20'
      case 'system':
        return 'border-gray-200 bg-gray-50 dark:bg-gray-950/20'
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-950/20'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return timestamp.toLocaleDateString()
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id)
    }
    if (onAction) {
      onAction(notification)
    }
  }

  // Show empty state if no notifications
  if (transformedNotifications.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
          <Badge variant="outline" className="flex items-center gap-1">
            <Bell className="h-3 w-3" />
            All caught up!
          </Badge>
        </div>

        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                You're all caught up! New notifications will appear here when you have updates.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Bell className="h-3 w-3" />
            {unreadCount} unread
          </Badge>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {transformedNotifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-2"
            >
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !notification.isRead ? 'ring-2 ring-primary/20' : ''
                } ${getNotificationColor(notification.type)}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium text-foreground">
                          {notification.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(notification.id)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        
                        {!notification.isRead && (
                          <Badge variant="secondary" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
