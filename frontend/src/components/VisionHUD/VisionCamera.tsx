/**
 * Vision Camera Component
 * Unified camera component with preset support for all scenes.
 * Renders video from shared provider with configurable overlays.
 */

import { useRef, ReactNode } from 'react'
import { useSharedVision } from '../../hooks/useSharedVision'
import { VisionHUDOverlay } from './VisionHUDOverlay'
import type {
  PresetName,
  HUDPreset,
  CameraSize,
  AspectRatio,
  HUDConfig,
} from '../../types/visionHUD'

// ============================================================================
// Types
// ============================================================================

interface VisionCameraProps {
  // Preset configuration
  preset?: PresetName | HUDPreset

  // Size and layout
  size?: CameraSize
  aspectRatio?: AspectRatio
  className?: string

  // Visual options
  showRecordingIndicator?: boolean
  showCornerBrackets?: boolean
  showGrid?: boolean
  rounded?: boolean

  // Config overrides
  configOverrides?: Partial<HUDConfig>

  // Children for scene-specific overlays
  children?: ReactNode
}

// ============================================================================
// Size configurations
// ============================================================================

const SIZE_CLASSES: Record<CameraSize, string> = {
  full: 'w-full h-full',
  compact: 'w-80 h-60',
  thumbnail: 'w-40 h-30',
}

const ASPECT_RATIO_CLASSES: Record<AspectRatio, string> = {
  '16:9': 'aspect-video',
  '4:3': 'aspect-[4/3]',
  '3:4': 'aspect-[3/4]',
  '1:1': 'aspect-square',
}

// ============================================================================
// Component
// ============================================================================

export function VisionCamera({
  preset = 'full',
  size = 'full',
  aspectRatio,
  className = '',
  showRecordingIndicator = false,
  showCornerBrackets = false,
  showGrid = false,
  rounded = true,
  configOverrides,
  children,
}: VisionCameraProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const {
    videoRef,
    isStreaming,
    data,
    transcript,
    interimTranscript,
    sentiment,
    config,
  } = useSharedVision({ preset, configOverrides })

  // Compute container classes
  const sizeClass = SIZE_CLASSES[size]
  const aspectClass = aspectRatio ? ASPECT_RATIO_CLASSES[aspectRatio] : ''
  const roundedClass = rounded ? 'rounded-2xl' : ''

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${sizeClass} ${aspectClass} ${roundedClass} ${className}`}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--glass-border)',
      }}
    >
      {/* Grid background (optional) */}
      {showGrid && (
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(var(--grid-line) 1px, transparent 1px),
              linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      )}

      {/* Vision HUD Overlay - renders video + all detections */}
      <VisionHUDOverlay
        videoRef={videoRef}
        faceLandmarks={data.faceLandmarks}
        poseLandmarks={data.poseLandmarks}
        hands={data.hands}
        objects={data.objects}
        faceBio={data.faceBio}
        transcript={transcript}
        interimTranscript={interimTranscript}
        sentiment={sentiment}
        config={config}
      />

      {/* Corner brackets (optional) */}
      {showCornerBrackets && <CornerBrackets />}

      {/* Recording indicator (optional) */}
      {showRecordingIndicator && isStreaming && <RecordingIndicator />}

      {/* Scene-specific children */}
      {children}
    </div>
  )
}

// ============================================================================
// Sub-components
// ============================================================================

function CornerBrackets() {
  const bracketStyle = {
    position: 'absolute' as const,
    width: '24px',
    height: '24px',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  }

  return (
    <div className="absolute inset-4 pointer-events-none">
      {/* Top-left */}
      <div
        style={{
          ...bracketStyle,
          top: 0,
          left: 0,
          borderTop: '2px solid',
          borderLeft: '2px solid',
          borderColor: 'inherit',
        }}
      />
      {/* Top-right */}
      <div
        style={{
          ...bracketStyle,
          top: 0,
          right: 0,
          borderTop: '2px solid',
          borderRight: '2px solid',
          borderColor: 'inherit',
        }}
      />
      {/* Bottom-left */}
      <div
        style={{
          ...bracketStyle,
          bottom: 0,
          left: 0,
          borderBottom: '2px solid',
          borderLeft: '2px solid',
          borderColor: 'inherit',
        }}
      />
      {/* Bottom-right */}
      <div
        style={{
          ...bracketStyle,
          bottom: 0,
          right: 0,
          borderBottom: '2px solid',
          borderRight: '2px solid',
          borderColor: 'inherit',
        }}
      />
    </div>
  )
}

function RecordingIndicator() {
  return (
    <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
      <div
        className="w-2.5 h-2.5 rounded-full animate-pulse"
        style={{ backgroundColor: '#ef4444' }}
      />
      <span
        className="text-xs font-medium tracking-wide"
        style={{ color: 'rgba(255, 255, 255, 0.8)' }}
      >
        LIVE
      </span>
    </div>
  )
}

// ============================================================================
// Compact variant for smaller displays
// ============================================================================

interface CompactVisionCameraProps {
  preset?: PresetName | HUDPreset
  className?: string
  showBrackets?: boolean
  children?: ReactNode
}

export function CompactVisionCamera({
  preset = 'minimal',
  className = '',
  showBrackets = true,
  children,
}: CompactVisionCameraProps) {
  return (
    <VisionCamera
      preset={preset}
      size="compact"
      aspectRatio="4:3"
      showCornerBrackets={showBrackets}
      rounded
      className={className}
    >
      {children}
    </VisionCamera>
  )
}

// ============================================================================
// Full-screen variant
// ============================================================================

interface FullscreenVisionCameraProps {
  preset?: PresetName | HUDPreset
  showGrid?: boolean
  showRecording?: boolean
  children?: ReactNode
}

export function FullscreenVisionCamera({
  preset = 'full',
  showGrid = false,
  showRecording = false,
  children,
}: FullscreenVisionCameraProps) {
  return (
    <VisionCamera
      preset={preset}
      size="full"
      showGrid={showGrid}
      showRecordingIndicator={showRecording}
      showCornerBrackets
      rounded={false}
      className="absolute inset-0"
    >
      {children}
    </VisionCamera>
  )
}
