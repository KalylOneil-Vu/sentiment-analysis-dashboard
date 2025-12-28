interface HUDOverlayProps {
  isUserPresent: boolean
  isLoading?: boolean
}

export function HUDOverlay({ isUserPresent, isLoading = false }: HUDOverlayProps) {
  return (
    <div className="absolute inset-0 flex flex-col pointer-events-none">
      {/* Top section - Status indicators (above VisionHUD) */}
      <div className="flex justify-between items-start p-6">
        {/* Left status */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: isUserPresent ? 'var(--accent)' : 'var(--text-faint)',
                boxShadow: isUserPresent ? '0 0 8px var(--accent-glow)' : 'none',
                animation: isUserPresent ? 'pulse 2s ease-in-out infinite' : 'none',
              }}
            />
            <span
              className="text-[10px] tracking-[0.2em] uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              {isUserPresent ? 'SUBJECT DETECTED' : 'SCANNING'}
            </span>
          </div>
          {isLoading && (
            <span
              className="text-[10px] tracking-[0.15em] uppercase ml-4"
              style={{ color: 'var(--text-faint)' }}
            >
              INITIALIZING SYSTEMS...
            </span>
          )}
        </div>

        {/* Right status */}
        <div className="flex flex-col items-end gap-1">
          <span
            className="text-[10px] tracking-[0.2em] uppercase"
            style={{ color: 'var(--text-faint)' }}
          >
            SCENE 00
          </span>
          <span
            className="text-[10px] tracking-[0.15em] uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            SENTIMENT ANALYSIS
          </span>
        </div>
      </div>

      {/* Spacer for VisionHUD area (30% top + camera panel height) */}
      <div className="flex-1" style={{ minHeight: '55%' }} />

      {/* Bottom section - Interaction hint (below VisionHUD) */}
      <div className="flex flex-col items-center gap-6 px-6 pb-8">
        {/* Interaction hint */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-1 rounded-full"
                style={{
                  backgroundColor: 'var(--accent-muted)',
                  animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
          <span
            className="text-[9px] tracking-[0.1em] uppercase"
            style={{ color: 'var(--text-faint)' }}
          >
            TAP ANYWHERE TO BEGIN
          </span>
        </div>
      </div>
    </div>
  )
}
