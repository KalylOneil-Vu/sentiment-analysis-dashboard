import { useRef, useEffect, RefObject } from 'react'
import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { FACE_OVAL_INDICES } from '../../../lib/mediapipe/faceDetector'

interface CompactCameraOverlayProps {
  videoRef: RefObject<HTMLVideoElement>
  landmarks: NormalizedLandmark[] | null
}

export function CompactCameraOverlay({ videoRef, landmarks }: CompactCameraOverlayProps) {
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
      className="w-20 h-16 rounded-lg overflow-hidden"
      style={{
        background: 'rgba(0, 0, 0, 0.3)',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full object-cover" />
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
