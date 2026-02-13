import { useMemo } from 'react'

interface SignalNode {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
}

interface SignalNodesProps {
  emotionalShift?: number
  isConverging?: boolean
}

export function SignalNodes({
  emotionalShift = 0,
  isConverging = false,
}: SignalNodesProps) {
  // Create stable nodes once - never changes
  const nodes = useMemo<SignalNode[]>(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: 15 + Math.random() * 70,
      y: 20 + Math.random() * 60,
      size: 12 + Math.random() * 12,
      delay: Math.random() * 2,
      duration: 4 + Math.random() * 4,
    }))
  }, [])

  // Calculate glow intensity based on emotional shift (0.4 to 0.9)
  const glowIntensity = 0.4 + emotionalShift * 0.5
  const glowSize = 12 + emotionalShift * 18

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{
        // Use CSS custom properties for dynamic values - updates without re-mounting nodes
        '--glow-intensity': glowIntensity,
        '--glow-size': `${glowSize}px`,
      } as React.CSSProperties}
    >
      {nodes.map(node => (
        <div
          key={node.id}
          className={`signal-node absolute rounded-full ${isConverging ? 'node-converge' : ''}`}
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            width: `${node.size}px`,
            height: `${node.size}px`,
            animation: isConverging ? 'none' : `float ${node.duration}s ease-in-out ${node.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
