import { useState, useEffect, useRef } from 'react'

interface UseAnimatedNumberOptions {
  duration?: number // Animation duration in ms
  easing?: (t: number) => number // Easing function
}

// Ease out cubic for smooth deceleration
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)

export function useAnimatedNumber(
  targetValue: number,
  options: UseAnimatedNumberOptions = {}
): { value: number; isAnimating: boolean } {
  const { duration = 300, easing = easeOutCubic } = options

  const [displayValue, setDisplayValue] = useState(targetValue)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef<number | null>(null)
  const startValueRef = useRef(targetValue)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    // Skip animation if values are the same
    if (displayValue === targetValue) {
      return
    }

    startValueRef.current = displayValue
    startTimeRef.current = null
    setIsAnimating(true)

    const animate = (currentTime: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = currentTime
      }

      const elapsed = currentTime - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easing(progress)

      const currentValue =
        startValueRef.current + (targetValue - startValueRef.current) * easedProgress

      setDisplayValue(Math.round(currentValue))

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(targetValue)
        setIsAnimating(false)
        animationRef.current = null
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [targetValue, duration, easing])

  return { value: displayValue, isAnimating }
}
