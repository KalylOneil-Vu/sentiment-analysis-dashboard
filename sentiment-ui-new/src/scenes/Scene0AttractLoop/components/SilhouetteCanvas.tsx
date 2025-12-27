import { useRef, useEffect, useCallback } from 'react'
import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { renderFullSilhouette } from '../../../lib/canvas/silhouetteRenderer'

interface SilhouetteCanvasProps {
  poseLandmarks: NormalizedLandmark[] | null
  faceLandmarks: NormalizedLandmark[] | null
  breathingPhase: number
}

export function SilhouetteCanvas({
  poseLandmarks,
  faceLandmarks,
  breathingPhase,
}: SilhouetteCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
    }
  }, [])

  // Handle resize
  useEffect(() => {
    updateCanvasSize()

    const handleResize = () => {
      updateCanvasSize()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [updateCanvasSize])

  // Render silhouette
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = container.getBoundingClientRect()

    renderFullSilhouette(
      ctx,
      poseLandmarks,
      faceLandmarks,
      rect.width,
      rect.height,
      breathingPhase
    )
  }, [poseLandmarks, faceLandmarks, breathingPhase])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full canvas-mirror"
      />
    </div>
  )
}
