import { useRef, useEffect } from 'react'
import { useWebcam } from '../../hooks/useWebcam'
import { useFaceDetection } from '../../hooks/useFaceDetection'
import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { FACE_OVAL_INDICES } from '../../lib/mediapipe/faceDetector'
import { LightSignalNodes } from './components/LightSignalNodes'
import { HUDReadouts } from './components/HUDReadouts'
import { MagneticButton } from '../../components/MagneticButton'

interface Scene1WelcomeProps {
  onBegin: () => void
}

export function Scene1Welcome({ onBegin }: Scene1WelcomeProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { isStreaming } = useWebcam(videoRef)
  const { landmarks: faceLandmarks } = useFaceDetection(videoRef, isStreaming)

  // Animation frame for continuous video drawing
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

      // Draw subtle grid overlay
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.12)'
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

      // Draw face overlay with correct offset/scale
      if (faceLandmarks && faceLandmarks.length > 0) {
        drawFaceOverlay(ctx, faceLandmarks, drawWidth, drawHeight, offsetX, offsetY)
      }

      animationId = requestAnimationFrame(draw)
    }

    animationId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animationId)
  }, [faceLandmarks])

  return (
    <div
      className="relative w-full h-full flex items-center justify-center p-4 md:p-8 lg:p-12 transition-colors duration-300"
      style={{
        background: `linear-gradient(to bottom, var(--bg-from), var(--bg-to))`,
      }}
    >
      {/* Hidden video */}
      <video ref={videoRef} className="hidden" playsInline muted autoPlay />

      {/* Floating signal nodes - light theme */}
      <LightSignalNodes />

      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(var(--grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Main content container - optimized for 9:21 vertical */}
      <div className="relative flex flex-col md:flex-row items-center gap-4 md:gap-8 lg:gap-12 max-w-4xl w-full z-10">
        {/* Camera feed area */}
        <div className="relative w-[85%] md:w-1/2 aspect-[3/4] max-w-xs md:max-w-sm entrance-animate entrance-delay-1">
          {/* Glassmorphic camera container with pulsing glow */}
          <div
            ref={containerRef}
            className={`relative w-full h-full rounded-2xl overflow-hidden camera-glow-pulse ${!(faceLandmarks && faceLandmarks.length > 0) ? 'breathing-idle' : ''}`}
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <canvas ref={canvasRef} className="w-full h-full object-cover" />

            {/* Recording indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"
                style={{ boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)' }}
              />
            </div>

            {/* Corner accents - animated brackets */}
            {(() => {
              const faceDetected = faceLandmarks && faceLandmarks.length > 0
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

        {/* Content area */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-1/2 space-y-5">
          {/* Title */}
          <h1
            className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight entrance-animate entrance-delay-2"
            style={{ color: 'var(--text-primary)' }}
          >
            The Face of Our
            <br />
            Emotions
          </h1>

          {/* Subtitle */}
          <p
            className="text-[11px] tracking-[0.2em] uppercase font-medium entrance-animate entrance-delay-3"
            style={{ color: 'var(--text-faint)' }}
          >
            Step Closer to Begin
          </p>

          {/* Description */}
          <p
            className="text-sm leading-relaxed max-w-xs entrance-animate entrance-delay-4"
            style={{ color: 'var(--text-muted)' }}
          >
            This system detects your facial cues in real time.
          </p>

          {/* Begin button */}
          <MagneticButton
            onClick={onBegin}
            className="mt-4 px-10 py-3 rounded-full text-sm font-medium tracking-[0.15em] uppercase transition-all duration-300 hover:scale-105 hover:shadow-lg entrance-animate entrance-delay-5"
            style={{
              background: 'var(--glass-bg-strong)',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid var(--accent-muted)',
              color: 'var(--text-primary)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            }}
          >
            Begin
          </MagneticButton>
        </div>
      </div>

      {/* HUD data readouts */}
      <HUDReadouts />

      {/* Scene indicator */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-0.5 entrance-animate entrance-delay-6">
        <span
          className="text-[10px] tracking-[0.2em] uppercase"
          style={{ color: 'var(--text-faint)' }}
        >
          Scene 01
        </span>
        <span
          className="text-[10px] tracking-[0.15em] uppercase"
          style={{ color: 'var(--accent-muted)' }}
        >
          Initialize
        </span>
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

  // Draw face oval - green/teal for visibility on light bg
  ctx.save()
  ctx.strokeStyle = 'rgba(20, 184, 166, 0.7)'
  ctx.lineWidth = 2
  ctx.shadowBlur = 8
  ctx.shadowColor = 'rgba(20, 184, 166, 0.4)'

  const ovalPoints = FACE_OVAL_INDICES
    .map(i => landmarks[i])
    .filter(p => p)

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
