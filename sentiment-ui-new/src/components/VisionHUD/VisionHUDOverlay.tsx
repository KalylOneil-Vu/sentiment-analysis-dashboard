/**
 * Vision HUD Overlay
 * Main overlay component that renders all detection visualizations on a canvas
 */

import { useEffect, useRef, RefObject } from 'react'
import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import type {
  ObjectDetection,
  FaceBio,
  HandData,
  HUDConfig,
} from '../../types/visionHUD'
import {
  FACE_OVAL_INDICES,
  LEFT_EYEBROW_INDICES,
  RIGHT_EYEBROW_INDICES,
  LEFT_EYE_INDICES,
  RIGHT_EYE_INDICES,
  LIPS_OUTER_INDICES,
  NOSE_INDICES,
  FACE_MESH_TESSELATION,
} from '../../lib/mediapipe/faceDetector'
import { HAND_CONNECTIONS } from '../../lib/mediapipe/handDetector'
import { POSE_CONNECTIONS } from '../../lib/mediapipe/poseDetector'
import { FaceBioCard } from './renderers/FaceBioCard'
import { SpeechTranscript } from './SpeechTranscript'

interface VisionHUDOverlayProps {
  videoRef: RefObject<HTMLVideoElement | null>
  // Detection data
  faceLandmarks: NormalizedLandmark[] | null
  poseLandmarks: NormalizedLandmark[] | null
  hands: HandData[]
  objects: ObjectDetection[]
  faceBio: FaceBio | null
  // Speech data
  transcript?: string
  interimTranscript?: string
  sentiment?: { sentiment: string; confidence: number } | null
  // Config
  config: HUDConfig
}

export function VisionHUDOverlay({
  videoRef,
  faceLandmarks,
  poseLandmarks,
  hands,
  objects,
  faceBio,
  transcript,
  interimTranscript,
  sentiment,
  config,
}: VisionHUDOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    const video = videoRef.current
    if (!canvas || !container || !video) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId: number
    let lastTime = 0

    const render = (time: number) => {
      // Throttle to ~30fps
      if (time - lastTime < 33) {
        rafId = requestAnimationFrame(render)
        return
      }
      lastTime = time

      // Resize canvas to match container
      const rect = container.getBoundingClientRect()
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width
        canvas.height = rect.height
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Calculate video draw dimensions (cover aspect ratio)
      let drawWidth = canvas.width
      let drawHeight = canvas.height
      let offsetX = 0
      let offsetY = 0

      if (video.readyState >= 2 && video.videoWidth > 0) {
        const videoAspect = video.videoWidth / video.videoHeight
        const canvasAspect = canvas.width / canvas.height

        if (videoAspect > canvasAspect) {
          drawHeight = canvas.height
          drawWidth = canvas.height * videoAspect
          offsetX = (canvas.width - drawWidth) / 2
        } else {
          drawWidth = canvas.width
          drawHeight = canvas.width / videoAspect
          offsetY = (canvas.height - drawHeight) / 2
        }

        // Draw mirrored video
        ctx.save()
        ctx.scale(-1, 1)
        ctx.drawImage(video, -offsetX - drawWidth, offsetY, drawWidth, drawHeight)
        ctx.restore()
      }

      // Transform functions for normalized coordinates
      const transformX = (x: number) => (1 - x) * drawWidth + offsetX
      const transformY = (y: number) => y * drawHeight + offsetY

      // Apply global opacity
      ctx.globalAlpha = config.opacity

      // Layer 1: Object bounding boxes
      if (config.modules.object && objects.length > 0) {
        renderObjects(ctx, objects, transformX, transformY, drawWidth, drawHeight, config)
      }

      // Layer 2: Pose skeleton
      if (config.modules.pose && poseLandmarks && config.showSkeleton) {
        renderPoseSkeleton(ctx, poseLandmarks, transformX, transformY)
      }

      // Layer 3: Hand skeleton + gesture
      if (config.modules.hand && hands.length > 0 && config.showSkeleton) {
        renderHands(ctx, hands, transformX, transformY, config)
      }

      // Layer 4: Face outline
      if (config.modules.face && faceLandmarks && config.showSkeleton) {
        renderFaceOutline(ctx, faceLandmarks, transformX, transformY)
      }

      ctx.globalAlpha = 1

      rafId = requestAnimationFrame(render)
    }

    rafId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [videoRef, faceLandmarks, poseLandmarks, hands, objects, config])

  // Calculate face position for bio card
  const facePosition = faceLandmarks && faceLandmarks.length > 0
    ? {
        x: (1 - faceLandmarks[10].x) * 100, // Forehead point, mirrored
        y: faceLandmarks[10].y * 100,
      }
    : null

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* Face Bio Card (rendered as React component for better styling) */}
      {config.modules.bio && config.showBioCard && faceBio && facePosition && (
        <FaceBioCard bio={faceBio} position={facePosition} />
      )}

      {/* Speech Transcript */}
      {config.modules.speech && config.showTranscript && (transcript || interimTranscript) && (
        <SpeechTranscript
          transcript={transcript || ''}
          interimTranscript={interimTranscript || ''}
          sentiment={sentiment}
        />
      )}
    </div>
  )
}

