import { useRef, useCallback, RefObject } from 'react'

interface MagneticEffectOptions {
  strength?: number // Max movement in pixels (default: 6)
}

export function useMagneticEffect<T extends HTMLElement>(
  options: MagneticEffectOptions = {}
): {
  ref: RefObject<T>
  onMouseMove: (e: React.MouseEvent<T>) => void
  onMouseLeave: () => void
} {
  const { strength = 6 } = options
  const ref = useRef<T>(null)

  const onMouseMove = useCallback((e: React.MouseEvent<T>) => {
    const element = ref.current
    if (!element) return

    const rect = element.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const deltaX = (e.clientX - centerX) / (rect.width / 2)
    const deltaY = (e.clientY - centerY) / (rect.height / 2)

    const moveX = deltaX * strength
    const moveY = deltaY * strength

    element.style.transform = `translate(${moveX}px, ${moveY}px)`
  }, [strength])

  const onMouseLeave = useCallback(() => {
    const element = ref.current
    if (!element) return

    element.style.transform = 'translate(0, 0)'
  }, [])

  return { ref, onMouseMove, onMouseLeave }
}
