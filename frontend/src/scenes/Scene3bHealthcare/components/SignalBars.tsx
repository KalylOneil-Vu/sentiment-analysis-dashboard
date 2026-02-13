import { HealthcareSignals } from '../../../hooks/useHealthcareSignals'

interface SignalBarsProps {
  signals: HealthcareSignals
}

interface SignalConfig {
  key: keyof HealthcareSignals
  label: string
  color: string
}

const SIGNAL_CONFIG: SignalConfig[] = [
  { key: 'pain', label: 'PAIN', color: '#ef4444' },
  { key: 'stress', label: 'STRESS', color: '#f97316' },
  { key: 'confusion', label: 'CONFUSION', color: '#8b5cf6' },
]

export function SignalBars({ signals }: SignalBarsProps) {
  return (
    <div className="space-y-6">
      {SIGNAL_CONFIG.map(({ key, label, color }) => (
        <div key={key} className="space-y-2">
          <span className="text-xs font-medium tracking-[0.15em] uppercase text-slate-600">
            {label}
          </span>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: 'rgba(148, 163, 184, 0.2)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${signals[key]}%`,
                background: color,
                transition: 'width 300ms ease-out',
                boxShadow: `0 0 8px ${color}40`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
