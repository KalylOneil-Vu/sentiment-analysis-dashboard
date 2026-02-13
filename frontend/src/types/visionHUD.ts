/**
 * Vision HUD Types
 * Type definitions for the real-time vision detection overlay system
 */

import type { NormalizedLandmark } from '@mediapipe/tasks-vision'

// ============================================================================
// Module Types
// ============================================================================

export type VisionModule = 'face' | 'pose' | 'hand' | 'object' | 'bio' | 'speech'

export interface ModuleState {
  enabled: boolean
  ready: boolean
  loading: boolean
  error: string | null
  lastUpdate: number | null
  fps: number
}

export type ModuleStates = Record<VisionModule, ModuleState>

// ============================================================================
// Object Detection Types
// ============================================================================

export interface BoundingBox {
  x: number      // Normalized 0-1
  y: number      // Normalized 0-1
  width: number  // Normalized 0-1
  height: number // Normalized 0-1
}

export interface ObjectDetection {
  boundingBox: BoundingBox
  label: string
  confidence: number
  color?: string
}

// Common COCO object classes with associated colors
export const OBJECT_COLORS: Record<string, string> = {
  person: '#22c55e',     // Green
  phone: '#3b82f6',      // Blue
  cell_phone: '#3b82f6', // Blue
  laptop: '#8b5cf6',     // Purple
  book: '#f59e0b',       // Amber
  cup: '#06b6d4',        // Cyan
  bottle: '#14b8a6',     // Teal
  chair: '#64748b',      // Slate
  keyboard: '#a855f7',   // Purple
  mouse: '#ec4899',      // Pink
  default: '#6b7280',    // Gray
}

// ============================================================================
// Face Bio Types (face-api.js)
// ============================================================================

export interface ExpressionProbabilities {
  neutral: number
  happy: number
  sad: number
  angry: number
  fearful: number
  disgusted: number
  surprised: number
}

export interface FaceBio {
  age: number
  ageRange: { min: number; max: number }
  gender: 'male' | 'female'
  genderConfidence: number
  expressions: ExpressionProbabilities
  dominantExpression: keyof ExpressionProbabilities
  boundingBox?: BoundingBox
}

// Expression colors for visualization
export const EXPRESSION_COLORS: Record<keyof ExpressionProbabilities, string> = {
  neutral: '#6b7280',   // Gray
  happy: '#22c55e',     // Green
  sad: '#3b82f6',       // Blue
  angry: '#ef4444',     // Red
  fearful: '#f59e0b',   // Amber
  disgusted: '#84cc16', // Lime
  surprised: '#8b5cf6', // Purple
}

// ============================================================================
// Hand Detection Types
// ============================================================================

export type Handedness = 'Left' | 'Right'

export interface HandLandmarks {
  handedness: Handedness
  landmarks: NormalizedLandmark[]
  confidence: number
}

export interface HandGesture {
  handedness: Handedness
  gesture: string | null
  confidence: number
}

export interface HandData {
  landmarks: HandLandmarks | null
  gesture: HandGesture | null
}

// MediaPipe hand landmark indices
export const HAND_LANDMARK_INDICES = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_DIP: 7,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_DIP: 11,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_DIP: 15,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
}

// Hand skeleton connections for drawing
export const HAND_CONNECTIONS: [number, number][] = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index finger
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle finger
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring finger
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm
  [5, 9], [9, 13], [13, 17],
]

// Gesture types recognized by MediaPipe
export type GestureType =
  | 'None'
  | 'Closed_Fist'
  | 'Open_Palm'
  | 'Pointing_Up'
  | 'Thumb_Down'
  | 'Thumb_Up'
  | 'Victory'
  | 'ILoveYou'

// ============================================================================
// Speech Recognition Types
// ============================================================================

export interface SpeechTranscript {
  text: string
  isFinal: boolean
  timestamp: number
}

export type SentimentType = 'positive' | 'negative' | 'neutral'

export interface TextSentiment {
  sentiment: SentimentType
  confidence: number
  keywords: string[]
}

