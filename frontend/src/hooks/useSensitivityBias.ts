import { useState, useEffect, useRef } from 'react'
import { EmotionType } from '../types/emotion'

export interface BiasMetrics {
  mood: { type: EmotionType; label: string; confidence: number }
  threat: { value: number; confidence: number }
  focus: { value: number; confidence: number }
  age: { value: number; confidence: number }
}

interface UseSensitivityBiasOptions {
  currentEmotion: EmotionType
  sensitivity: number // 0-100
  faceDetected: boolean
}

// Emotion to mood mapping
const EMOTION_TO_MOOD: Record<EmotionType, { type: EmotionType; label: string }> = {
  JOY: { type: 'JOY', label: 'Happy' },
  NEUTRAL: { type: 'NEUTRAL', label: 'Neutral' },
  STRESS: { type: 'STRESS', label: 'Stressed' },
  ANGER: { type: 'ANGER', label: 'Angry' },
  CONFUSION: { type: 'CONFUSION', label: 'Confused' },
}

// Base threat levels by emotion
const EMOTION_TO_THREAT: Record<EmotionType, number> = {
  JOY: 10,
  NEUTRAL: 20,
  CONFUSION: 35,
  STRESS: 55,
  ANGER: 70,
}

export function useSensitivityBias({
  currentEmotion,
  sensitivity,
  faceDetected,
}: UseSensitivityBiasOptions): BiasMetrics {
  const [metrics, setMetrics] = useState<BiasMetrics>({
    mood: { type: 'NEUTRAL', label: 'Neutral', confidence: 50 },
    threat: { value: 20, confidence: 50 },
    focus: { value: 50, confidence: 50 },
    age: { value: 30, confidence: 50 },
  })

  const targetRef = useRef<BiasMetrics>(metrics)
  const ageBaseRef = useRef(Math.floor(Math.random() * 20) + 25) // Random base age 25-45

  useEffect(() => {
    if (!faceDetected) {
      targetRef.current = {
        mood: { type: 'NEUTRAL', label: 'Unknown', confidence: 0 },
        threat: { value: 0, confidence: 0 },
        focus: { value: 0, confidence: 0 },
        age: { value: 0, confidence: 0 },
      }
      return
    }

    // Sensitivity affects variance and confidence
    // Low sensitivity (0-30): High confidence, stable, may miss emotions
    // Medium (30-70): Balanced
    // High (70-100): Low confidence, unstable, over-reactive

    const sensitivityFactor = sensitivity / 100
    const instability = Math.pow(sensitivityFactor, 2) // Exponential instability at high sensitivity
    const baseConfidence = 95 - sensitivityFactor * 60 // 95% at low, 35% at high

    // Calculate mood
    const moodData = EMOTION_TO_MOOD[currentEmotion]
    const moodConfidence = Math.max(
      10,
      Math.round(baseConfidence + (Math.random() - 0.5) * instability * 40)
    )

    // Calculate threat
    const baseThreat = EMOTION_TO_THREAT[currentEmotion]
    const threatVariance = instability * 30 * (Math.random() - 0.5)
    const threatValue = Math.max(0, Math.min(100, Math.round(baseThreat + threatVariance)))
    const threatConfidence = Math.max(
      10,
      Math.round(baseConfidence + (Math.random() - 0.5) * instability * 40)
    )

    // Calculate focus
    const baseFocus = 75
    const focusVariance = instability * 40 * (Math.random() - 0.5)
    const focusValue = Math.max(0, Math.min(100, Math.round(baseFocus + focusVariance)))
    const focusConfidence = Math.max(
      10,
      Math.round(baseConfidence + (Math.random() - 0.5) * instability * 40)
    )

    // Calculate age
    const ageVariance = instability * 15 * (Math.random() - 0.5)
    const ageValue = Math.max(18, Math.min(65, Math.round(ageBaseRef.current + ageVariance)))
    const ageConfidence = Math.max(
      10,
      Math.round(baseConfidence * 0.6 + (Math.random() - 0.5) * instability * 30)
    )

    targetRef.current = {
      mood: { ...moodData, confidence: moodConfidence },
      threat: { value: threatValue, confidence: threatConfidence },
      focus: { value: focusValue, confidence: focusConfidence },
      age: { value: ageValue, confidence: ageConfidence },
    }
  }, [currentEmotion, sensitivity, faceDetected])

  // Smooth interpolation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(current => {
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t
        const smoothing = 0.15

        return {
          mood: {
            type: targetRef.current.mood.type,
            label: targetRef.current.mood.label,
            confidence: Math.round(lerp(current.mood.confidence, targetRef.current.mood.confidence, smoothing)),
          },
          threat: {
            value: Math.round(lerp(current.threat.value, targetRef.current.threat.value, smoothing)),
            confidence: Math.round(lerp(current.threat.confidence, targetRef.current.threat.confidence, smoothing)),
          },
          focus: {
            value: Math.round(lerp(current.focus.value, targetRef.current.focus.value, smoothing)),
            confidence: Math.round(lerp(current.focus.confidence, targetRef.current.focus.confidence, smoothing)),
          },
          age: {
            value: Math.round(lerp(current.age.value, targetRef.current.age.value, smoothing)),
            confidence: Math.round(lerp(current.age.confidence, targetRef.current.age.confidence, smoothing)),
          },
        }
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return metrics
}
