import { useEffect, useRef, useState, RefObject, useCallback } from 'react'
import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import {
  initializePoseDetector,
  detectPose,
  closePoseDetector,
} from '../lib/mediapipe/poseDetector'
import { useSceneStore } from '../stores/sceneStore'

interface UsePoseDetectionReturn {
  landmarks: NormalizedLandmark[] | null
  isDetecting: boolean
  isReady: boolean
  error: string | null
}

export function usePoseDetection(
  videoRef: RefObject<HTMLVideoElement | null>,
  isEnabled: boolean = true
): UsePoseDetectionReturn {
  const [landmarks, setLandmarks] = useState<NormalizedLandmark[] | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const rafIdRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  const setPoseReady = useSceneStore(state => state.setPoseReady)

  const startDetection = useCallback(async () => {
    if (!isEnabled) return

    try {
      await initializePoseDetector()
      setIsReady(true)
      setPoseReady(true)
      setIsDetecting(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize pose detection'
      setError(message)
    }
  }, [isEnabled, setPoseReady])

  useEffect(() => {
    startDetection()

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [startDetection])

  useEffect(() => {
    if (!isDetecting || !videoRef.current || !isEnabled) return

    let mounted = true

    function detect() {
      if (!mounted) return

      const video = videoRef.current
      if (video && video.readyState >= 2) {
        const now = performance.now()
        // Throttle to ~15fps for better performance
        if (now - lastTimeRef.current >= 66) {
          const result = detectPose(video, now)
          if (result?.landmarks?.[0]) {
            setLandmarks(result.landmarks[0])
          } else {
            setLandmarks(null)
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

  useEffect(() => {
    return () => {
      closePoseDetector()
      setPoseReady(false)
    }
  }, [setPoseReady])

  return { landmarks, isDetecting, isReady, error }
}
