import type { VideoFrameMessage, WebSocketMessage, BackendEngagement } from '../types/backend'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface WebSocketCallbacks {
  onConnect?: () => void
  onDisconnect?: () => void
  onEngagementUpdate?: (data: BackendEngagement) => void
  onError?: (error: string) => void
  onStatusChange?: (status: ConnectionStatus) => void
}

class WebSocketService {
  private ws: WebSocket | null = null
  private clientId: string
  private callbacks: WebSocketCallbacks = {}
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  private status: ConnectionStatus = 'disconnected'

  constructor() {
    this.clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }

  setCallbacks(callbacks: WebSocketCallbacks) {
    this.callbacks = callbacks
  }

  getClientId(): string {
    return this.clientId
  }

  getStatus(): ConnectionStatus {
    return this.status
  }

  private setStatus(status: ConnectionStatus) {
    this.status = status
    this.callbacks.onStatusChange?.(status)
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected')
      return
    }

    if (this.ws?.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket already connecting')
      return
    }

    this.setStatus('connecting')

    try {
      const url = `${WS_URL}/${this.clientId}`
      console.log('Connecting to WebSocket:', url)
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.setStatus('connected')
        this.reconnectAttempts = 0
        this.callbacks.onConnect?.()
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onerror = () => {
        // Error details handled in onclose
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.setStatus('disconnected')
        this.ws = null
        this.callbacks.onDisconnect?.()

        // Attempt reconnect with limited retries
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          console.log(`Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`)
          this.reconnectTimeout = setTimeout(() => {
            this.connect()
          }, 3000)
        } else {
          console.log('Max reconnect attempts reached. Running in standalone mode.')
          this.setStatus('error')
        }
      }
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      this.setStatus('error')
    }
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    this.reconnectAttempts = this.maxReconnectAttempts // Prevent auto-reconnect

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.setStatus('disconnected')
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'engagement_update':
        this.callbacks.onEngagementUpdate?.(message.data)
        break
      case 'pong':
        // Heartbeat response
        break
      case 'error':
        console.error('Server error:', message.data)
        this.callbacks.onError?.(message.data)
        break
      default:
        console.log('Unknown message type:', message)
    }
  }

  sendFrame(frameData: string, fastvlmText?: string, fastvlmKeywords?: string[]): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.log('WebSocket not open, cannot send frame')
      return
    }

    const message: VideoFrameMessage = {
      type: 'video_frame',
      frame: frameData,
      fastvlm_text: fastvlmText,
      fastvlm_keywords: fastvlmKeywords,
    }

    this.ws.send(JSON.stringify(message))
  }

  sendPing(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'ping' }))
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// Singleton instance
export const websocketService = new WebSocketService()
