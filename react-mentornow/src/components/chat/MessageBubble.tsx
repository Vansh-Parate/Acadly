import React from 'react'
import { motion } from 'framer-motion'
import { Download, File, Image, FileText, Check, CheckCheck } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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

interface MessageBubbleProps {
  message: ChatMessage
  isOwnMessage: boolean
}

export default function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return <Image className="h-4 w-4" />
      case 'pdf':
        return <FileText className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const handleFileDownload = () => {
    if (message.fileUrl) {
      const link = document.createElement('a')
      link.href = message.fileUrl
      link.download = message.fileName || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (message.messageType === 'system') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center my-4"
      >
        <Badge variant="secondary" className="text-xs">
          {message.message}
        </Badge>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[70%]`}>
        {!isOwnMessage && (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={message.fromUser.avatarUrl} />
            <AvatarFallback className="text-xs">
              {message.fromUser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          {!isOwnMessage && (
            <span className="text-xs text-muted-foreground mb-1">
              {message.fromUser.name}
            </span>
          )}
          
          <div
            className={`rounded-lg px-4 py-2 max-w-full ${
              isOwnMessage
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            {message.messageType === 'file' ? (
              <div className="flex items-center space-x-2">
                {getFileIcon(message.fileName || '')}
                <span className="text-sm font-medium">
                  {message.fileName || 'File'}
                </span>
                <button
                  onClick={handleFileDownload}
                  className="p-1 hover:bg-black/10 rounded"
                >
                  <Download className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.message}
              </p>
            )}
          </div>
          
          <div className={`flex items-center space-x-1 mt-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-xs text-muted-foreground">
              {format(new Date(message.createdAt), 'HH:mm')}
            </span>
            {isOwnMessage && (
              <div className="flex items-center">
                {message.isRead ? (
                  <CheckCheck className="h-3 w-3 text-blue-500" />
                ) : (
                  <Check className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
