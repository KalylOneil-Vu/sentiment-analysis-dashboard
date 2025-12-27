import { useRef, useEffect, RefObject } from 'react'
import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { FACE_OVAL_INDICES } from '../../../lib/mediapipe/faceDetector'
import { MatchResult } from '../../../types/product'

interface CameraWithMatchProps {
  videoRef: RefObject<HTMLVideoElement>
  landmarks: NormalizedLandmark[] | null
  matchResult: MatchResult
  isAutoAdvancing: boolean
}

export function CameraWithMatch({
  videoRef,
  landmarks,
  matchResult,
  isAutoAdvancing,
}: CameraWithMatchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let animationId: number
    let lastTime = 0

    function draw(time: number) {
      // Throttle to ~20fps
      if (time - lastTime < 50) {
        animationId = requestAnimationFrame(draw)
        return
      }
      lastTime = time

      const canvas = canvasRef.current
      const container = containerRef.current
      const video = videoRef.current
      if (!canvas || !container || !video) {
        animationId = requestAnimationFrame(draw)
        return
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        animationId = requestAnimationFrame(draw)
        return
      }

      const rect = container.getBoundingClientRect()
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width
        canvas.height = rect.height
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw mirrored video
      if (video.readyState >= 2) {
        ctx.save()
        ctx.scale(-1, 1)
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
        ctx.restore()
      }

      // Draw face overlay
      if (landmarks && landmarks.length > 0) {
        drawFaceOverlay(ctx, landmarks, canvas.width, canvas.height)
      }

      animationId = requestAnimationFrame(draw)
    }

    animationId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animationId)
  }, [videoRef, landmarks])

  // Determine match color
  const getMatchColor = () => {
    if (matchResult.score >= 70) return '#22c55e' // Green
    if (matchResult.score >= 50) return '#eab308' // Yellow
    return '#ef4444' // Red
  }

  return (
    <div className="space-y-3">
      {/* Camera container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] rounded-lg overflow-hidden"
        style={{
          background: 'rgba(241, 245, 249, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
        }}
      >
        <canvas ref={canvasRef} className="w-full h-full object-cover" />

        {/* Recording indicator */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full bg-red-500 recording-indicator"
            style={{ boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)' }}
          />
        </div>
      </div>

      {/* Match score display */}
      <div
        className="flex items-center gap-3 p-3 rounded-lg"
        style={{
          background: 'rgba(255, 255, 255, 0.6)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
        }}
      >
        {/* Circular score indicator */}
        <div className="relative w-12 h-12 flex-shrink-0">
          <svg className="w-full h-full -rotate-90">
            {/* Background circle */}
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="rgba(148, 163, 184, 0.2)"
              strokeWidth="4"
            />
            {/* Progress circle */}
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke={getMatchColor()}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 20}
              strokeDashoffset={2 * Math.PI * 20 * (1 - matchResult.score / 100)}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          {/* Score text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold" style={{ color: getMatchColor() }}>
              {matchResult.score}%
            </span>
          </div>
        </div>

        {/* Match label */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700">
            {matchResult.score}% Match
          </p>
          <p className="text-xs text-slate-500 truncate">
            {matchResult.label}
          </p>
          {isAutoAdvancing && (
            <p className="text-[10px] text-amber-600 mt-0.5 animate-pulse">
              Auto-advancing...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function drawFaceOverlay(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number
) {
  const mirrorX = (x: number) => 1 - x

  // Draw face oval - green outline
  ctx.save()
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)'
  ctx.lineWidth = 2
  ctx.shadowBlur = 6
  ctx.shadowColor = 'rgba(34, 197, 94, 0.4)'

  const ovalPoints = FACE_OVAL_INDICES.map(i => landmarks[i]).filter(p => p)

  if (ovalPoints.length > 2) {
    ctx.beginPath()
    ctx.moveTo(mirrorX(ovalPoints[0].x) * width, ovalPoints[0].y * height)
    for (let i = 1; i < ovalPoints.length; i++) {
      ctx.lineTo(mirrorX(ovalPoints[i].x) * width, ovalPoints[i].y * height)
    }
    ctx.closePath()
    ctx.stroke()
  }
  ctx.restore()
}
