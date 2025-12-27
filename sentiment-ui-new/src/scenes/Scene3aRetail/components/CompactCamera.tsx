import { useRef, useEffect, RefObject } from 'react'
import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { FACE_OVAL_INDICES } from '../../../lib/mediapipe/faceDetector'
import { MatchResult } from '../../../types/product'

interface CompactCameraProps {
  videoRef: RefObject<HTMLVideoElement>
  landmarks: NormalizedLandmark[] | null
  matchResult: MatchResult
  isAutoAdvancing: boolean
}

export function CompactCamera({
  videoRef,
  landmarks,
  matchResult,
  isAutoAdvancing,
}: CompactCameraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let animationId: number
    let lastTime = 0

    function draw(time: number) {
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

      // Calculate video draw parameters for "cover" behavior
      let drawWidth = canvas.width
      let drawHeight = canvas.height
      let offsetX = 0
      let offsetY = 0

      if (video.readyState >= 2) {
        const videoAspect = video.videoWidth / video.videoHeight
        const canvasAspect = canvas.width / canvas.height

        if (videoAspect > canvasAspect) {
          // Video is wider - crop sides
          drawHeight = canvas.height
          drawWidth = canvas.height * videoAspect
          offsetX = (canvas.width - drawWidth) / 2
          offsetY = 0
        } else {
          // Video is taller - crop top/bottom
          drawWidth = canvas.width
          drawHeight = canvas.width / videoAspect
          offsetX = 0
          offsetY = (canvas.height - drawHeight) / 2
        }

        ctx.save()
        ctx.scale(-1, 1)
        ctx.drawImage(video, -offsetX - drawWidth, offsetY, drawWidth, drawHeight)
        ctx.restore()
      }

      // Draw face overlay with correct offset/scale
      if (landmarks && landmarks.length > 0) {
        drawFaceOverlay(ctx, landmarks, drawWidth, drawHeight, offsetX, offsetY)
      }

      animationId = requestAnimationFrame(draw)
    }

    animationId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animationId)
  }, [videoRef, landmarks])

  const getMatchColor = () => {
    if (matchResult.score >= 70) return '#22c55e'
    if (matchResult.score >= 50) return '#eab308'
    return '#ef4444'
  }

  return (
    <div
      className="flex items-center gap-4 p-3 rounded-xl"
      style={{
        background: 'rgba(255, 255, 255, 0.6)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
      }}
    >
      {/* Small camera - 4:3 aspect ratio to match webcam */}
      <div
        ref={containerRef}
        className="relative w-24 rounded-lg overflow-hidden flex-shrink-0"
        style={{
          aspectRatio: '4/3',
          background: 'rgba(241, 245, 249, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
        }}
      >
        <canvas ref={canvasRef} className="w-full h-full object-cover" />

        {/* Tiny recording dot */}
        <div
          className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-red-500 recording-indicator"
          style={{ boxShadow: '0 0 4px rgba(239, 68, 68, 0.6)' }}
        />
      </div>

      {/* Match info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-xl font-bold"
            style={{ color: getMatchColor() }}
          >
            {matchResult.score}%
          </span>
          <span className="text-sm font-medium text-slate-600">Match</span>
        </div>
        <p className="text-xs text-slate-500 leading-tight mt-1">
          {matchResult.label}
        </p>
        {isAutoAdvancing && (
          <p className="text-[10px] text-amber-600 mt-1 animate-pulse">
            Auto-advancing...
          </p>
        )}
      </div>
    </div>
  )
}

function drawFaceOverlay(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  drawWidth: number,
  drawHeight: number,
  offsetX: number,
  offsetY: number
) {
  // Transform landmark coordinates to account for video crop/offset
  const transformX = (x: number) => (1 - x) * drawWidth + offsetX // mirror + scale + offset
  const transformY = (y: number) => y * drawHeight + offsetY // scale + offset

  ctx.save()
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)'
  ctx.lineWidth = 1.5
  ctx.shadowBlur = 4
  ctx.shadowColor = 'rgba(34, 197, 94, 0.4)'

  const ovalPoints = FACE_OVAL_INDICES.map(i => landmarks[i]).filter(p => p)

  if (ovalPoints.length > 2) {
    ctx.beginPath()
    ctx.moveTo(transformX(ovalPoints[0].x), transformY(ovalPoints[0].y))
    for (let i = 1; i < ovalPoints.length; i++) {
      ctx.lineTo(transformX(ovalPoints[i].x), transformY(ovalPoints[i].y))
    }
    ctx.closePath()
    ctx.stroke()
  }
  ctx.restore()
}
