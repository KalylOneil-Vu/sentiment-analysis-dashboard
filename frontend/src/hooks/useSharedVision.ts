/**
 * Shared Vision Hook
 * Convenience hook for consuming VisionDetectionProvider with preset support
 */

import { useMemo } from 'react'
import { useVisionDetection } from '../providers/VisionDetectionProvider'
import { getPreset, presetToConfig } from '../config/HUDPresets'
import type { PresetName, HUDPreset, HUDConfig, VisionData, TextSentiment } from '../types/visionHUD'

interface UseSharedVisionOptions {
  preset?: PresetName | HUDPreset
  configOverrides?: Partial<HUDConfig>
}

interface UseSharedVisionReturn {
  // Video ref for overlay positioning
  videoRef: React.RefObject<HTMLVideoElement | null>

  // Streaming state
  isStreaming: boolean

  // Compiled vision data
  data: VisionData

  // Speech data
  transcript: string
  interimTranscript: string
  sentiment: TextSentiment

  // Module readiness
  isReady: {
    face: boolean
    pose: boolean
    hand: boolean
    object: boolean
    bio: boolean
    speech: boolean
  }

  // Effective config for this usage
  config: HUDConfig

  // Global preset control
  activePreset: PresetName
  setActivePreset: (preset: PresetName) => void
}

/**
 * Hook for using shared vision detection with per-component preset support
 *
 * Usage:
 * ```tsx
 * const { data, config, isStreaming } = useSharedVision({ preset: 'retail' })
 * ```
 */
export function useSharedVision(options: UseSharedVisionOptions = {}): UseSharedVisionReturn {
  const { preset, configOverrides } = options

  const {
    videoRef,
    isStreaming,
    faceLandmarks,
    poseLandmarks,
    hands,
    objects,
    faceBio,
    transcript,
    interimTranscript,
    sentiment,
    isReady,
    activePreset,
    config: globalConfig,
    setActivePreset,
  } = useVisionDetection()

  // Compute effective config based on local preset or global config
  const config = useMemo<HUDConfig>(() => {
    if (preset) {
      const presetConfig = presetToConfig(getPreset(preset))
      return { ...presetConfig, ...configOverrides }
    }
    return { ...globalConfig, ...configOverrides }
  }, [preset, globalConfig, configOverrides])

  // Compile vision data into unified object
  const data = useMemo<VisionData>(() => ({
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
  }), [
    faceLandmarks,
    faceBio,
    poseLandmarks,
    hands,
    objects,
    transcript,
    interimTranscript,
    sentiment,
    config.modules.speech,
  ])

  return {
    videoRef,
    isStreaming,
    data,
    transcript,
    interimTranscript,
    sentiment,
    isReady,
    config,
    activePreset,
    setActivePreset,
  }
}

/**
 * Simplified hook for just face data
 */
export function useSharedFace() {
  const { faceLandmarks, faceBio, isReady } = useVisionDetection()
  return { faceLandmarks, faceBio, isReady: isReady.face && isReady.bio }
}

/**
 * Simplified hook for just pose data
 */
export function useSharedPose() {
  const { poseLandmarks, isReady } = useVisionDetection()
  return { poseLandmarks, isReady: isReady.pose }
}

/**
 * Simplified hook for just hand data
 */
export function useSharedHands() {
  const { hands, isReady } = useVisionDetection()
  return { hands, isReady: isReady.hand }
}

/**
 * Simplified hook for just object detection
 */
export function useSharedObjects() {
  const { objects, isReady } = useVisionDetection()
  return { objects, isReady: isReady.object }
}

/**
 * Simplified hook for just speech data
 */
export function useSharedSpeech() {
  const { transcript, interimTranscript, sentiment, isReady } = useVisionDetection()
  return { transcript, interimTranscript, sentiment, isReady: isReady.speech }
}
