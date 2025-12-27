import type { EmotionType } from './emotion'

// Backend emotion types (from DeepFace)
export type BackendEmotion = 'happy' | 'sad' | 'angry' | 'fear' | 'surprise' | 'disgust' | 'neutral'

// Map backend emotions to frontend EmotionType
export const EMOTION_MAP: Record<BackendEmotion, EmotionType> = {
  happy: 'JOY',
  surprise: 'JOY',
  angry: 'ANGER',
  disgust: 'ANGER',
  sad: 'STRESS',
  fear: 'STRESS',
  neutral: 'NEUTRAL',
}

export function mapBackendEmotion(backendEmotion: string): EmotionType {
  const emotion = backendEmotion.toLowerCase() as BackendEmotion
  return EMOTION_MAP[emotion] || 'NEUTRAL'
}

// Component scores from backend
export interface ComponentScores {
  fastvlm: number
  emotion: number
  body_language: number
  speech: number
  participation: number
}

// Bounding box for detected person
export interface BoundingBox {
  x1: number
  y1: number
  x2: number
  y2: number
  center: [number, number]
  width: number
  height: number
}

// Individual person engagement data
export interface PersonEngagement {
  track_id: number
  timestamp: string
  overall_score: number
  component_scores: ComponentScores
  details: {
    dominant_emotion: string
    vlm_text?: string
    vlm_keywords?: string[]
    is_speaking: boolean
  }
  bbox: BoundingBox | null
  confidence: number
}

// Engagement distribution
export interface EngagementDistribution {
  highly_engaged: number
  neutral: number
  disengaged: number
  percentages: {
    highly_engaged: number
    neutral: number
    disengaged: number
  }
}

// Component averages
export interface ComponentAverages {
  fastvlm: number
  emotion: number
  speech: number
}

// Participation stats
export interface ParticipationStats {
  speaking_count: number
  participation_rate: number
}

// Parsed keywords from FastVLM
export interface ParsedKeywords {
  keywords: {
    positive: string[]
    negative: string[]
    neutral: string[]
  }
  emotions: {
    positive: string[]
    negative: string[]
    neutral: string[]
  }
  body_language: {
    open_posture: string[]
    closed_posture: string[]
    active_gestures: string[]
  }
}

// Full room engagement data from backend
export interface BackendEngagement {
  timestamp: string
  overall_score: number
  total_participants: number
  active_participants: number
  distribution: EngagementDistribution
  averages: ComponentAverages
  participation: ParticipationStats
  persons: PersonEngagement[]
  parsed_keywords?: ParsedKeywords
}

// WebSocket message types
export interface VideoFrameMessage {
  type: 'video_frame'
  frame: string // base64 encoded
  fastvlm_text?: string
  fastvlm_keywords?: string[]
}

export interface EngagementUpdateMessage {
  type: 'engagement_update'
  data: BackendEngagement
}

export interface ErrorMessage {
  type: 'error'
  data: string
}

export interface PongMessage {
  type: 'pong'
}

export type WebSocketMessage = EngagementUpdateMessage | ErrorMessage | PongMessage
