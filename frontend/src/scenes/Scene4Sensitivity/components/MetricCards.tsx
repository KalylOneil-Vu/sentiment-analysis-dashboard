import { useState, useEffect, useRef } from 'react'
import { BiasMetrics } from '../../../hooks/useSensitivityBias'
import { EmotionType, EMOTION_CONFIG } from '../../../types/emotion'
import { useAnimatedNumber } from '../../../hooks/useAnimatedNumber'

interface MetricCardsProps {
  metrics: BiasMetrics
}

function MoodIcon({ type }: { type: EmotionType }) {
  const config = EMOTION_CONFIG[type]
  const color = config.color
  const iconSize = 24

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

  return icons[type]
}

export function MetricCards({ metrics }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {/* MOOD Card */}
      <MetricCard
        label="MOOD"
        value={<MoodIcon type={metrics.mood.type} />}
        confidence={metrics.mood.confidence}
        staggerIndex={1}
      />

      {/* THREAT Card */}
      <MetricCard
        label="THREAT"
        value={
          <span
            className={`text-xl font-bold ${
              metrics.threat.value > 50 ? 'text-amber-500' : 'text-green-500'
            }`}
          >
            {metrics.threat.value > 50 ? '!' : '\u2713'}
          </span>
        }
        subValue={metrics.threat.value}
        confidence={metrics.threat.confidence}
        staggerIndex={2}
      />

      {/* FOCUS Card */}
      <MetricCard
        label="FOCUS"
        value={
          <span className="text-xl font-bold text-slate-700">
            {'\u25CE'}
          </span>
        }
        subValue={metrics.focus.value}
        confidence={metrics.focus.confidence}
        staggerIndex={3}
      />

      {/* AGE Card */}
      <MetricCard
        label="AGE"
        value={
          <span className="text-xl font-bold text-slate-700">
            {metrics.age.value || '—'}
          </span>
        }
        confidence={metrics.age.confidence}
        staggerIndex={4}
      />
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: React.ReactNode
  subValue?: number
  confidence: number
  staggerIndex?: number
}

function MetricCard({ label, value, subValue, confidence, staggerIndex = 1 }: MetricCardProps) {
  const { value: animatedConfidence } = useAnimatedNumber(confidence)
  const { value: animatedSubValue } = useAnimatedNumber(subValue ?? 0)
  const [isPulsing, setIsPulsing] = useState(false)
  const prevConfidenceRef = useRef(confidence)

  // Trigger pulse on significant confidence change
  useEffect(() => {
    if (Math.abs(confidence - prevConfidenceRef.current) > 10) {
      setIsPulsing(true)
      const timer = setTimeout(() => setIsPulsing(false), 500)
      prevConfidenceRef.current = confidence
      return () => clearTimeout(timer)
    }
    prevConfidenceRef.current = confidence
  }, [confidence])

  const getConfidenceColor = () => {
    if (confidence >= 70) return 'text-green-600'
    if (confidence >= 40) return 'text-amber-600'
    return 'text-red-500'
  }

  return (
    <div
      className={`flex flex-col items-center p-3 rounded-lg hover-lift stagger-item ${isPulsing ? 'value-pulse' : ''}`}
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        animationDelay: `${staggerIndex * 0.05}s`,
      }}
    >
      <span className="text-[9px] font-medium tracking-[0.1em] uppercase text-slate-500 mb-2">
        {label}
      </span>

      <div className="flex-1 flex flex-col items-center justify-center">
        {value}
        {subValue !== undefined && (
          <span className="text-xs font-medium text-slate-600 mt-1">{animatedSubValue}%</span>
        )}
      </div>

      <div className="mt-2 text-center">
        <span className={`text-xs font-semibold ${getConfidenceColor()}`}>
          {animatedConfidence}%
        </span>
        <span className="block text-[8px] text-slate-400 uppercase tracking-wide">
          confidence
        </span>
      </div>
    </div>
  )
}
