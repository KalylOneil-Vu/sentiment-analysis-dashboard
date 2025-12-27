interface HUDOverlayProps {
  isUserPresent: boolean
  isLoading?: boolean
}

export function HUDOverlay({ isUserPresent, isLoading = false }: HUDOverlayProps) {
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
      {/* Top section - Status indicators */}
      <div className="flex justify-between items-start">
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

      {/* Center - Main CTA */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="text-center space-y-6 max-w-xs">
          {/* Main heading */}
          <div className="space-y-3">
            <h1
              className="text-lg font-light tracking-[0.15em] uppercase text-glow fade-in"
              style={{ color: 'var(--accent)' }}
            >
              Step Closer
            </h1>
            <p
              className="text-sm font-light tracking-[0.08em] fade-in-delay-1"
              style={{ color: 'var(--text-muted)' }}
            >
              to begin cognitive load challenge
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center gap-3 fade-in-delay-1">
            <div
              className="w-8 h-px"
              style={{ background: `linear-gradient(to right, transparent, var(--accent-muted))` }}
            />
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: 'var(--accent-muted)',
                boxShadow: '0 0 6px var(--accent-glow)',
              }}
            />
            <div
              className="w-8 h-px"
              style={{ background: `linear-gradient(to left, transparent, var(--accent-muted))` }}
            />
          </div>

          {/* Sub text */}
          <p
            className="text-xs font-light tracking-[0.12em] leading-relaxed fade-in-delay-2"
            style={{ color: 'var(--text-faint)' }}
          >
            The system is already analyzing
            <br />
            your focus and emotional state
          </p>
        </div>
      </div>

      {/* Bottom section - Technical info */}
      <div className="flex justify-between items-end">
        {/* Left spacer - matches right width for true centering */}
        <div className="w-24 md:w-32" />

        {/* Center - Interaction hint */}
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

        {/* Right info */}
        <div className="w-24 md:w-32 flex flex-col items-end gap-0.5">
          <span
            className="text-[9px] tracking-[0.15em] uppercase"
            style={{ color: 'var(--text-faint)' }}
          >
            FACIAL RECOGNITION
          </span>
          <span
            className="text-[8px] tracking-[0.1em] uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            ACTIVE
          </span>
        </div>
      </div>
    </div>
  )
}