// Render object bounding boxes
function renderObjects(
  ctx: CanvasRenderingContext2D,
  objects: ObjectDetection[],
  transformX: (x: number) => number,
  transformY: (y: number) => number,
  drawWidth: number,
  drawHeight: number,
  config: HUDConfig
) {
  objects.forEach(obj => {
    const { boundingBox, label, confidence } = obj

    // Transform coordinates (mirrored)
    const x = transformX(boundingBox.x + boundingBox.width)
    const y = transformY(boundingBox.y)
    const w = boundingBox.width * drawWidth
    const h = boundingBox.height * drawHeight

    // Draw bounding box in white
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.lineWidth = 2
    ctx.shadowBlur = 4
    ctx.shadowColor = 'rgba(255, 255, 255, 0.3)'
    ctx.strokeRect(x, y, w, h)
    ctx.shadowBlur = 0

    // Draw label background
    if (config.showLabels) {
      const labelText = config.showConfidence
        ? `${label} ${Math.round(confidence * 100)}%`
        : label

      ctx.font = '11px Inter, system-ui, sans-serif'
      const textWidth = ctx.measureText(labelText).width
      const padding = 5
      const labelHeight = 18

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(x, y - labelHeight - 2, textWidth + padding * 2, labelHeight)

      ctx.fillStyle = '#ffffff'
      ctx.fillText(labelText, x + padding, y - 8)
    }
  })
}

// Render pose skeleton
function renderPoseSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  transformX: (x: number) => number,
  transformY: (y: number) => number
) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
  ctx.lineWidth = 2
  ctx.shadowBlur = 6
  ctx.shadowColor = 'rgba(255, 255, 255, 0.3)'

  // Draw connections
  POSE_CONNECTIONS.forEach(([start, end]) => {
    const startPoint = landmarks[start]
    const endPoint = landmarks[end]

    if (
      startPoint &&
      endPoint &&
      (startPoint.visibility ?? 1) > 0.5 &&
      (endPoint.visibility ?? 1) > 0.5
    ) {
      ctx.beginPath()
      ctx.moveTo(transformX(startPoint.x), transformY(startPoint.y))
      ctx.lineTo(transformX(endPoint.x), transformY(endPoint.y))
      ctx.stroke()
    }
  })

  // Draw joints
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  landmarks.forEach(point => {
    if ((point.visibility ?? 1) > 0.5) {
      ctx.beginPath()
      ctx.arc(transformX(point.x), transformY(point.y), 3, 0, Math.PI * 2)
      ctx.fill()
    }
  })

  ctx.shadowBlur = 0
}

