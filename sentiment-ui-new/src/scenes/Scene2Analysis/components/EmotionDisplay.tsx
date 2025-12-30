import { useState, useEffect, useRef } from 'react'
import { EmotionState, EmotionType, EMOTION_CONFIG } from '../../../types/emotion'
import { useAnimatedNumber } from '../../../hooks/useAnimatedNumber'

interface EmotionDisplayProps {
  emotion: EmotionState
}

function EmotionIcon({ type, color }: { type: EmotionType; color: string }) {
  const iconSize = 36

  // SVG face icons for each emotion
  const icons: Record<EmotionType, JSX.Element> = {
    JOY: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
        <circle cx="8" cy="10" r="1.5" fill={color} />
        <circle cx="16" cy="10" r="1.5" fill={color} />
        <path d="M8 15c1.5 2 6.5 2 8 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    STRESS: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
        <circle cx="8" cy="10" r="1.5" fill={color} />
        <circle cx="16" cy="10" r="1.5" fill={color} />
        <path d="M8 16c1.5-1.5 6.5-1.5 8 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6 7l3 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M18 7l-3 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    NEUTRAL: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
        <circle cx="8" cy="10" r="1.5" fill={color} />
        <circle cx="16" cy="10" r="1.5" fill={color} />
        <path d="M8 15h8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    ANGER: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
        <circle cx="8" cy="11" r="1.5" fill={color} />
        <circle cx="16" cy="11" r="1.5" fill={color} />
        <path d="M8 16c1.5-1.5 6.5-1.5 8 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6 7l4 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M18 7l-4 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    CONFUSION: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
        <circle cx="8" cy="10" r="1.5" fill={color} />
        <circle cx="16" cy="10" r="1.5" fill={color} />
        <path d="M9 15c1-1 2.5-1 3.5 0s2.5 1 3.5 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6 8l3 1" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M18 9l-3-1" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  }

  return <div className="emotion-icon">{icons[type]}</div>
}

export function EmotionDisplay({ emotion }: EmotionDisplayProps) {
  const config = EMOTION_CONFIG[emotion.type]
  const { value: animatedConfidence } = useAnimatedNumber(emotion.confidence)
  const [isPulsing, setIsPulsing] = useState(false)
  const [isMorphing, setIsMorphing] = useState(false)
  const [prevEmotion, setPrevEmotion] = useState<EmotionType | null>(null)
  const prevEmotionRef = useRef(emotion.type)

  // Trigger pulse and morph on emotion change
  useEffect(() => {
    if (emotion.type !== prevEmotionRef.current) {
      setPrevEmotion(prevEmotionRef.current)
      setIsPulsing(true)
      setIsMorphing(true)
      prevEmotionRef.current = emotion.type
      const pulseTimer = setTimeout(() => setIsPulsing(false), 500)
      const morphTimer = setTimeout(() => {
        setIsMorphing(false)
        setPrevEmotion(null)
      }, 300)
      return () => {
        clearTimeout(pulseTimer)
        clearTimeout(morphTimer)
      }
    }
  }, [emotion.type])

  return (
    <div className="space-y-2">
      <h3 className="text-xs tracking-[0.2em] uppercase text-slate-400 font-medium">
        Primary Emotion
      </h3>

      <div
        className={`flex items-center gap-4 px-5 py-3 rounded-full ${isPulsing ? 'value-pulse' : ''}`}
        style={{
          background: 'rgba(255, 255, 255, 0.6)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
        }}
      >
        {/* Emotion icon with morph transition */}
        <div className="relative w-9 h-9">
          {/* Previous icon (morphing out) */}
          {isMorphing && prevEmotion && (
            <div className="absolute inset-0 icon-morphing-out">
              <EmotionIcon type={prevEmotion} color={EMOTION_CONFIG[prevEmotion].color} />
            </div>
          )}
          {/* Current icon (morphing in or static) */}
          <div className={isMorphing ? 'icon-morphing-in' : ''}>
            <EmotionIcon type={emotion.type} color={config.color} />
          </div>
        </div>

        {/* Emotion label */}
        <span
          className="text-lg font-semibold tracking-wider uppercase flex-1"
          style={{ color: config.color }}
        >
          {emotion.type}
        </span>

        {/* Confidence percentage - animated */}
        <span className="text-lg font-medium text-slate-600">
          {animatedConfidence}%
        </span>
      </div>

      {/* Confidence bar */}
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${emotion.confidence}%`,
            backgroundColor: config.color,
          }}
        />
      </div>
    </div>
  )
}
