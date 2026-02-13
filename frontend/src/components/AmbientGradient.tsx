import { EmotionType } from '../types/emotion'

interface AmbientGradientProps {
  emotion: EmotionType
}

// Subtle color tints for each emotion (very low opacity for ambient effect)
const EMOTION_GRADIENTS: Record<EmotionType, string> = {
  JOY: 'radial-gradient(ellipse at 50% 50%, rgba(251, 191, 36, 0.08) 0%, transparent 70%)',
  STRESS: 'radial-gradient(ellipse at 50% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
  NEUTRAL: 'radial-gradient(ellipse at 50% 50%, transparent 0%, transparent 70%)',
  ANGER: 'radial-gradient(ellipse at 50% 50%, rgba(239, 68, 68, 0.06) 0%, transparent 70%)',
  CONFUSION: 'radial-gradient(ellipse at 50% 50%, rgba(168, 85, 247, 0.07) 0%, transparent 70%)',
}

export function AmbientGradient({ emotion }: AmbientGradientProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-0"
      style={{
        background: EMOTION_GRADIENTS[emotion],
        transition: 'background 1.5s ease-in-out',
      }}
    />
  )
}
