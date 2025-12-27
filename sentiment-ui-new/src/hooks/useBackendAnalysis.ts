import { useEffect, useRef, useState, useCallback, RefObject } from 'react'
import { websocketService, ConnectionStatus } from '../services/websocket'
import type { BackendEngagement } from '../types/backend'
import { mapBackendEmotion } from '../types/backend'
import type { EmotionType } from '../types/emotion'
import type { FastVLMAnalysis } from './useFastVLM'

interface UseBackendAnalysisOptions {
  videoRef: RefObject<HTMLVideoElement | null>
  enabled?: boolean
  captureInterval?: number // ms between frame captures (default 5000)
  fastvlmAnalysis?: FastVLMAnalysis | null // FastVLM analysis to include with frames
}

interface UseBackendAnalysisReturn {
  isConnected: boolean
  connectionStatus: ConnectionStatus
  engagement: BackendEngagement | null
  currentEmotion: EmotionType | null
  engagementScore: number | null
  connect: () => void
  disconnect: () => void
  lastUpdateTime: number | null
}

export function useBackendAnalysis({
  videoRef,
  enabled = true,
  captureInterval = 5000,
  fastvlmAnalysis = null,
}: UseBackendAnalysisOptions): UseBackendAnalysisReturn {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [engagement, setEngagement] = useState<BackendEngagement | null>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const captureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fastvlmRef = useRef<FastVLMAnalysis | null>(null)

  // Keep fastvlm ref updated
  useEffect(() => {
    fastvlmRef.current = fastvlmAnalysis
  }, [fastvlmAnalysis])

  // Derived state
  const currentEmotion: EmotionType | null = engagement?.persons?.[0]?.details?.dominant_emotion
    ? mapBackendEmotion(engagement.persons[0].details.dominant_emotion)
    : null

  const engagementScore: number | null = engagement?.overall_score ?? null

  // Setup canvas for frame capture
  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas')
    }
    return () => {
      canvasRef.current = null
    }
  }, [])

  // Capture and send frame
  const captureAndSendFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas || !websocketService.isConnected()) {
      return
    }

    // Check if video is ready
    if (!video.videoWidth || !video.videoHeight) {
      console.log('Video not ready, skipping frame capture')
      return
    }

    try {
      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw video frame to canvas
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(video, 0, 0)

      // Convert to base64 JPEG (smaller than PNG)
      const frameData = canvas.toDataURL('image/jpeg', 0.7)

      // Get FastVLM data if available
      const vlmAnalysis = fastvlmRef.current
      const fastvlmText = vlmAnalysis?.text || ''
      const fastvlmKeywords = vlmAnalysis?.keywords
        ? [
            ...vlmAnalysis.keywords.positive,
            ...vlmAnalysis.keywords.negative,
            ...vlmAnalysis.keywords.emotions,
            ...vlmAnalysis.keywords.bodyLanguage,
          ]
        : []

      // Send to backend with FastVLM data
      websocketService.sendFrame(frameData, fastvlmText, fastvlmKeywords)
      console.log('Frame sent to backend', fastvlmText ? `with FastVLM: "${fastvlmText.substring(0, 50)}..."` : '(no VLM data)')
    } catch (error) {
      console.error('Error capturing frame:', error)
    }
  }, [videoRef])

  // Setup WebSocket callbacks
  useEffect(() => {
    websocketService.setCallbacks({
      onConnect: () => {
        console.log('Backend connected')
      },
      onDisconnect: () => {
        console.log('Backend disconnected')
      },
      onEngagementUpdate: (data) => {
        console.log('Received engagement update:', data)
        setEngagement(data)
        setLastUpdateTime(Date.now())
      },
      onError: (error) => {
        console.error('Backend error:', error)
      },
      onStatusChange: (status) => {
        setConnectionStatus(status)
      },
    })

    return () => {
      websocketService.setCallbacks({})
    }
  }, [])

  // Connect/disconnect based on enabled prop
  useEffect(() => {
    if (enabled) {
      websocketService.connect()
    } else {
      websocketService.disconnect()
    }

    return () => {
      // Don't disconnect on unmount if we want to maintain connection
    }
  }, [enabled])

  // Setup frame capture interval
  useEffect(() => {
    if (enabled && connectionStatus === 'connected') {
      // Start capturing frames
      captureIntervalRef.current = setInterval(captureAndSendFrame, captureInterval)

      // Capture first frame immediately
      setTimeout(captureAndSendFrame, 1000)

      return () => {
        if (captureIntervalRef.current) {
          clearInterval(captureIntervalRef.current)
          captureIntervalRef.current = null
        }
      }
    }
  }, [enabled, connectionStatus, captureInterval, captureAndSendFrame])

  const connect = useCallback(() => {
    websocketService.connect()
  }, [])

  const disconnect = useCallback(() => {
    websocketService.disconnect()
    setEngagement(null)
    setLastUpdateTime(null)
  }, [])

  return {
    isConnected: connectionStatus === 'connected',
    connectionStatus,
    engagement,
    currentEmotion,
    engagementScore,
    connect,
    disconnect,
    lastUpdateTime,
  }
}
