import { useAnimatedNumber } from '../../../hooks/useAnimatedNumber'

interface FocusScoreProps {
  score: number // 0-100
}

export function FocusScore({ score }: FocusScoreProps) {
  const { value: animatedScore } = useAnimatedNumber(score)

  // SVG circle parameters
  const size = 120
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col flex-1">
      <h3 className="text-xs tracking-[0.2em] uppercase text-slate-400 font-medium mb-2">
        Focus Score
      </h3>

      <div
        className="flex items-center gap-4 px-5 py-3 rounded-full"
        style={{
          background: 'rgba(255, 255, 255, 0.6)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
        }}
      >
        {/* Focus icon */}
        <svg
          className="w-7 h-7 text-slate-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>

        {/* Spacer */}
        <span className="flex-1" />

        {/* Score percentage - animated */}
        <span className="text-lg font-medium text-slate-600">{animatedScore}%</span>
      </div>

      {/* Circular progress (optional visual) */}
      <div className="flex-1 flex items-center justify-center pt-6">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(148, 163, 184, 0.2)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(20, 184, 166, 0.8)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(20, 184, 166, 0.4))',
            }}
          />
        </svg>
      </div>
    </div>
  )
}
