export type EmotionType = 'JOY' | 'STRESS' | 'NEUTRAL' | 'ANGER' | 'CONFUSION'

export interface EmotionState {
  type: EmotionType
  confidence: number // 0-100
  icon: string
}

export interface LandmarkVisibility {
  eyes: boolean
  nose: boolean
  mouth: boolean
  ears: boolean
}

export const EMOTION_CONFIG: Record<EmotionType, { icon: string; color: string }> = {
  JOY: { icon: 'joy', color: '#22c55e' },
  STRESS: { icon: 'stress', color: '#f97316' },
  NEUTRAL: { icon: 'neutral', color: '#64748b' },
  ANGER: { icon: 'anger', color: '#ef4444' },
  CONFUSION: { icon: 'confusion', color: '#8b5cf6' },
}

export const EMOTION_WEIGHTS: Record<EmotionType, number> = {
  NEUTRAL: 30,
  JOY: 25,
  STRESS: 20,
  CONFUSION: 15,
  ANGER: 10,
}
