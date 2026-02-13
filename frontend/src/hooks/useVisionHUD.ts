/**
 * Vision HUD Orchestrator Hook
 * Coordinates all detection modules with staggered execution for performance
 */

import { RefObject } from 'react'
import { useFaceDetection } from './useFaceDetection'
import { usePoseDetection } from './usePoseDetection'
import { useHandDetection } from './useHandDetection'
import { useObjectDetection } from './useObjectDetection'
import { useFaceBioAnalysis } from './useFaceBioAnalysis'
import { useSpeechRecognition } from './useSpeechRecognition'
import { useTextSentiment } from './useTextSentiment'
import { useVisionHUDStore } from '../stores/visionHUDStore'
import type { VisionData, HUDConfig } from '../types/visionHUD'

interface UseVisionHUDReturn {
  // Detection data
  data: VisionData

  // Speech data
  transcript: string
  interimTranscript: string
  sentiment: ReturnType<typeof useTextSentiment>

  // Module status
  isReady: {
    face: boolean
    pose: boolean
    hand: boolean
    object: boolean
    bio: boolean
    speech: boolean
  }

  // Config
  config: HUDConfig
  updateConfig: (updates: Partial<HUDConfig>) => void
  toggleModule: (module: keyof HUDConfig['modules']) => void
}

export function useVisionHUD(
  videoRef: RefObject<HTMLVideoElement | null>,
  isStreaming: boolean = true
): UseVisionHUDReturn {
  const config = useVisionHUDStore(state => state.config)
  const updateConfig = useVisionHUDStore(state => state.updateConfig)
  const toggleModule = useVisionHUDStore(state => state.toggleModule)

  // Face detection (MediaPipe)
  const {
    landmarks: faceLandmarks,
    isReady: faceReady,
  } = useFaceDetection(videoRef, isStreaming && config.modules.face)

  // Pose detection (MediaPipe)
  const {
    landmarks: poseLandmarks,
    isReady: poseReady,
  } = usePoseDetection(videoRef, isStreaming && config.modules.pose)

  // Hand detection with gestures (MediaPipe)
  const {
    hands,
    isReady: handReady,
  } = useHandDetection(videoRef, isStreaming && config.modules.hand)

  // Object detection (MediaPipe)
  const {
    objects,
    isReady: objectReady,
  } = useObjectDetection(videoRef, isStreaming && config.modules.object)

  // Face bio analysis (face-api.js) - only runs when face is detected
  const {
    bio: faceBio,
    isReady: bioReady,
  } = useFaceBioAnalysis(videoRef, faceLandmarks, isStreaming && config.modules.bio)

  // Speech recognition
  const {
    transcript,
    interimTranscript,
    isSupported: speechReady,
  } = useSpeechRecognition(config.modules.speech)

  // Text sentiment analysis
  const sentiment = useTextSentiment(transcript + ' ' + interimTranscript)

  // Compile vision data
  const data: VisionData = {
    faceLandmarks,
    faceBio,
    poseLandmarks,
    hands,
    objects,
    speech: {
      transcript,
      interimTranscript,
      sentiment,
      isListening: config.modules.speech,
    },
    lastUpdate: Date.now(),
  }

  return {
    data,
    transcript,
    interimTranscript,
    sentiment,
    isReady: {
      face: faceReady,
      pose: poseReady,
      hand: handReady,
      object: objectReady,
      bio: bioReady,
      speech: speechReady,
    },
    config,
    updateConfig,
    toggleModule,
  }
}
