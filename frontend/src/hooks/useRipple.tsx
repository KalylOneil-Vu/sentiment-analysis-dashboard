import { useState, useCallback, MouseEvent } from 'react'

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

export function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([])

  const createRipple = useCallback((event: MouseEvent<HTMLElement>) => {
    const element = event.currentTarget
    const rect = element.getBoundingClientRect()

    const size = Math.max(rect.width, rect.height) * 2
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

    const newRipple: Ripple = {
      id: Date.now(),
      x,
      y,
      size,
    }

    setRipples(prev => [...prev, newRipple])

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id))
    }, 600)
  }, [])

  const rippleElements = ripples.map(ripple => (
    <span
      key={ripple.id}
      className="ripple"
      style={{
        left: ripple.x,
        top: ripple.y,
        width: ripple.size,
        height: ripple.size,
      }}
    />
  ))

  return { createRipple, rippleElements }
}
