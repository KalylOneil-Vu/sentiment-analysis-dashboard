/**
 * Unified Emotion Hook
 * Prioritizes real face-api emotions over simulated/backend data.
 *
 * Priority order:
 * 1. Face-API expressions (real-time, highest accuracy)
 * 2. Backend emotion data (10-second freshness)
 * 3. Simulated emotion (fallback only when no face detected)
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useVisionDetection } from '../providers/VisionDetectionProvider'
import { useSceneStore } from '../stores/sceneStore'
import { EmotionType, EmotionState, EMOTION_WEIGHTS } from '../types/emotion'
import type { ExpressionProbabilities } from '../types/visionHUD'

interface UseUnifiedEmotionOptions {
  /** Whether to enable face-api emotion detection */
  useFaceApi?: boolean
  /** Whether to use backend emotion data as fallback */
  useBackend?: boolean
  /** Interval for simulated emotion changes (ms) */
  simulationInterval?: number
}

interface UseUnifiedEmotionReturn {
  /** Current emotion state */
  emotion: EmotionState
  /** Focus/engagement score (0-100) */
  focusScore: number
  /** Source of the current emotion */
  source: 'faceapi' | 'backend' | 'simulated'
  /** Whether a face is currently detected */
  faceDetected: boolean
  /** All expression probabilities from face-api (if available) */
  expressions: ExpressionProbabilities | null
  /** Confidence of the face-api detection */
  faceApiConfidence: number | null
}

/**
 * Map face-api expression names to our EmotionType enum
 * Face-api: happy, sad, angry, surprised, fearful, disgusted, neutral
 * App: JOY, STRESS, NEUTRAL, ANGER, CONFUSION
 */
function mapExpressionToEmotion(expression: keyof ExpressionProbabilities): EmotionType {
  const mapping: Record<keyof ExpressionProbabilities, EmotionType> = {
    happy: 'JOY',
    sad: 'STRESS',        // Map sad to stress (negative valence)
    angry: 'ANGER',
    surprised: 'CONFUSION', // Map surprised to confusion (high arousal)
    fearful: 'STRESS',    // Map fearful to stress (high arousal negative)
    disgusted: 'ANGER',   // Map disgusted to anger (negative valence)
    neutral: 'NEUTRAL',
  }
  return mapping[expression] || 'NEUTRAL'
}

/**
 * Get icon name from emotion type
 */
function getEmotionIcon(type: EmotionType): string {
  return type.toLowerCase()
}

/**
 * Generate weighted random emotion for simulation
 */
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

export function useUnifiedEmotion({
  useFaceApi = true,
  useBackend = true,
  simulationInterval = 3500,
}: UseUnifiedEmotionOptions = {}): UseUnifiedEmotionReturn {
  // Get face-api data from VisionDetectionProvider
  const { faceBio, faceLandmarks } = useVisionDetection()

  // Get backend data from store
  const backendEmotion = useSceneStore(state => state.backendEmotion)
  const backendEngagement = useSceneStore(state => state.backendEngagement)
  const lastBackendUpdate = useSceneStore(state => state.lastBackendUpdate)

  // Simulated emotion state (fallback)
  const [simulatedEmotion, setSimulatedEmotion] = useState<EmotionState>({
    type: 'NEUTRAL',
    confidence: 0,
    icon: 'neutral',
  })
  const [simulatedFocusScore, setSimulatedFocusScore] = useState(0)

  // Check if face is detected
  const faceDetected = useMemo(() => {
    return faceLandmarks !== null && faceLandmarks.length > 0
  }, [faceLandmarks])

  // Generate new simulated emotion
  const generateSimulatedEmotion = useCallback(() => {
    const newType = weightedRandomEmotion()
    const confidence = Math.round(60 + Math.random() * 35) // 60-95%

    setSimulatedEmotion({
      type: newType,
      confidence,
      icon: getEmotionIcon(newType),
    })
  }, [])

  // Update simulated focus score
  const updateSimulatedFocusScore = useCallback(() => {
    setSimulatedFocusScore(prev => {
      const change = (Math.random() - 0.5) * 15
      const newScore = Math.max(40, Math.min(95, prev + change))
      return Math.round(newScore)
    })
  }, [])

  // Run simulation when no face-api data available
  useEffect(() => {
    if (!faceDetected || !useFaceApi) {
      // No face detected, use simulation
      setSimulatedEmotion({
        type: 'NEUTRAL',
        confidence: 0,
        icon: 'neutral',
      })
      setSimulatedFocusScore(0)
      return
    }

    // Face detected but no faceBio yet - run simulation as fallback
    if (!faceBio) {
      generateSimulatedEmotion()
      setSimulatedFocusScore(Math.round(70 + Math.random() * 20))

      const scheduleNext = () => {
        const jitter = (Math.random() - 0.5) * 2000
        return setTimeout(() => {
          generateSimulatedEmotion()
          updateSimulatedFocusScore()
          timerId = scheduleNext()
        }, simulationInterval + jitter)
      }

      let timerId = scheduleNext()
      return () => clearTimeout(timerId)
    }
  }, [faceDetected, faceBio, useFaceApi, simulationInterval, generateSimulatedEmotion, updateSimulatedFocusScore])

  // Determine which emotion source to use
  const result = useMemo((): UseUnifiedEmotionReturn => {
    // Priority 1: Face-API real-time expressions
    if (useFaceApi && faceBio && faceBio.dominantExpression) {
      const emotionType = mapExpressionToEmotion(faceBio.dominantExpression)
      const confidence = Math.round((faceBio.expressions[faceBio.dominantExpression] || 0) * 100)

      return {
        emotion: {
          type: emotionType,
          confidence,
          icon: getEmotionIcon(emotionType),
        },
        focusScore: confidence, // Use expression confidence as focus proxy
        source: 'faceapi',
        faceDetected: true,
        expressions: faceBio.expressions,
        faceApiConfidence: faceBio.expressions[faceBio.dominantExpression] || null,
      }
    }

    // Priority 2: Backend emotion data (if recent)
    const hasRecentBackend = lastBackendUpdate && (Date.now() - lastBackendUpdate < 10000)
    if (useBackend && backendEmotion && hasRecentBackend && backendEngagement) {
      const confidence = Math.round((backendEngagement.overall_score || 0.7) * 100)

      return {
        emotion: {
          type: backendEmotion,
          confidence,
          icon: getEmotionIcon(backendEmotion),
        },
        focusScore: Math.round((backendEngagement.overall_score || 0.7) * 100),
        source: 'backend',
        faceDetected,
        expressions: null,
        faceApiConfidence: null,
      }
    }

    // Priority 3: Simulated emotion (fallback)
    return {
      emotion: simulatedEmotion,
      focusScore: simulatedFocusScore,
      source: 'simulated',
      faceDetected,
      expressions: null,
      faceApiConfidence: null,
    }
  }, [
    useFaceApi,
    faceBio,
    useBackend,
    backendEmotion,
    backendEngagement,
    lastBackendUpdate,
    simulatedEmotion,
    simulatedFocusScore,
    faceDetected,
  ])

  return result
}
