/**
 * Vision Detection Provider
 * Central provider that manages the shared webcam stream and runs all detection hooks.
 * This allows detection to persist across scene transitions without reinitialization.
 */

import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import type { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { useFaceDetection } from '../hooks/useFaceDetection'
import { usePoseDetection } from '../hooks/usePoseDetection'
import { useHandDetection } from '../hooks/useHandDetection'
import { useObjectDetection } from '../hooks/useObjectDetection'
import { useFaceBioAnalysis } from '../hooks/useFaceBioAnalysis'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useTextSentiment } from '../hooks/useTextSentiment'
import type {
  VisionData,
  FaceBio,
  HandData,
  ObjectDetection,
  HUDConfig,
  PresetName,
  HUDPreset,
} from '../types/visionHUD'
import { HUD_PRESETS, presetToConfig, getPreset } from '../config/HUDPresets'

// ============================================================================
// Context Types
// ============================================================================

interface VisionDetectionContextValue {
  // Video element ref (shared across app)
  videoRef: React.RefObject<HTMLVideoElement | null>

  // Webcam state
  isStreaming: boolean
  isCameraEnabled: boolean
  startCamera: () => Promise<void>
  stopCamera: () => void

  // Detection data
  faceLandmarks: NormalizedLandmark[] | null
  poseLandmarks: NormalizedLandmark[] | null
  hands: HandData[]
  objects: ObjectDetection[]
  faceBio: FaceBio | null

  // Speech data
  transcript: string
  interimTranscript: string
  sentiment: { sentiment: string; confidence: number } | null

  // Module readiness
  isReady: {
    face: boolean
    pose: boolean
    hand: boolean
    object: boolean
    bio: boolean
    speech: boolean
  }

  // Active configuration
  activePreset: PresetName
  config: HUDConfig
  setActivePreset: (preset: PresetName) => void
  setCustomConfig: (config: Partial<HUDConfig>) => void

  // Module control
  enableModules: (modules: Partial<Record<keyof HUDConfig['modules'], boolean>>) => void
}

const VisionDetectionContext = createContext<VisionDetectionContextValue | null>(null)

// ============================================================================
// Provider Component
// ============================================================================

interface VisionDetectionProviderProps {
  children: ReactNode
  autoStart?: boolean
  defaultPreset?: PresetName
}

export function VisionDetectionProvider({
  children,
  autoStart = true,
  defaultPreset = 'full',
}: VisionDetectionProviderProps) {
  // Shared video element ref
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Camera state
  const [isStreaming, setIsStreaming] = useState(false)
  const [isCameraEnabled, setIsCameraEnabled] = useState(autoStart)

  // Active preset and config
  const [activePreset, setActivePresetState] = useState<PresetName>(defaultPreset)
  const [customConfig, setCustomConfigState] = useState<Partial<HUDConfig>>({})

  // Compute effective config from preset + custom overrides
  const preset = getPreset(activePreset)
  const baseConfig = presetToConfig(preset)
  const config: HUDConfig = { ...baseConfig, ...customConfig }

  // ============================================================================
  // Camera Management
  // ============================================================================

  const startCamera = useCallback(async () => {
    if (streamRef.current || !videoRef.current) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      })

      streamRef.current = stream
      videoRef.current.srcObject = stream

      await new Promise<void>((resolve, reject) => {
        if (!videoRef.current) return reject(new Error('No video element'))
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
            .then(resolve)
            .catch(reject)
        }
      })

      setIsStreaming(true)
      setIsCameraEnabled(true)
      console.log('[VisionDetectionProvider] Camera started')
    } catch (err) {
      console.error('[VisionDetectionProvider] Camera error:', err)
      setIsStreaming(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsStreaming(false)
    setIsCameraEnabled(false)
    console.log('[VisionDetectionProvider] Camera stopped')
  }, [])

  // Auto-start camera on mount if enabled
  useEffect(() => {
    if (autoStart && !isStreaming) {
      // Small delay to ensure video element is mounted
      const timer = setTimeout(() => {
        startCamera()
      }, 100)
      return () => clearTimeout(timer)
    }

    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [autoStart, startCamera, isStreaming])

  // ============================================================================
  // Detection Hooks
  // ============================================================================

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

  // Face bio analysis (face-api.js)
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

  // ============================================================================
  // Configuration Management
  // ============================================================================

  const setActivePreset = useCallback((preset: PresetName) => {
    setActivePresetState(preset)
    setCustomConfigState({}) // Reset custom overrides when changing preset
    console.log('[VisionDetectionProvider] Preset changed to:', preset)
  }, [])

  const setCustomConfig = useCallback((updates: Partial<HUDConfig>) => {
    setCustomConfigState(prev => ({ ...prev, ...updates }))
  }, [])

  const enableModules = useCallback((modules: Partial<Record<keyof HUDConfig['modules'], boolean>>) => {
    setCustomConfigState(prev => ({
      ...prev,
      modules: { ...config.modules, ...modules },
    }))
  }, [config.modules])

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: VisionDetectionContextValue = {
    videoRef,
    isStreaming,
    isCameraEnabled,
    startCamera,
    stopCamera,
    faceLandmarks,
    poseLandmarks,
    hands,
    objects,
    faceBio,
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
    activePreset,
    config,
    setActivePreset,
    setCustomConfig,
    enableModules,
  }

  return (
    <VisionDetectionContext.Provider value={value}>
      {/* Video element for shared camera stream (offscreen but full size for proper rendering) */}
      <video
        ref={videoRef}
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          width: '640px',
          height: '480px',
        }}
        playsInline
        muted
        autoPlay
      />
      {children}
    </VisionDetectionContext.Provider>
  )
}

// ============================================================================
// Hook to consume context
// ============================================================================

export function useVisionDetection(): VisionDetectionContextValue {
  const context = useContext(VisionDetectionContext)
  if (!context) {
    throw new Error('useVisionDetection must be used within a VisionDetectionProvider')
  }
  return context
}

/**
 * Hook to get only detection data (no camera controls)
 */
export function useVisionData() {
  const {
    faceLandmarks,
    poseLandmarks,
    hands,
    objects,
    faceBio,
    transcript,
    interimTranscript,
    sentiment,
    isReady,
  } = useVisionDetection()

  return {
    faceLandmarks,
    poseLandmarks,
    hands,
    objects,
    faceBio,
    transcript,
    interimTranscript,
    sentiment,
    isReady,
  }
}

/**
 * Hook to get only camera controls
 */
export function useCameraControls() {
  const {
    isStreaming,
    isCameraEnabled,
    startCamera,
    stopCamera,
  } = useVisionDetection()

  return {
    isStreaming,
    isCameraEnabled,
    startCamera,
    stopCamera,
  }
}
