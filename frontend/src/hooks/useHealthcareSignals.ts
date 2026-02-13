import { useState, useEffect, useRef } from 'react'
import { EmotionType } from '../types/emotion'

export interface HealthcareSignals {
  pain: number
  stress: number
  confusion: number
}

interface UseHealthcareSignalsOptions {
  currentEmotion: EmotionType
  faceDetected: boolean
}

// Map emotions to healthcare signal levels
const EMOTION_TO_SIGNALS: Record<EmotionType, HealthcareSignals> = {
  JOY: { pain: 10, stress: 15, confusion: 10 },
  NEUTRAL: { pain: 25, stress: 25, confusion: 20 },
  CONFUSION: { pain: 30, stress: 40, confusion: 75 },
  STRESS: { pain: 50, stress: 80, confusion: 35 },
  ANGER: { pain: 70, stress: 75, confusion: 40 },
}

// Baseline when no face detected
const BASELINE_SIGNALS: HealthcareSignals = { pain: 20, stress: 20, confusion: 15 }

export function useHealthcareSignals({
  currentEmotion,
  faceDetected,
}: UseHealthcareSignalsOptions): HealthcareSignals {
  const [signals, setSignals] = useState<HealthcareSignals>(BASELINE_SIGNALS)
  const targetRef = useRef<HealthcareSignals>(BASELINE_SIGNALS)

  useEffect(() => {
    if (!faceDetected) {
      targetRef.current = BASELINE_SIGNALS
    } else {
      const base = EMOTION_TO_SIGNALS[currentEmotion]
      // Add small random variance for natural feel
      targetRef.current = {
        pain: Math.min(100, Math.max(0, base.pain + (Math.random() - 0.5) * 10)),
        stress: Math.min(100, Math.max(0, base.stress + (Math.random() - 0.5) * 10)),
        confusion: Math.min(100, Math.max(0, base.confusion + (Math.random() - 0.5) * 10)),
      }
    }
  }, [currentEmotion, faceDetected])

  // Smooth interpolation toward target values
  useEffect(() => {
    const interval = setInterval(() => {
      setSignals(current => {
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t
        const smoothing = 0.15 // How quickly values change (0-1)

        return {
          pain: Math.round(lerp(current.pain, targetRef.current.pain, smoothing)),
          stress: Math.round(lerp(current.stress, targetRef.current.stress, smoothing)),
          confusion: Math.round(lerp(current.confusion, targetRef.current.confusion, smoothing)),
        }
      })
    }, 50) // Update every 50ms for smooth animation

    return () => clearInterval(interval)
  }, [])

  return signals
}