export interface SpeechData {
  transcript: string
  interimTranscript: string
  sentiment: TextSentiment | null
  isListening: boolean
}

// Sentiment colors
export const SENTIMENT_COLORS: Record<SentimentType, string> = {
  positive: '#22c55e', // Green
  negative: '#ef4444', // Red
  neutral: '#6b7280',  // Gray
}

// ============================================================================
// HUD Configuration
// ============================================================================

export interface HUDConfig {
  // Display options
  showLabels: boolean
  showConfidence: boolean
  showBioCard: boolean
  showSkeleton: boolean
  showGestureLabel: boolean
  showTranscript: boolean

  // Visual options
  opacity: number
  colorScheme: 'default' | 'neon' | 'minimal'

  // Module toggles
  modules: Record<VisionModule, boolean>
}

export const DEFAULT_HUD_CONFIG: HUDConfig = {
  showLabels: true,
  showConfidence: true,
  showBioCard: true,
  showSkeleton: true,
  showGestureLabel: true,
  showTranscript: true,
  opacity: 1,
  colorScheme: 'default',
  modules: {
    face: true,
    pose: true,
    hand: true,
    object: true,
    bio: true,
    speech: true,
  },
}

// ============================================================================
// HUD Styles
// ============================================================================

export const HUD_STYLES = {
  // Bounding box styles
  objectBox: {
    strokeWidth: 2,
    cornerRadius: 4,
  },

  // Label styles
  label: {
    font: '12px Inter, system-ui, sans-serif',
    padding: { x: 8, y: 4 },
    background: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 4,
    textColor: '#ffffff',
    confidenceColor: 'rgba(255, 255, 255, 0.6)',
  },

  // Skeleton styles
  skeleton: {
    face: { color: 'rgba(34, 197, 94, 0.8)', width: 2 },
    pose: { color: 'rgba(6, 182, 212, 0.8)', width: 3 },
    hand: { color: 'rgba(249, 115, 22, 0.8)', width: 2 },
    joint: { radius: 4 },
  },

  // Glow effects
  glow: {
    blur: 8,
    alpha: 0.4,
  },
}

// ============================================================================
// Unified Vision Data
// ============================================================================

export interface VisionData {
  // Face data (MediaPipe landmarks)
  faceLandmarks: NormalizedLandmark[] | null

  // Face bio (face-api.js)
  faceBio: FaceBio | null

  // Pose data
  poseLandmarks: NormalizedLandmark[] | null

  // Hand data (up to 2 hands)
  hands: HandData[]

  // Object detections
  objects: ObjectDetection[]

  // Speech data
  speech: SpeechData | null

  // Timestamps
  lastUpdate: number
}

export const EMPTY_VISION_DATA: VisionData = {
  faceLandmarks: null,
  faceBio: null,
  poseLandmarks: null,
  hands: [],
  objects: [],
  speech: null,
  lastUpdate: 0,
}

// ============================================================================
// Preset Types for VisionCamera
// ============================================================================

export type CameraSize = 'full' | 'compact' | 'thumbnail'
export type AspectRatio = '16:9' | '4:3' | '3:4' | '1:1'

export type FaceMeshStyle = 'none' | 'outline' | 'tessellation'

export interface HUDPreset {
  // Module enables
  face?: boolean
  pose?: boolean
  hand?: boolean
  object?: boolean
  bio?: boolean
  speech?: boolean

  // Face mesh style
  faceMesh?: FaceMeshStyle

  // Display options
  showSkeleton?: boolean
  showLabels?: boolean
  showConfidence?: boolean
  showBioCard?: boolean
  showGestureLabel?: boolean
  showTranscript?: boolean
  showGrid?: boolean

  // Visual options
  opacity?: number
}

export type PresetName =
  | 'attract'
  | 'attractFull'
  | 'analysis'
  | 'retail'
  | 'healthcare'
  | 'stress'
  | 'sensitivity'
  | 'summary'
  | 'full'
  | 'minimal'

export interface VisionCameraProps {
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

  // Children for scene-specific overlays
  children?: React.ReactNode
}
