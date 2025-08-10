import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Paperclip, User, Loader2, Wifi, WifiOff, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { useWebSocket } from '@/hooks/useWebSocket'
import { chatAPI } from '@/lib/api'
import MessageBubble from './MessageBubble'
import { toast } from 'sonner'

// Animation variants
const messageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

const typingVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
}

const connectionVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

interface ChatMessage {
  id: string
  sessionId: number
  fromUserId: number
  message: string
  isAiMessage: boolean
  aiTopics: string[]
  createdAt: Date
  fromUser: {
    id: number
    name: string
    avatarUrl?: string
  }
  fileUrl?: string
  fileName?: string
  fileSize?: number
  fileType?: string
}

interface ChatWindowProps {
  sessionId: number
  otherUser: {
    id: number
    name: string
    avatarUrl?: string
  }
  currentUser: {
    id: number
    name: string
    avatarUrl?: string
  }
}

export default function ChatWindow({ sessionId, otherUser, currentUser }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set())
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { token } = useAuth()

  // WebSocket connection
  const {
    isConnected,
    isConnecting,
    joinSession,
    leaveSession,
    sendChatMessage,
    startTyping,
    stopTyping
  } = useWebSocket({
    onMessage: handleWebSocketMessage,
    onError: (error) => {
      console.error('WebSocket error:', error)
    },
    onClose: () => {
      console.log('WebSocket connection closed')
    },
    onOpen: () => {
      console.log('WebSocket connection opened')
    }
  })

  // Debug logging
  useEffect(() => {
    console.log('ChatWindow - Connection status:', { isConnected, isConnecting, sessionId })
  }, [isConnected, isConnecting, sessionId])

  function handleWebSocketMessage(message: { type: string; userId?: number; role?: string; message?: any }) {
    switch (message.type) {
      case 'new_message':
        setMessages(prev => [...prev, message.message])
        scrollToBottom()
        break

      case 'typing_start':
        if (message.userId !== currentUser.id) {
          setTypingUsers(prev => new Set(prev).add(message.userId!))
        }
        break

      case 'typing_stop':
        if (message.userId !== currentUser.id) {
          setTypingUsers(prev => {
            const newSet = new Set(prev)
            newSet.delete(message.userId!)
            return newSet
          })
        }
        break

      case 'user_joined':
        if (message.userId !== currentUser.id) {
          toast.info(`${message.role === 'MENTOR' ? 'Mentor' : 'Student'} joined the chat`)
        }
        break

      case 'user_left':
        if (message.userId !== currentUser.id) {
          toast.info(`${message.role === 'MENTOR' ? 'Mentor' : 'Student'} left the chat`)
        }
        break

      case 'error':
        toast.error(message.message || 'An error occurred')
        break
    }
  }

  // Load initial messages
  useEffect(() => {
    if (sessionId && token) {
      setIsLoading(true)
      chatAPI.getMessages(token, sessionId)
        .then(data => {
          setMessages(data.messages || [])
          setIsLoading(false)
          setTimeout(scrollToBottom, 100)
        })
        .catch(error => {
          console.error('Error loading messages:', error)
          setIsLoading(false)
        })
    }
  }, [sessionId, token])

  // Join/leave session
  useEffect(() => {
    if (isConnected && sessionId) {
      joinSession(sessionId)
    }

    return () => {
      if (sessionId) {
        leaveSession(sessionId)
      }
    }
  }, [isConnected, sessionId, joinSession, leaveSession])

  // Typing indicator cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !isConnected) return

    const message = newMessage.trim()
    setNewMessage('')
    
    if (sendChatMessage(sessionId, message)) {
      // Stop typing indicator
      stopTyping(sessionId)
      setIsTyping(false)
    } else {
      toast.error('Failed to send message. Please check your connection.')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      // In a real implementation, you'd upload the file to a service
      toast.info('File upload feature coming soon!')
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Failed to upload file')
    }
  }

  const isOtherUserTyping = typingUsers.size > 0

  return (
    <motion.div 
      className="flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
              <AvatarImage src={otherUser.avatarUrl} />
              <AvatarFallback className="text-xs sm:text-sm">
                {otherUser.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-sm sm:text-base">{otherUser.name}</CardTitle>
              <motion.div 
                className="flex items-center space-x-2"
                variants={connectionVariants}
                initial="hidden"
                animate="visible"
              >
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-xs text-muted-foreground">
                  {isConnected ? 'Online' : 'Offline'}
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading messages...</span>
            </motion.div>
          </div>
        ) : (
          <ScrollArea 
            ref={scrollAreaRef}
            className="h-full px-4 py-4"
          >
            <div className="space-y-4">
              {messages.length === 0 ? (
                <motion.div 
                  className="flex flex-col items-center justify-center h-64 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                  <p className="text-muted-foreground">Start the conversation by sending a message!</p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      variants={messageVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      transition={{ delay: index * 0.05 }}
                    >
                      <MessageBubble
                        message={message}
                        isOwnMessage={message.fromUserId === currentUser.id}
                        currentUser={currentUser}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {/* Typing Indicator */}
              <AnimatePresence>
                {isOtherUserTyping && (
                  <motion.div
                    variants={typingVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <div className="flex space-x-1">
                      <motion.div
                        className="w-2 h-2 bg-muted-foreground rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-muted-foreground rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-muted-foreground rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                    <span>{otherUser.name} is typing...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-background">
        {!isConnected && (
          <motion.div 
            className="mb-2 text-xs text-gray-500 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Messages will be sent when connection is restored.
          </motion.div>
        )}
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={() => {
              // File upload functionality
              toast.info('File upload coming soon!')
            }}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="flex-1">
            <Input
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value)
                // Handle typing indicators
                if (!isTyping) {
                  setIsTyping(true)
                  startTyping(sessionId)
                }
                
                if (typingTimeoutRef.current) {
                  clearTimeout(typingTimeoutRef.current)
                }
                
                typingTimeoutRef.current = setTimeout(() => {
                  setIsTyping(false)
                  stopTyping(sessionId)
                }, 1000)
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="min-h-[40px] max-h-24 resize-none"
              disabled={!isConnected}
            />
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !isConnected}
              size="sm"
              className="px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
