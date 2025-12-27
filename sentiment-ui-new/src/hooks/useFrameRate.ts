import { useState, useEffect, useRef } from 'react'

export function useFrameRate(): number {
  const [fps, setFps] = useState(0)
  const frameTimesRef = useRef<number[]>([])
  const lastTimeRef = useRef(performance.now())

  useEffect(() => {
    let animationId: number

    function updateFps() {
      const now = performance.now()
      const delta = now - lastTimeRef.current
      lastTimeRef.current = now

      // Keep last 30 frame times for averaging
      frameTimesRef.current.push(delta)
      if (frameTimesRef.current.length > 30) {
        frameTimesRef.current.shift()
      }

      // Calculate average FPS every 10 frames
      if (frameTimesRef.current.length % 10 === 0) {
        const avgDelta =
          frameTimesRef.current.reduce((a, b) => a + b, 0) /
          frameTimesRef.current.length
        setFps(Math.round(1000 / avgDelta))
      }

      animationId = requestAnimationFrame(updateFps)
    }

    animationId = requestAnimationFrame(updateFps)
    return () => cancelAnimationFrame(animationId)
  }, [])

  return fps
}
