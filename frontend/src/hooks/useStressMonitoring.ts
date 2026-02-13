import { useState, useEffect, useRef } from 'react'
import { EmotionType } from '../types/emotion'
import { StressMonitoringResult } from '../types/scenario'

interface UseStressMonitoringOptions {
  currentEmotion: EmotionType
  faceDetected: boolean
}

// Map emotions to stress levels
const EMOTION_TO_STRESS: Record<EmotionType, number> = {
  JOY: 20,
  NEUTRAL: 35,
  CONFUSION: 55,
  STRESS: 75,
  ANGER: 85,
}

const BASELINE_STRESS = 30
const ELEVATED_THRESHOLD = 60

export function useStressMonitoring({
  currentEmotion,
  faceDetected,
}: UseStressMonitoringOptions): StressMonitoringResult {
  const [stressLevel, setStressLevel] = useState(BASELINE_STRESS)
  const targetRef = useRef(BASELINE_STRESS)

  useEffect(() => {
    if (!faceDetected) {
      targetRef.current = BASELINE_STRESS
    } else {
      const base = EMOTION_TO_STRESS[currentEmotion]
      // Add small random variance for natural feel
      targetRef.current = Math.min(100, Math.max(0, base + (Math.random() - 0.5) * 15))
    }
  }, [currentEmotion, faceDetected])

  // Smooth interpolation toward target value
  useEffect(() => {
    const interval = setInterval(() => {
      setStressLevel(current => {
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t
        const smoothing = 0.12
        return Math.round(lerp(current, targetRef.current, smoothing))
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const isElevated = stressLevel >= ELEVATED_THRESHOLD

  return {
    stressLevel,
    isElevated,
    alertMessage: isElevated ? 'Stress level elevated. Consider taking a short break.' : null,
  }
}
