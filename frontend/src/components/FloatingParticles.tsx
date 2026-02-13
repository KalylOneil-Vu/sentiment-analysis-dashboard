import { useMemo } from 'react'

interface FloatingParticlesProps {
  isActive: boolean
  count?: number
}

interface Particle {
  id: number
  left: string
  bottom: string
  delay: string
  duration: string
  size: number
}

export function FloatingParticles({ isActive, count = 10 }: FloatingParticlesProps) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${10 + Math.random() * 80}%`,
      bottom: `${Math.random() * 20}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${1.5 + Math.random() * 1.5}s`,
      size: 3 + Math.random() * 3,
    }))
  }, [count])

  if (!isActive) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: particle.left,
            bottom: particle.bottom,
            width: particle.size,
            height: particle.size,
            '--delay': particle.delay,
            '--duration': particle.duration,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
