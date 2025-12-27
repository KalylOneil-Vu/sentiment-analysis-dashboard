/**
 * Face Bio Analysis Hook
 * Uses face-api.js for age, gender, and expression detection
 * Only runs when MediaPipe detects a face (saves GPU cycles)
 */

import { useEffect, useRef, useState, RefObject, useCallback } from 'react'
import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import {
  initializeFaceApi,
  detectFaceAttributes,
  isFaceApiReady,
} from '../lib/faceapi/faceApiDetector'
import type { FaceBio } from '../types/visionHUD'

interface UseFaceBioAnalysisReturn {
  bio: FaceBio | null
  isAnalyzing: boolean
  isReady: boolean
  error: string | null
}

// Throttle interval for face bio analysis (~5 FPS - heavier computation)
const ANALYSIS_INTERVAL_MS = 200

export function useFaceBioAnalysis(
  videoRef: RefObject<HTMLVideoElement | null>,
  faceLandmarks: NormalizedLandmark[] | null,
  isEnabled: boolean = true
): UseFaceBioAnalysisReturn {
  const [bio, setBio] = useState<FaceBio | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastTimeRef = useRef<number>(0)
  const isProcessingRef = useRef<boolean>(false)

  // Initialize face-api models
  const initialize = useCallback(async () => {
    if (!isEnabled) return

    try {
      await initializeFaceApi()
      setIsReady(true)
      setIsAnalyzing(true)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to initialize face bio analysis'
      setError(message)
      console.error('[useFaceBioAnalysis] Initialization error:', err)
    }
  }, [isEnabled])

  useEffect(() => {
    initialize()
  }, [initialize])

  // Run analysis when face is detected by MediaPipe
  useEffect(() => {
    if (!isAnalyzing || !videoRef.current || !isEnabled || !isFaceApiReady()) {
      return
    }

    // Only analyze when MediaPipe detects a face
    if (!faceLandmarks || faceLandmarks.length === 0) {
      setBio(null)
      return
    }

    // Throttle analysis
    const now = performance.now()
    if (now - lastTimeRef.current < ANALYSIS_INTERVAL_MS) {
      return
    }

    // Prevent concurrent processing
    if (isProcessingRef.current) {
      return
    }

    const video = videoRef.current
    if (!video || video.readyState < 2) {
      return
    }

    isProcessingRef.current = true
    lastTimeRef.current = now

    // Run face-api detection
    detectFaceAttributes(video)
      .then(result => {
        if (result) {
          setBio(result)
        }
      })
      .catch(err => {
        console.error('[useFaceBioAnalysis] Detection error:', err)
      })
      .finally(() => {
        isProcessingRef.current = false
      })
  }, [faceLandmarks, isAnalyzing, videoRef, isEnabled])

  // Clear bio when face is no longer detected
  useEffect(() => {
    if (!faceLandmarks || faceLandmarks.length === 0) {
      setBio(null)
    }
  }, [faceLandmarks])

  return { bio, isAnalyzing, isReady, error }
}
