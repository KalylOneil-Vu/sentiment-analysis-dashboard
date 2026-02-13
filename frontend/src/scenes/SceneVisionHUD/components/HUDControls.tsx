/**
 * HUD Controls
 * Toggle controls for each detection module
 */

import type { HUDConfig, VisionModule } from '../../../types/visionHUD'

interface HUDControlsProps {
  config: HUDConfig
  updateConfig: (updates: Partial<HUDConfig>) => void
  toggleModule: (module: VisionModule) => void
}

const MODULE_INFO: Record<VisionModule, { label: string; icon: string }> = {
  face: { label: 'Face', icon: '👤' },
  pose: { label: 'Pose', icon: '🏃' },
  hand: { label: 'Hands', icon: '✋' },
  object: { label: 'Objects', icon: '📦' },
  bio: { label: 'Bio', icon: '🎂' },
  speech: { label: 'Speech', icon: '🎤' },
}

export function HUDControls({ config, toggleModule }: HUDControlsProps) {
  return (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10">
      <div
        className="p-3 rounded-xl space-y-2"
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 px-1">
          Modules
        </div>

        {(Object.keys(MODULE_INFO) as VisionModule[]).map(module => {
          const { label, icon } = MODULE_INFO[module]
          const isEnabled = config.modules[module]

          return (
            <button
              key={module}
              onClick={() => toggleModule(module)}
              className={`
                w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${isEnabled
                  ? 'bg-white/10 text-white'
                  : 'bg-transparent text-gray-500 hover:text-gray-300'}
              `}
            >
              <span className="text-base">{icon}</span>
              <span>{label}</span>
              <div
                className={`
                  ml-auto w-2 h-2 rounded-full transition-colors
                  ${isEnabled ? 'bg-green-500' : 'bg-gray-600'}
                `}
              />
            </button>
          )
        })}

        {/* Display options */}
        <div className="border-t border-white/10 pt-2 mt-2">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 px-1">
            Display
          </div>

          <label className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={config.showLabels}
              onChange={() => {}}
              className="w-3 h-3 rounded"
            />
            Labels
          </label>

          <label className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={config.showConfidence}
              onChange={() => {}}
              className="w-3 h-3 rounded"
            />
            Confidence
          </label>

          <label className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={config.showSkeleton}
              onChange={() => {}}
              className="w-3 h-3 rounded"
            />
            Skeleton
          </label>
        </div>
      </div>
    </div>
  )
}
