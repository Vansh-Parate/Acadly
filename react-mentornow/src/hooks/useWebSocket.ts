import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { API_BASE } from '@/lib/api'

interface WebSocketMessage {
  type: string
  [key: string]: any
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void
  onError?: (error: Event) => void
  onClose?: () => void
  onOpen?: () => void
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { user, token } = useAuth()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 3 // Reduced from 5
  const reconnectDelay = 2000 // Increased from 1000
  const errorShownRef = useRef(false)

  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  const connect = useCallback(() => {
    if (!token || !user) return

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setIsConnecting(true)
    errorShownRef.current = false
    
    try {
      const wsUrl = 'ws://localhost:3001'
      console.log('Attempting to connect to WebSocket:', wsUrl)
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected successfully')
        setIsConnecting(true)
        errorShownRef.current = false
        
        // Send authentication message immediately
        ws.send(JSON.stringify({
          type: 'auth',
          userId: user.id,
          role: user.role
        }))
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage
          console.log('WebSocket message received:', message)
          
          // Handle authentication confirmation
          if (message.type === 'auth_success') {
            console.log('Authentication successful:', message)
            setIsConnected(true)
            setIsConnecting(false)
            reconnectAttemptsRef.current = 0
            errorShownRef.current = false
            options.onOpen?.()
            return
          }
          
          options.onMessage?.(message)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsConnecting(false)
        
        if (!errorShownRef.current) {
          errorShownRef.current = true
          options.onError?.(error)
        }
      }

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)
        setIsConnecting(false)
        wsRef.current = null

        // Only attempt to reconnect if not a normal closure and we haven't exceeded max attempts
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = reconnectDelay * Math.pow(2, reconnectAttemptsRef.current)
          reconnectAttemptsRef.current++
          
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        } else if (event.code !== 1000) {
          // Show final error message when max attempts reached
          if (!errorShownRef.current) {
            errorShownRef.current = true
            options.onClose?.()
          }
        }
      }
    } catch (error) {
      console.error('Error creating WebSocket connection:', error)
      setIsConnecting(false)
      
      if (!errorShownRef.current) {
        errorShownRef.current = true
        options.onError?.(error as any)
      }
    }
  }, [token, user, options])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User initiated disconnect')
      wsRef.current = null
    }
    
    setIsConnected(false)
    setIsConnecting(false)
    reconnectAttemptsRef.current = 0
    errorShownRef.current = false
  }, [])

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('Sending WebSocket message:', message)
      wsRef.current.send(JSON.stringify(message))
      return true
    }
    console.warn('WebSocket not connected, cannot send message')
    return false
  }, [])

  const joinSession = useCallback((sessionId: number) => {
    return sendMessage({
      type: 'join_session',
      sessionId
    })
  }, [sendMessage])

  const leaveSession = useCallback((sessionId: number) => {
    return sendMessage({
      type: 'leave_session',
      sessionId
    })
  }, [sendMessage])

  const sendChatMessage = useCallback((sessionId: number, message: string) => {
    return sendMessage({
      type: 'message',
      sessionId,
      message
    })
  }, [sendMessage])

  const startTyping = useCallback((sessionId: number) => {
    return sendMessage({
      type: 'typing_start',
      sessionId
    })
  }, [sendMessage])

  const stopTyping = useCallback((sessionId: number) => {
    return sendMessage({
      type: 'typing_stop',
      sessionId
    })
  }, [sendMessage])

  // Auto-connect when component mounts and user is available
  useEffect(() => {
    if (token && user) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [token, user, connect, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    sendMessage,
    joinSession,
    leaveSession,
    sendChatMessage,
    startTyping,
    stopTyping
  }
}
