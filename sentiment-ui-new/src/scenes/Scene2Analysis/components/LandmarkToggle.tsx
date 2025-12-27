import { LandmarkVisibility } from '../../../types/emotion'
import { Tooltip } from '../../../components/Tooltip'

interface LandmarkToggleProps {
  visibility: LandmarkVisibility
  onToggle: (key: keyof LandmarkVisibility) => void
}

const toggleButtons: { key: keyof LandmarkVisibility; label: string; tooltip: string }[] = [
  { key: 'nose', label: 'NOSE', tooltip: 'Toggle nose landmark points' },
  { key: 'ears', label: 'EARS', tooltip: 'Toggle ear landmark points' },
  { key: 'mouth', label: 'MOUTH', tooltip: 'Toggle mouth landmark points' },
]

export function LandmarkToggle({ visibility, onToggle }: LandmarkToggleProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-medium">
        Landmark Toggle
      </h3>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Eye icon (always visible indicator) */}
        <Tooltip content="Toggle eye landmark points">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${
              visibility.eyes ? 'landmark-toggle-active' : ''
            }`}
            style={{
              background: visibility.eyes
                ? 'rgba(20, 184, 166, 0.15)'
                : 'rgba(255, 255, 255, 0.6)',
              border: `1px solid ${
                visibility.eyes
                  ? 'rgba(20, 184, 166, 0.5)'
                  : 'rgba(148, 163, 184, 0.2)'
              }`,
            }}
            onClick={() => onToggle('eyes')}
            role="button"
            tabIndex={0}
          >
            <svg
              className={`w-5 h-5 ${
                visibility.eyes ? 'text-teal-500' : 'text-slate-400'
              }`}
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
          </div>
        </Tooltip>

        {/* Toggle buttons */}
        {toggleButtons.map(({ key, label, tooltip }) => (
          <Tooltip key={key} content={tooltip}>
            <button
              onClick={() => onToggle(key)}
              className={`px-4 py-2 rounded-lg text-[10px] tracking-[0.15em] font-medium uppercase transition-all duration-200 ${
                visibility[key] ? 'landmark-toggle-active' : ''
              }`}
              style={{
                background: visibility[key]
                  ? 'rgba(20, 184, 166, 0.15)'
                  : 'rgba(255, 255, 255, 0.6)',
                border: `1px solid ${
                  visibility[key]
                    ? 'rgba(20, 184, 166, 0.5)'
                    : 'rgba(148, 163, 184, 0.2)'
                }`,
                color: visibility[key] ? '#14b8a6' : '#64748b',
              }}
            >
              {label}
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}
