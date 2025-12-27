/**
 * HUD Status Bar
 * Shows status of each detection module
 */

interface HUDStatusBarProps {
  isReady: {
    face: boolean
    pose: boolean
    hand: boolean
    object: boolean
    bio: boolean
    speech: boolean
  }
}

const STATUS_ITEMS = [
  { key: 'face', label: 'Face', icon: '👤' },
  { key: 'pose', label: 'Pose', icon: '🏃' },
  { key: 'hand', label: 'Hand', icon: '✋' },
  { key: 'object', label: 'Object', icon: '📦' },
  { key: 'bio', label: 'Bio', icon: '🎂' },
  { key: 'speech', label: 'Speech', icon: '🎤' },
] as const

export function HUDStatusBar({ isReady }: HUDStatusBarProps) {
  const allReady = Object.values(isReady).every(Boolean)
  const readyCount = Object.values(isReady).filter(Boolean).length
  const totalCount = Object.keys(isReady).length

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
      <div
        className="flex items-center gap-4 px-4 py-2 rounded-full"
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Overall status */}
        <div className="flex items-center gap-2 pr-3 border-r border-white/20">
          <div
            className={`w-2 h-2 rounded-full ${
              allReady ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
            }`}
          />
          <span className="text-xs text-gray-300">
            {allReady ? 'All Ready' : `Loading ${readyCount}/${totalCount}`}
          </span>
        </div>

        {/* Module status indicators */}
        <div className="flex items-center gap-3">
          {STATUS_ITEMS.map(({ key, label, icon }) => {
            const ready = isReady[key as keyof typeof isReady]
            return (
              <div
                key={key}
                className="flex items-center gap-1"
                title={`${label}: ${ready ? 'Ready' : 'Loading'}`}
              >
                <span className="text-sm">{icon}</span>
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    ready ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
