import { useEffect, useState } from 'react'

interface PulsingGridProps {
  intensity?: number // 0-1, affects opacity
}

export function PulsingGrid({ intensity = 1 }: PulsingGridProps) {
  const [pulsePhase, setPulsePhase] = useState(0)

  useEffect(() => {
    let animationId: number
    let startTime = performance.now()

    function animate(time: number) {
      const elapsed = (time - startTime) / 1000
      setPulsePhase((elapsed / 3) % 1) // 3 second cycle
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [])

  const pulseOpacity = 0.08 + 0.04 * Math.sin(pulsePhase * Math.PI * 2) * intensity

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 grid-pattern transition-opacity duration-1000"
        style={{ opacity: pulseOpacity * intensity }}
      />

      {/* Radial glow from center */}
      <div
        className="absolute inset-0 radial-glow"
        style={{ opacity: 0.6 + 0.2 * Math.sin(pulsePhase * Math.PI * 2) }}
      />

      {/* Scan line effect */}
      <div className="scan-line" />

      {/* Corner decorations */}
      <div className="absolute inset-4 pointer-events-none">
        <div className="hud-corner hud-corner-tl" />
        <div className="hud-corner hud-corner-tr" />
        <div className="hud-corner hud-corner-bl" />
        <div className="hud-corner hud-corner-br" />
      </div>

      {/* Horizontal scan lines (subtle CRT effect) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            var(--grid-line) 2px,
            var(--grid-line) 4px
          )`,
        }}
      />

      {/* Vignette effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(
            ellipse 80% 70% at 50% 50%,
            transparent 0%,
            color-mix(in srgb, var(--bg-to) 40%, transparent) 60%,
            color-mix(in srgb, var(--bg-to) 80%, transparent) 100%
          )`,
        }}
      />
    </div>
  )
}
