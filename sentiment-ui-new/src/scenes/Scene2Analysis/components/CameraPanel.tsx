import { useRef, useEffect, RefObject } from 'react'
import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { LandmarkVisibility } from '../../../types/emotion'
import { VisionHUDOverlay } from '../../../components/VisionHUD/VisionHUDOverlay'
import { useVisionDetection } from '../../../providers/VisionDetectionProvider'
import { FloatingParticles } from '../../../components/FloatingParticles'
import { StatusBadge } from '../../../components/StatusBadge'
import { FrameCounter } from '../../../components/FrameCounter'
import { LightLeak } from '../../../components/LightLeak'

interface CameraPanelProps {
  videoRef: RefObject<HTMLVideoElement | null>
  landmarks: NormalizedLandmark[] | null
  landmarkVisibility: LandmarkVisibility
}

export function CameraPanel({
  videoRef: _videoRef, // unused, using shared vision instead
  landmarks,
  landmarkVisibility,
}: CameraPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)

  // Use shared vision detection from provider
  const {
    videoRef,
    isStreaming,
    faceLandmarks,
    poseLandmarks,
    hands,
    objects,
    faceBio,
    config,
  } = useVisionDetection()

  // Clone the video stream to local video element
  useEffect(() => {
    if (isStreaming && videoRef.current && localVideoRef.current) {
      const srcStream = videoRef.current.srcObject as MediaStream
      if (srcStream) {
        localVideoRef.current.srcObject = srcStream
        localVideoRef.current.play().catch(() => {})
      }
    }
  }, [isStreaming, videoRef])

  const faceDetected = faceLandmarks !== null && faceLandmarks.length > 0

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
        {/* Direct video feed (mirrored) */}
        <video
          ref={localVideoRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
          playsInline
          muted
          autoPlay
        />

        {/* VisionHUD Overlay - renders detections on top */}
        <VisionHUDOverlay
          videoRef={videoRef}
          faceLandmarks={faceLandmarks}
          poseLandmarks={poseLandmarks}
          hands={hands}
          objects={objects}
          faceBio={faceBio}
          config={{ ...config, showSkeleton: true }}
        />

        {/* Light leak overlay */}
        <LightLeak />

        {/* Recording indicator */}
        <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
          <div
            className="w-2.5 h-2.5 rounded-full bg-red-500 recording-indicator"
            style={{ boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)' }}
          />
        </div>

        {/* Status badge */}
        <div className="absolute top-4 right-4 z-10">
          <StatusBadge status={faceDetected ? 'locked' : 'standby'} />
        </div>

        {/* Frame counter */}
        <div className="absolute bottom-4 right-4 z-10">
          <FrameCounter />
        </div>

        {/* Scan line sweep */}
        <div className="scan-line-sweep" />

        {/* Floating particles during analysis */}
        <FloatingParticles isActive={faceDetected} />

        {/* Corner accents - white to match VisionHUD */}
        {(() => {
          const bracketClass = faceDetected ? 'bracket-locked' : 'bracket-idle'
          return (
            <>
              <div
                className={`absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 ${bracketClass} z-10`}
                style={{ borderColor: 'rgba(255, 255, 255, 0.5)' }}
              />
              <div
                className={`absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 ${bracketClass} z-10`}
                style={{ borderColor: 'rgba(255, 255, 255, 0.5)' }}
              />
              <div
                className={`absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 ${bracketClass} z-10`}
                style={{ borderColor: 'rgba(255, 255, 255, 0.5)' }}
              />
              <div
                className={`absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 ${bracketClass} z-10`}
                style={{ borderColor: 'rgba(255, 255, 255, 0.5)' }}
              />
            </>
          )
        })()}
      </div>
    </div>
  )
}
