import React from 'react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  File,
  Download,
  ExternalLink
} from 'lucide-react'

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

interface MessageBubbleProps {
  message: ChatMessage
  isOwnMessage: boolean
  currentUser: {
    id: number
    name: string
    avatarUrl?: string
  }
}

const getFileIcon = (fileType?: string) => {
  if (!fileType) return <File className="h-4 w-4" />
  
  const type = fileType.toLowerCase()
  if (type.includes('image')) return <Image className="h-4 w-4" />
  if (type.includes('video')) return <Video className="h-4 w-4" />
  if (type.includes('audio') || type.includes('music')) return <Music className="h-4 w-4" />
  if (type.includes('pdf') || type.includes('document')) return <FileText className="h-4 w-4" />
  if (type.includes('zip') || type.includes('rar')) return <Archive className="h-4 w-4" />
  return <File className="h-4 w-4" />
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'Unknown size'
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date(date))
}

export default function MessageBubble({ message, isOwnMessage, currentUser }: MessageBubbleProps) {
  const messageVariants = {
    hidden: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95,
      x: isOwnMessage ? 20 : -20
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  }

  const bubbleVariants = {
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  }

  return (
    <motion.div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <div className={`flex items-end gap-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isOwnMessage && (
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.fromUser.avatarUrl} />
              <AvatarFallback className="text-xs">
                {message.fromUser.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </motion.div>
        )}

        {/* Message Content */}
        <motion.div
          variants={bubbleVariants}
          className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
        >
          {/* Message Bubble */}
          <Card className={`max-w-full ${
            isOwnMessage 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted'
          }`}>
            <CardContent className="p-3">
              {/* File Attachment */}
              {message.fileUrl && (
                <motion.div
                  className="mb-2 p-2 bg-background/20 rounded-lg border"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-2">
                    {getFileIcon(message.fileType)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {message.fileName || 'File'}
                      </p>
                      <p className="text-xs opacity-70">
                        {formatFileSize(message.fileSize)}
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <a
                        href={message.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-background/20 rounded"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Message Text */}
              {message.message && (
                <motion.p
                  className="text-sm whitespace-pre-wrap break-words"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {message.message}
                </motion.p>
              )}

              {/* AI Message Indicator */}
              {message.isAiMessage && (
                <motion.div
                  className="mt-2 flex items-center gap-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Badge variant="secondary" className="text-xs">
                    AI Assistant
                  </Badge>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Message Info */}
          <motion.div
            className={`flex items-center gap-2 mt-1 text-xs opacity-70 ${
              isOwnMessage ? 'flex-row-reverse' : 'flex-row'
            }`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <span className="text-xs">
              {message.fromUser.name}
            </span>
            <span className="text-xs">
              {formatTime(message.createdAt)}
            </span>
          </motion.div>
        </motion.div>

        {/* Avatar for own messages */}
        {isOwnMessage && (
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser.avatarUrl} />
              <AvatarFallback className="text-xs">
                {currentUser.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
