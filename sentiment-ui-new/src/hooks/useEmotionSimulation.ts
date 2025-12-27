import { useState, useEffect, useCallback } from 'react'
import { EmotionType, EmotionState, EMOTION_WEIGHTS } from '../types/emotion'
import { useSceneStore } from '../stores/sceneStore'

interface UseEmotionSimulationOptions {
  faceDetected: boolean
  intervalMs?: number // Base interval (will add random jitter)
  useBackend?: boolean // Use backend emotion data when available
}

interface UseEmotionSimulationReturn {
  currentEmotion: EmotionState
  focusScore: number
  isFromBackend: boolean // Whether the current emotion is from backend
}

function weightedRandomEmotion(): EmotionType {
  const emotions = Object.keys(EMOTION_WEIGHTS) as EmotionType[]
  const weights = emotions.map(e => EMOTION_WEIGHTS[e])
  const totalWeight = weights.reduce((a, b) => a + b, 0)

  let random = Math.random() * totalWeight
  for (let i = 0; i < emotions.length; i++) {
    random -= weights[i]
    if (random <= 0) return emotions[i]
  }
  return 'NEUTRAL'
}

export function useEmotionSimulation({
  faceDetected,
  intervalMs = 3500,
  useBackend = true,
}: UseEmotionSimulationOptions): UseEmotionSimulationReturn {
  const [simulatedEmotion, setSimulatedEmotion] = useState<EmotionState>({
    type: 'NEUTRAL',
    confidence: 0,
    icon: 'neutral',
  })
  const [simulatedFocusScore, setSimulatedFocusScore] = useState(0)

  // Get backend state
  const backendEmotion = useSceneStore(state => state.backendEmotion)
  const backendEngagement = useSceneStore(state => state.backendEngagement)
  const lastBackendUpdate = useSceneStore(state => state.lastBackendUpdate)

  const generateNewEmotion = useCallback(() => {
    const newType = weightedRandomEmotion()
    const confidence = Math.round(60 + Math.random() * 35) // 60-95%

    setSimulatedEmotion({
      type: newType,
      confidence,
      icon: newType.toLowerCase(),
    })
  }, [])

  const updateFocusScore = useCallback(() => {
    setSimulatedFocusScore(prev => {
      const change = (Math.random() - 0.5) * 15
      const newScore = Math.max(40, Math.min(95, prev + change))
      return Math.round(newScore)
    })
  }, [])

  // Simulation effect
  useEffect(() => {
    if (!faceDetected) {
      setSimulatedEmotion({
        type: 'NEUTRAL',
        confidence: 0,
        icon: 'neutral',
      })
      setSimulatedFocusScore(0)
      return
    }

    // Initial values when face is first detected
    generateNewEmotion()
    setSimulatedFocusScore(Math.round(70 + Math.random() * 20))

    // Set up interval with random jitter
    const scheduleNext = () => {
      const jitter = (Math.random() - 0.5) * 2000 // +/- 1000ms
      return setTimeout(() => {
        generateNewEmotion()
        updateFocusScore()
        timerId = scheduleNext()
      }, intervalMs + jitter)
    }

    let timerId = scheduleNext()

    return () => {
      clearTimeout(timerId)
    }
  }, [faceDetected, intervalMs, generateNewEmotion, updateFocusScore])

  // Determine which emotion to use: backend or simulated
  const hasRecentBackendData = lastBackendUpdate && (Date.now() - lastBackendUpdate < 10000) // 10 second freshness
  const shouldUseBackend = useBackend && backendEmotion && hasRecentBackendData

  // Build the current emotion state
  if (shouldUseBackend && backendEngagement) {
    // Use backend data
    const confidence = Math.round((backendEngagement.overall_score || 0.7) * 100)
    const currentEmotion: EmotionState = {
      type: backendEmotion,
      confidence,
      icon: backendEmotion.toLowerCase(),
    }
    // Convert engagement score to focus score (0-1 to 0-100)
    const focusScore = Math.round((backendEngagement.overall_score || 0.7) * 100)
    return { currentEmotion, focusScore, isFromBackend: true }
  }

  // Use simulated data
  return { currentEmotion: simulatedEmotion, focusScore: simulatedFocusScore, isFromBackend: false }
}
