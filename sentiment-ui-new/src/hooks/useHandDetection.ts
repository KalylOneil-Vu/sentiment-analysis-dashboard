/**
 * Hand Detection Hook
 * Uses MediaPipe GestureRecognizer for hand landmarks AND gesture recognition
 * GestureRecognizer includes HandLandmarker functionality, so we use it for both
 */

import { useEffect, useRef, useState, RefObject, useCallback } from 'react'
import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import {
  initializeGestureRecognizer,
  recognizeGestures,
  closeGestureRecognizer,
  GESTURE_LABELS,
  GestureCategory,
} from '../lib/mediapipe/gestureRecognizer'
import type { Handedness, HandData } from '../types/visionHUD'

interface UseHandDetectionReturn {
  hands: HandData[]
  isDetecting: boolean
  isReady: boolean
  error: string | null
}

// Throttle interval for hand detection (~15 FPS)
const DETECTION_INTERVAL_MS = 66

export function useHandDetection(
  videoRef: RefObject<HTMLVideoElement | null>,
  isEnabled: boolean = true
): UseHandDetectionReturn {
  const [hands, setHands] = useState<HandData[]>([])
  const [isDetecting, setIsDetecting] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const rafIdRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  const startDetection = useCallback(async () => {
    if (!isEnabled) return

    try {
      await initializeGestureRecognizer()
      setIsReady(true)
      setIsDetecting(true)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to initialize hand detection'
      setError(message)
      console.error('[useHandDetection] Initialization error:', err)
    }
  }, [isEnabled])

  // Initialize detector
  useEffect(() => {
    startDetection()

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [startDetection])

  // Detection loop
  useEffect(() => {
    if (!isDetecting || !videoRef.current || !isEnabled) return

    let mounted = true

    function detect() {
      if (!mounted) return

      const video = videoRef.current
      if (video && video.readyState >= 2) {
        const now = performance.now()

        // Throttle to ~15fps
        if (now - lastTimeRef.current >= DETECTION_INTERVAL_MS) {
          const result = recognizeGestures(video, now)

          if (result && result.landmarks && result.landmarks.length > 0) {
            const handDataArray: HandData[] = result.landmarks.map(
              (landmarks: NormalizedLandmark[], index: number) => {
                // Get handedness (Left or Right)
                const handedness =
                  (result.handedness?.[index]?.[0]?.categoryName as Handedness) || 'Right'

                // Get gesture if available
                const gestureResult = result.gestures?.[index]?.[0]
                const gestureName = gestureResult?.categoryName as GestureCategory | undefined
                const gestureConfidence = gestureResult?.score || 0

                return {
                  landmarks: {
                    handedness,
                    landmarks,
                    confidence: result.handedness?.[index]?.[0]?.score || 0,
                  },
                  gesture:
                    gestureName && gestureName !== 'None'
                      ? {
                          handedness,
                          gesture: GESTURE_LABELS[gestureName] || gestureName,
                          confidence: gestureConfidence,
                        }
                      : null,
                }
              }
            )

            setHands(handDataArray)
          } else {
            setHands([])
          }

          lastTimeRef.current = now
        }
      }

      rafIdRef.current = requestAnimationFrame(detect)
    }

    detect()

    return () => {
      mounted = false
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [isDetecting, videoRef, isEnabled])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closeGestureRecognizer()
    }
  }, [])

  return { hands, isDetecting, isReady, error }
}
