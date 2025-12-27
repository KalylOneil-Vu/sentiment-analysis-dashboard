import { useRef, useEffect, RefObject, useState } from 'react'
import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { LandmarkVisibility } from '../../../types/emotion'
import { FloatingParticles } from '../../../components/FloatingParticles'
import { StatusBadge } from '../../../components/StatusBadge'
import { FrameCounter } from '../../../components/FrameCounter'
import { LightLeak } from '../../../components/LightLeak'
import {
  FACE_OVAL_INDICES,
  LEFT_EYE_INDICES,
  RIGHT_EYE_INDICES,
  NOSE_INDICES,
  LIPS_OUTER_INDICES,
  LEFT_EAR_INDEX,
  RIGHT_EAR_INDEX,
} from '../../../lib/mediapipe/faceDetector'

interface CameraPanelProps {
  videoRef: RefObject<HTMLVideoElement>
  landmarks: NormalizedLandmark[] | null
  landmarkVisibility: LandmarkVisibility
}

export function CameraPanel({
  videoRef,
  landmarks,
  landmarkVisibility,
}: CameraPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const faceDetected = landmarks !== null && landmarks.length > 0
  const [gridPulse, setGridPulse] = useState(false)
  const prevFaceDetectedRef = useRef(false)

  // Trigger grid pulse when face is first detected
  useEffect(() => {
    if (faceDetected && !prevFaceDetectedRef.current) {
      setGridPulse(true)
      const timer = setTimeout(() => setGridPulse(false), 3000)
      return () => clearTimeout(timer)
    }
    prevFaceDetectedRef.current = faceDetected
  }, [faceDetected])

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

      // Draw grid overlay (4x5) - pulse when face detected
      const gridAlpha = gridPulse ? 0.35 : 0.15
      ctx.strokeStyle = `rgba(100, 116, 139, ${gridAlpha})`
      if (gridPulse) {
        ctx.shadowBlur = 4
        ctx.shadowColor = 'rgba(100, 116, 139, 0.3)'
      }
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
      // Reset shadow
      ctx.shadowBlur = 0

      // Draw face overlay with correct offset/scale
      if (landmarks && landmarks.length > 0) {
        drawFaceOverlay(ctx, landmarks, drawWidth, drawHeight, offsetX, offsetY, landmarkVisibility)
      }

      animationId = requestAnimationFrame(draw)
    }

    animationId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animationId)
  }, [videoRef, landmarks, landmarkVisibility, gridPulse])

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Title above camera */}
      <h2
        className="text-lg font-semibold mb-3"
        style={{ color: 'var(--text-primary)' }}
      >
        The Face of Our Emotions
      </h2>

      {/* Camera container */}
      <div
        ref={containerRef}
        className={`relative flex-1 min-h-0 rounded-xl overflow-hidden ${!faceDetected ? 'breathing-idle' : ''}`}
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
        }}
      >
        <canvas ref={canvasRef} className="w-full h-full object-cover" />

        {/* Light leak overlay */}
        <LightLeak />

        {/* Recording indicator */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full bg-red-500 recording-indicator"
            style={{ boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)' }}
          />
        </div>

        {/* Status badge */}
        <div className="absolute top-4 right-4">
          <StatusBadge status={faceDetected ? 'locked' : 'standby'} />
        </div>

        {/* Frame counter */}
        <div className="absolute bottom-4 right-4">
          <FrameCounter />
        </div>

        {/* Scan line sweep */}
        <div className="scan-line-sweep" />

        {/* Floating particles during analysis */}
        <FloatingParticles isActive={faceDetected} />

        {/* Corner accents - animated brackets */}
        {(() => {
          const bracketClass = faceDetected ? 'bracket-locked' : 'bracket-idle'
          return (
            <>
              <div
                className={`absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 ${bracketClass}`}
                style={{ borderColor: 'var(--accent-muted)' }}
              />
              <div
                className={`absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 ${bracketClass}`}
                style={{ borderColor: 'var(--accent-muted)' }}
              />
              <div
                className={`absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 ${bracketClass}`}
                style={{ borderColor: 'var(--accent-muted)' }}
              />
              <div
                className={`absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 ${bracketClass}`}
                style={{ borderColor: 'var(--accent-muted)' }}
              />
            </>
          )
        })()}
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
  offsetY: number,
  visibility: LandmarkVisibility
) {
  // Transform landmark coordinates to account for video crop/offset
  const transformX = (x: number) => (1 - x) * drawWidth + offsetX // mirror + scale + offset
  const transformY = (y: number) => y * drawHeight + offsetY // scale + offset

  // Draw face oval - green outline (always visible)
  ctx.save()
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)'
  ctx.lineWidth = 2
  ctx.shadowBlur = 8
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

  // Helper to draw landmark dots
  const drawLandmarkDots = (indices: number[], color: string = 'rgba(6, 182, 212, 0.8)') => {
    ctx.save()
    ctx.fillStyle = color
    ctx.shadowBlur = 6
    ctx.shadowColor = 'rgba(6, 182, 212, 0.5)'

    indices.forEach(index => {
      const point = landmarks[index]
      if (point) {
        ctx.beginPath()
        ctx.arc(transformX(point.x), transformY(point.y), 3, 0, Math.PI * 2)
        ctx.fill()
      }
    })
    ctx.restore()
  }

  // Draw eyes (if visible)
  if (visibility.eyes) {
    drawLandmarkDots([...LEFT_EYE_INDICES, ...RIGHT_EYE_INDICES])
  }

  // Draw nose (if visible)
  if (visibility.nose) {
    drawLandmarkDots(NOSE_INDICES)
  }

  // Draw mouth (if visible)
  if (visibility.mouth) {
    drawLandmarkDots(LIPS_OUTER_INDICES)
  }

  // Draw ears (if visible)
  if (visibility.ears) {
    drawLandmarkDots([LEFT_EAR_INDEX, RIGHT_EAR_INDEX])
  }
}
