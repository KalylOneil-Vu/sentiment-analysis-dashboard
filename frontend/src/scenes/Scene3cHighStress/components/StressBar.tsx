import { StressMonitoringResult } from '../../../types/scenario'

interface StressBarProps {
  stressData: StressMonitoringResult
}

export function StressBar({ stressData }: StressBarProps) {
  const { stressLevel, alertMessage } = stressData

  // Color transitions from green to yellow to red based on stress level
  const getBarColor = () => {
    if (stressLevel < 40) return '#22c55e' // green
    if (stressLevel < 60) return '#eab308' // yellow
    return '#ef4444' // red
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-slate-600">
          Stress Level
        </span>
        <span
          className="text-xs font-semibold"
          style={{ color: getBarColor() }}
        >
          {stressLevel}%
        </span>
      </div>

      {/* Stress bar */}
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: 'rgba(148, 163, 184, 0.3)' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${stressLevel}%`,
            background: getBarColor(),
            transition: 'width 300ms ease-out, background-color 300ms ease-out',
            boxShadow: `0 0 8px ${getBarColor()}60`,
          }}
        />
      </div>

      {/* Alert message */}
      {alertMessage && (
        <div
          className="flex items-start gap-2 p-2 rounded-lg mt-2"
          style={{
            background: 'rgba(251, 191, 36, 0.15)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
          }}
        >
          <span className="text-amber-500 text-sm">⚠</span>
          <div>
            <p className="text-xs font-medium text-amber-700">
              Stress level elevated.
            </p>
            <p className="text-[10px] text-amber-600">
              Consider taking a short break.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
