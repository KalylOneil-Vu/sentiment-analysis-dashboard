import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { POSE_CONNECTIONS } from '../mediapipe/poseDetector'
import { FACE_OVAL_INDICES } from '../mediapipe/faceDetector'

interface RenderConfig {
  glowColor: string
  glowIntensity: number
  lineWidth: number
  breathingPhase: number
}

interface Point {
  x: number
  y: number
  visibility: number
}

function landmarksToPoints(
  landmarks: NormalizedLandmark[],
  canvasWidth: number,
  canvasHeight: number
): Point[] {
  return landmarks.map(lm => ({
    x: lm.x * canvasWidth,
    y: lm.y * canvasHeight,
    visibility: lm.visibility ?? 1,
  }))
}

export function renderBodySilhouette(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[] | null,
  canvasWidth: number,
  canvasHeight: number,
  config: RenderConfig
): void {
  if (!landmarks || landmarks.length === 0) return

  const points = landmarksToPoints(landmarks, canvasWidth, canvasHeight)

  // Apply breathing pulse to glow
  const pulseMultiplier = 0.85 + 0.15 * Math.sin(config.breathingPhase * Math.PI * 2)
  const shadowBlur = 25 * config.glowIntensity * pulseMultiplier

  // Multi-layer glow effect
  const layers = [
    { blur: shadowBlur * 2.5, alpha: 0.15, width: config.lineWidth * 4 },
    { blur: shadowBlur * 1.8, alpha: 0.3, width: config.lineWidth * 2.5 },
    { blur: shadowBlur * 1.2, alpha: 0.5, width: config.lineWidth * 1.5 },
    { blur: shadowBlur * 0.6, alpha: 0.9, width: config.lineWidth },
  ]

  layers.forEach(layer => {
    ctx.save()
    ctx.shadowBlur = layer.blur
    ctx.shadowColor = config.glowColor
    ctx.strokeStyle = config.glowColor.replace(/[\d.]+\)$/, `${layer.alpha})`)
    ctx.lineWidth = layer.width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.beginPath()

    POSE_CONNECTIONS.forEach(([start, end]) => {
      const p1 = points[start]
      const p2 = points[end]

      // Only draw if both points are visible enough
      if (p1 && p2 && p1.visibility > 0.5 && p2.visibility > 0.5) {
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
      }
    })

    ctx.stroke()
    ctx.restore()
  })

  // Draw joint nodes
  const nodeIndices = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]

  nodeIndices.forEach(index => {
    const point = points[index]
    if (point && point.visibility > 0.5) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(point.x, point.y, 4 * pulseMultiplier, 0, Math.PI * 2)
      ctx.fillStyle = config.glowColor.replace(/[\d.]+\)$/, '0.8)')
      ctx.shadowBlur = shadowBlur
      ctx.shadowColor = config.glowColor
      ctx.fill()
      ctx.restore()
    }
  })
}

export function renderFaceMesh(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[] | null,
  canvasWidth: number,
  canvasHeight: number,
  config: RenderConfig
): void {
  if (!landmarks || landmarks.length === 0) return

  const points = landmarksToPoints(landmarks, canvasWidth, canvasHeight)

  const pulseMultiplier = 0.85 + 0.15 * Math.sin(config.breathingPhase * Math.PI * 2)
  const shadowBlur = 20 * config.glowIntensity * pulseMultiplier

  // Face oval outline
  const layers = [
    { blur: shadowBlur * 2, alpha: 0.2, width: config.lineWidth * 2.5 },
    { blur: shadowBlur * 1.3, alpha: 0.4, width: config.lineWidth * 1.5 },
    { blur: shadowBlur * 0.7, alpha: 0.8, width: config.lineWidth },
  ]

  layers.forEach(layer => {
    ctx.save()
    ctx.shadowBlur = layer.blur
    ctx.shadowColor = config.glowColor
    ctx.strokeStyle = config.glowColor.replace(/[\d.]+\)$/, `${layer.alpha})`)
    ctx.lineWidth = layer.width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Draw face oval
    ctx.beginPath()
    const validOvalPoints = FACE_OVAL_INDICES
      .map(i => points[i])
      .filter(p => p && p.visibility > 0.3)

    if (validOvalPoints.length > 2) {
      ctx.moveTo(validOvalPoints[0].x, validOvalPoints[0].y)
      for (let i = 1; i < validOvalPoints.length; i++) {
        ctx.lineTo(validOvalPoints[i].x, validOvalPoints[i].y)
      }
      ctx.closePath()
    }

    ctx.stroke()
    ctx.restore()
  })
}

export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height)
}

export function renderFullSilhouette(
  ctx: CanvasRenderingContext2D,
  poseLandmarks: NormalizedLandmark[] | null,
  faceLandmarks: NormalizedLandmark[] | null,
  canvasWidth: number,
  canvasHeight: number,
  breathingPhase: number
): void {
  clearCanvas(ctx, canvasWidth, canvasHeight)

  const config: RenderConfig = {
    glowColor: 'rgba(120, 200, 255, 1)',
    glowIntensity: 0.9,
    lineWidth: 2.5,
    breathingPhase,
  }

  // Render body first (behind face)
  renderBodySilhouette(ctx, poseLandmarks, canvasWidth, canvasHeight, config)

  // Render face mesh on top
  renderFaceMesh(ctx, faceLandmarks, canvasWidth, canvasHeight, config)
}
