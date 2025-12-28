import { useRef, RefObject } from 'react'
import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { VisionHUDOverlay } from '../../../components/VisionHUD/VisionHUDOverlay'
import { useVisionHUD } from '../../../hooks/useVisionHUD'
import { useWebcam } from '../../../hooks/useWebcam'

interface CompactCameraOverlayProps {
  videoRef: RefObject<HTMLVideoElement | null>
  landmarks: NormalizedLandmark[] | null
}

export function CompactCameraOverlay({ videoRef, landmarks }: CompactCameraOverlayProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)

  // Use local webcam and vision detection
  const { isStreaming } = useWebcam(localVideoRef)
  const { data, config } = useVisionHUD(localVideoRef, isStreaming)

  return (
    <div
      className="w-20 h-16 rounded-lg overflow-hidden relative"
      style={{
        background: 'rgba(0, 0, 0, 0.3)',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Hidden video element */}
      <video ref={localVideoRef} className="hidden" playsInline muted autoPlay />

      {/* VisionHUD Overlay - renders video + all detections */}
      <VisionHUDOverlay
        videoRef={localVideoRef}
        faceLandmarks={data.faceLandmarks}
        poseLandmarks={data.poseLandmarks}
        hands={data.hands}
        objects={data.objects}
        faceBio={data.faceBio}
        config={config}
      />

      {/* Tiny recording dot */}
      <div
        className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-red-500 recording-indicator z-10"
        style={{ boxShadow: '0 0 3px rgba(239, 68, 68, 0.6)' }}
      />
    </div>
  )
}
