import React from 'react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface TypingIndicatorProps {
  user: {
    id: number
    name: string
    role: 'STUDENT' | 'MENTOR'
    avatarUrl?: string
  }
}

export default function TypingIndicator({ user }: TypingIndicatorProps) {
  return (
    <div className="flex items-end space-x-2 mb-4">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={user.avatarUrl} />
        <AvatarFallback className="text-xs">
          {user.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground mb-1">
          {user.name}
        </span>
        
        <div className="bg-muted rounded-lg px-4 py-2">
          <div className="flex space-x-1">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 bg-muted-foreground rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: index * 0.2
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
