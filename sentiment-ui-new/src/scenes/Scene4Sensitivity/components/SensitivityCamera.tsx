import { useRef, useEffect, RefObject } from 'react'
import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import {
  FACE_OVAL_INDICES,
  LEFT_EYE_INDICES,
  RIGHT_EYE_INDICES,
} from '../../../lib/mediapipe/faceDetector'

interface SensitivityCameraProps {
  videoRef: RefObject<HTMLVideoElement>
  landmarks: NormalizedLandmark[] | null
}

export function SensitivityCamera({ videoRef, landmarks }: SensitivityCameraProps) {
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

      let drawWidth = canvas.width
      let drawHeight = canvas.height
      let offsetX = 0
      let offsetY = 0

      if (video.readyState >= 2) {
        const videoAspect = video.videoWidth / video.videoHeight
        const canvasAspect = canvas.width / canvas.height

        if (videoAspect > canvasAspect) {
          drawHeight = canvas.height
          drawWidth = canvas.height * videoAspect
          offsetX = (canvas.width - drawWidth) / 2
          offsetY = 0
        } else {
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

      // Draw grid overlay (4x5)
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)'
      ctx.lineWidth = 1
      const gridCols = 4
      const gridRows = 5
      for (let i = 1; i < gridCols; i++) {
        const x = (canvas.width / gridCols) * i
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let i = 1; i < gridRows; i++) {
        const y = (canvas.height / gridRows) * i
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      if (landmarks && landmarks.length > 0) {
        drawFaceOverlay(ctx, landmarks, drawWidth, drawHeight, offsetX, offsetY)
      }

      animationId = requestAnimationFrame(draw)
    }

    animationId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animationId)
  }, [videoRef, landmarks])

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[3/4] rounded-xl overflow-hidden"
      style={{
        background: 'rgba(241, 245, 249, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full object-cover" />

      {/* Recording indicator */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <div
          className="w-2.5 h-2.5 rounded-full bg-red-500 recording-indicator"
          style={{ boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)' }}
        />
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-slate-400/50" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-slate-400/50" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-slate-400/50" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-slate-400/50" />
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
  const transformX = (x: number) => (1 - x) * drawWidth + offsetX
  const transformY = (y: number) => y * drawHeight + offsetY

  // Draw face oval - green
  ctx.save()
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)'
  ctx.lineWidth = 2
  ctx.shadowBlur = 6
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

  // Draw eye circles - blue
  ctx.save()
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)'
  ctx.lineWidth = 1.5
  ctx.shadowBlur = 4
  ctx.shadowColor = 'rgba(59, 130, 246, 0.4)'

  // Left eye
  const leftEyePoints = LEFT_EYE_INDICES.map(i => landmarks[i]).filter(p => p)
  if (leftEyePoints.length > 0) {
    const leftEyeCenter = {
      x: leftEyePoints.reduce((sum, p) => sum + p.x, 0) / leftEyePoints.length,
      y: leftEyePoints.reduce((sum, p) => sum + p.y, 0) / leftEyePoints.length,
    }
    const leftEyeRadius = 12
    ctx.beginPath()
    ctx.arc(transformX(leftEyeCenter.x), transformY(leftEyeCenter.y), leftEyeRadius, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Right eye
  const rightEyePoints = RIGHT_EYE_INDICES.map(i => landmarks[i]).filter(p => p)
  if (rightEyePoints.length > 0) {
    const rightEyeCenter = {
      x: rightEyePoints.reduce((sum, p) => sum + p.x, 0) / rightEyePoints.length,
      y: rightEyePoints.reduce((sum, p) => sum + p.y, 0) / rightEyePoints.length,
    }
    const rightEyeRadius = 12
    ctx.beginPath()
    ctx.arc(transformX(rightEyeCenter.x), transformY(rightEyeCenter.y), rightEyeRadius, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.restore()
}
