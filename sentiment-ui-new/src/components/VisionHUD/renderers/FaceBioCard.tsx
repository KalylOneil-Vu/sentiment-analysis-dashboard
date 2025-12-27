/**
 * Face Bio Card
 * Displays age range and expression probabilities above detected face
 */

import type { FaceBio, ExpressionProbabilities } from '../../../types/visionHUD'
import { getExpressionColor } from '../../../lib/faceapi/faceApiDetector'

interface FaceBioCardProps {
  bio: FaceBio
  position: { x: number; y: number } // Percentage-based position
}

export function FaceBioCard({ bio, position }: FaceBioCardProps) {
  // Get top 3 expressions sorted by probability
  const topExpressions = (
    Object.entries(bio.expressions) as [keyof ExpressionProbabilities, number][]
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return (
    <div
      className="absolute pointer-events-none transition-all duration-200"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -100%) translateY(-24px)',
      }}
    >
      <div
        className="p-3 rounded-lg backdrop-blur-md min-w-[160px]"
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Age and Gender Row */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Age</span>
            <span className="text-sm font-semibold text-white">
              {bio.ageRange.min}-{bio.ageRange.max}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background:
                  bio.gender === 'male'
                    ? 'rgba(59, 130, 246, 0.3)'
                    : 'rgba(236, 72, 153, 0.3)',
                color: bio.gender === 'male' ? '#60a5fa' : '#f472b6',
              }}
            >
              {bio.gender === 'male' ? '♂' : '♀'}
            </span>
          </div>
        </div>

        {/* Expression Bars */}
        <div className="space-y-1.5">
          {topExpressions.map(([expression, probability]) => (
            <div key={expression} className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 w-16 capitalize truncate">
                {expression}
              </span>
              <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${probability * 100}%`,
                    background: getExpressionColor(expression),
                  }}
                />
              </div>
              <span className="text-[10px] text-gray-400 w-7 text-right">
                {Math.round(probability * 100)}%
              </span>
            </div>
          ))}
        </div>

        {/* Dominant Expression Badge */}
        <div className="mt-2 pt-2 border-t border-white/10">
          <div
            className="text-center text-xs font-medium px-3 py-1 rounded-full"
            style={{
              background: `${getExpressionColor(bio.dominantExpression)}20`,
              color: getExpressionColor(bio.dominantExpression),
            }}
          >
            {bio.dominantExpression.charAt(0).toUpperCase() + bio.dominantExpression.slice(1)}
          </div>
        </div>
      </div>

      {/* Pointer arrow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
        style={{
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid rgba(0, 0, 0, 0.8)',
        }}
      />
    </div>
  )
}
