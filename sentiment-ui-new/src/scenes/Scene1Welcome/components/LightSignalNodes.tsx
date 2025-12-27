import { useMemo } from 'react'

interface LightNode {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
}

export function LightSignalNodes() {
  const nodes = useMemo<LightNode[]>(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      size: 8 + Math.random() * 10,
      delay: Math.random() * 3,
      duration: 5 + Math.random() * 4,
    }))
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {nodes.map(node => (
        <div
          key={node.id}
          className="signal-node-light absolute rounded-full"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            width: `${node.size}px`,
            height: `${node.size}px`,
            animation: `float ${node.duration}s ease-in-out ${node.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
