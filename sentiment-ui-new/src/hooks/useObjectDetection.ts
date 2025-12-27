/**
 * Object Detection Hook
 * Uses MediaPipe ObjectDetector for detecting common objects
 */

import { useEffect, useRef, useState, RefObject, useCallback } from 'react'
import {
  initializeObjectDetector,
  detectObjects,
  closeObjectDetector,
  getObjectColor,
} from '../lib/mediapipe/objectDetector'
import type { ObjectDetection } from '../types/visionHUD'

interface UseObjectDetectionReturn {
  objects: ObjectDetection[]
  isDetecting: boolean
  isReady: boolean
  error: string | null
}

// Throttle interval for object detection (~10 FPS)
const DETECTION_INTERVAL_MS = 100

export function useObjectDetection(
  videoRef: RefObject<HTMLVideoElement | null>,
  isEnabled: boolean = true
): UseObjectDetectionReturn {
  const [objects, setObjects] = useState<ObjectDetection[]>([])
  const [isDetecting, setIsDetecting] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const rafIdRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  const startDetection = useCallback(async () => {
    if (!isEnabled) return

    try {
      await initializeObjectDetector()
      setIsReady(true)
      setIsDetecting(true)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to initialize object detection'
      setError(message)
      console.error('[useObjectDetection] Initialization error:', err)
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

        // Throttle to ~10fps
        if (now - lastTimeRef.current >= DETECTION_INTERVAL_MS) {
          const result = detectObjects(video, now)

          if (result && result.detections && result.detections.length > 0) {
            const detectedObjects: ObjectDetection[] = result.detections.map(detection => {
              const category = detection.categories[0]
              const bbox = detection.boundingBox!

              // Normalize bounding box coordinates
              const normalizedBox = {
                x: bbox.originX / video.videoWidth,
                y: bbox.originY / video.videoHeight,
                width: bbox.width / video.videoWidth,
                height: bbox.height / video.videoHeight,
              }

              return {
                boundingBox: normalizedBox,
                label: category.categoryName,
                confidence: category.score,
                color: getObjectColor(category.categoryName),
              }
            })

            setObjects(detectedObjects)
          } else {
            setObjects([])
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
      closeObjectDetector()
    }
  }, [])

  return { objects, isDetecting, isReady, error }
}