// Render hand skeleton
function renderHands(
  ctx: CanvasRenderingContext2D,
  hands: HandData[],
  transformX: (x: number) => number,
  transformY: (y: number) => number,
  config: HUDConfig
) {
  hands.forEach(hand => {
    if (!hand.landmarks) return

    const { landmarks } = hand.landmarks

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.lineWidth = 1.5
    ctx.shadowBlur = 4
    ctx.shadowColor = 'rgba(255, 255, 255, 0.3)'

    // Draw connections
    HAND_CONNECTIONS.forEach(([start, end]) => {
      const startPoint = landmarks[start]
      const endPoint = landmarks[end]

      if (startPoint && endPoint) {
        ctx.beginPath()
        ctx.moveTo(transformX(startPoint.x), transformY(startPoint.y))
        ctx.lineTo(transformX(endPoint.x), transformY(endPoint.y))
        ctx.stroke()
      }
    })

    // Draw joints
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    landmarks.forEach(point => {
      ctx.beginPath()
      ctx.arc(transformX(point.x), transformY(point.y), 2.5, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw gesture label
    if (config.showGestureLabel && hand.gesture && hand.gesture.gesture) {
      const wrist = landmarks[0]
      const labelX = transformX(wrist.x)
      const labelY = transformY(wrist.y) + 30

      ctx.font = 'bold 12px Inter, system-ui, sans-serif'
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      const text = hand.gesture.gesture
      const textWidth = ctx.measureText(text).width
      ctx.fillRect(labelX - textWidth / 2 - 6, labelY - 12, textWidth + 12, 18)

      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.fillText(text, labelX, labelY)
      ctx.textAlign = 'left'
    }
  })

  ctx.shadowBlur = 0
}

// Helper to draw a path from indices
function drawFacePath(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  indices: number[],
  transformX: (x: number) => number,
  transformY: (y: number) => number,
  closePath: boolean = true
) {
  const points = indices.map(i => landmarks[i]).filter(Boolean)
  if (points.length === 0) return

  ctx.beginPath()
  ctx.moveTo(transformX(points[0].x), transformY(points[0].y))

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(transformX(points[i].x), transformY(points[i].y))
  }

  if (closePath) {
    ctx.closePath()
  }
  ctx.stroke()
}

// Render full face mesh with tessellation grid
function renderFaceOutline(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  transformX: (x: number) => number,
  transformY: (y: number) => number
) {
  // All white color scheme
  const meshColor = 'rgba(255, 255, 255, 0.25)'
  const outlineColor = 'rgba(255, 255, 255, 0.7)'

  // Draw the full tessellation mesh (triangular grid covering entire face)
  ctx.strokeStyle = meshColor
  ctx.lineWidth = 0.5
  ctx.shadowBlur = 0

  FACE_MESH_TESSELATION.forEach(([start, end]) => {
    const startPoint = landmarks[start]
    const endPoint = landmarks[end]

    if (startPoint && endPoint) {
      ctx.beginPath()
      ctx.moveTo(transformX(startPoint.x), transformY(startPoint.y))
      ctx.lineTo(transformX(endPoint.x), transformY(endPoint.y))
      ctx.stroke()
    }
  })

  // Draw feature outlines on top (slightly thicker, more visible)
  ctx.strokeStyle = outlineColor
  ctx.lineWidth = 1
  ctx.shadowBlur = 3
  ctx.shadowColor = 'rgba(255, 255, 255, 0.2)'

  // Face oval
  drawFacePath(ctx, landmarks, FACE_OVAL_INDICES, transformX, transformY, true)

  // Eyebrows
  drawFacePath(ctx, landmarks, LEFT_EYEBROW_INDICES, transformX, transformY, false)
  drawFacePath(ctx, landmarks, RIGHT_EYEBROW_INDICES, transformX, transformY, false)

  // Eyes
  drawFacePath(ctx, landmarks, LEFT_EYE_INDICES, transformX, transformY, true)
  drawFacePath(ctx, landmarks, RIGHT_EYE_INDICES, transformX, transformY, true)

  // Nose
  drawFacePath(ctx, landmarks, NOSE_INDICES, transformX, transformY, false)

  // Lips
  ctx.lineWidth = 1.2
  drawFacePath(ctx, landmarks, LIPS_OUTER_INDICES, transformX, transformY, true)

  // Draw iris dots
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  const leftIris = landmarks[468] || landmarks[473] || landmarks[474]
  const rightIris = landmarks[473] || landmarks[468] || landmarks[469]
  if (leftIris) {
    ctx.beginPath()
    ctx.arc(transformX(leftIris.x), transformY(leftIris.y), 2, 0, Math.PI * 2)
    ctx.fill()
  }
  if (rightIris) {
    ctx.beginPath()
    ctx.arc(transformX(rightIris.x), transformY(rightIris.y), 2, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.shadowBlur = 0
}
