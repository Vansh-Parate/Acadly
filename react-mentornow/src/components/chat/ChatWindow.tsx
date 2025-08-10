import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Paperclip, Smile, MoreVertical, Phone, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import FileUpload from './FileUpload'
import { format } from 'date-fns'

interface ChatMessage {
  id: number
  sessionId: number
  fromUserId: number
  message: string
  messageType: 'text' | 'system' | 'file'
  isRead: boolean
  createdAt: string
  fileUrl?: string
  fileName?: string
  fromUser: {
    id: number
    name: string
    role: 'STUDENT' | 'MENTOR'
    avatarUrl?: string
  }
}

interface ChatWindowProps {
  sessionId: number
  otherUser: {
    id: number
    name: string
    role: 'STUDENT' | 'MENTOR'
    avatarUrl?: string
    isOnline?: boolean
  }
  messages: ChatMessage[]
  onSendMessage: (message: string, type?: 'text' | 'file') => void
  onFileUpload: (file: File) => void
  isTyping?: boolean
  onTypingStart?: () => void
  onTypingStop?: () => void
}

export default function ChatWindow({
  sessionId,
  otherUser,
  messages,
  onSendMessage,
  onFileUpload,
  isTyping = false,
  onTypingStart,
  onTypingStop
}: ChatWindowProps) {
  const { user } = useAuth()
  const [inputMessage, setInputMessage] = useState('')
  const [showFileUpload, setShowFileUpload] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage.trim())
      setInputMessage('')
      onTypingStop?.()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value)
    
    // Handle typing indicators
    if (e.target.value && onTypingStart) {
      onTypingStart()
    }
    
    // Clear typing timeout and set new one
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    if (onTypingStop) {
      typingTimeoutRef.current = setTimeout(() => {
        onTypingStop()
      }, 1000)
    }
  }

  const handleFileUpload = (file: File) => {
    onFileUpload(file)
    setShowFileUpload(false)
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser.avatarUrl} />
              <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{otherUser.name}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={otherUser.isOnline ? "default" : "secondary"} className="text-xs">
                  {otherUser.isOnline ? 'Online' : 'Offline'}
                </Badge>
                <span className="text-sm text-muted-foreground capitalize">
                  {otherUser.role.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>Block User</DropdownMenuItem>
                <DropdownMenuItem>Report Issue</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px] px-4">
          <div className="space-y-4 pb-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <MessageBubble
                    message={message}
                    isOwnMessage={message.fromUserId === user?.id}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <TypingIndicator user={otherUser} />
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFileUpload(!showFileUpload)}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="pr-10"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {showFileUpload && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2"
            >
              <FileUpload onUpload={handleFileUpload} />
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
