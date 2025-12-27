import { useRef, useEffect, RefObject } from 'react'
import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { FACE_OVAL_INDICES } from '../../../lib/mediapipe/faceDetector'

interface HealthcareCameraProps {
  videoRef: RefObject<HTMLVideoElement>
  landmarks: NormalizedLandmark[] | null
}

export function HealthcareCamera({ videoRef, landmarks }: HealthcareCameraProps) {
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

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(241, 245, 249, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full object-cover" />

      {/* Recording indicator */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div
          className="w-2.5 h-2.5 rounded-full bg-red-500 recording-indicator"
          style={{ boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)' }}
        />
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-teal-400/50" />
      <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-teal-400/50" />
      <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-teal-400/50" />
      <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-teal-400/50" />
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

  // Draw face oval - green/teal for visibility on light bg
  ctx.save()
  ctx.strokeStyle = 'rgba(20, 184, 166, 0.7)'
  ctx.lineWidth = 2
  ctx.shadowBlur = 8
  ctx.shadowColor = 'rgba(20, 184, 166, 0.4)'

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

  // Draw key landmark dots - teal/cyan
  const keyLandmarks = [33, 133, 362, 263, 1, 4, 61, 291, 0, 17]

  ctx.save()
  ctx.fillStyle = 'rgba(6, 182, 212, 0.8)'
  ctx.shadowBlur = 6
  ctx.shadowColor = 'rgba(6, 182, 212, 0.5)'

  keyLandmarks.forEach(index => {
    const point = landmarks[index]
    if (point) {
      ctx.beginPath()
      ctx.arc(transformX(point.x), transformY(point.y), 3, 0, Math.PI * 2)
      ctx.fill()
    }
  })
  ctx.restore()
}
