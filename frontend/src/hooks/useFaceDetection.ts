import { useEffect, useRef, useState, RefObject, useCallback } from 'react'
import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import {
  initializeFaceDetector,
  detectFace,
  closeFaceDetector,
} from '../lib/mediapipe/faceDetector'
import { useSceneStore } from '../stores/sceneStore'

interface UseFaceDetectionReturn {
  landmarks: NormalizedLandmark[] | null
  isDetecting: boolean
  isReady: boolean
  error: string | null
}

export function useFaceDetection(
  videoRef: RefObject<HTMLVideoElement | null>,
  isEnabled: boolean = true
): UseFaceDetectionReturn {
  const [landmarks, setLandmarks] = useState<NormalizedLandmark[] | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const rafIdRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  const setFaceReady = useSceneStore(state => state.setFaceReady)

  const startDetection = useCallback(async () => {
    if (!isEnabled) return

    try {
      await initializeFaceDetector()
      setIsReady(true)
      setFaceReady(true)
      setIsDetecting(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize face detection'
      setError(message)
    }
  }, [isEnabled, setFaceReady])

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
        // Throttle to ~30fps
        if (now - lastTimeRef.current >= 33) {
          const result = detectFace(video, now)
          if (result?.faceLandmarks?.[0]) {
            setLandmarks(result.faceLandmarks[0])
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
      closeFaceDetector()
      setFaceReady(false)
    }
  }, [setFaceReady])

  return { landmarks, isDetecting, isReady, error }
}
