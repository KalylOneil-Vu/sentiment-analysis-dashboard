import { useRef, RefObject } from 'react'
import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { VisionHUDOverlay } from '../../../components/VisionHUD/VisionHUDOverlay'
import { useVisionHUD } from '../../../hooks/useVisionHUD'
import { useWebcam } from '../../../hooks/useWebcam'

interface SensitivityCameraProps {
  videoRef: RefObject<HTMLVideoElement | null>
  landmarks: NormalizedLandmark[] | null
}

export function SensitivityCamera({ videoRef: _videoRef, landmarks: _landmarks }: SensitivityCameraProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)

  // Use local webcam and vision detection
  const { isStreaming } = useWebcam(localVideoRef)
  const { data, config } = useVisionHUD(localVideoRef, isStreaming)

  return (
    <div
      className="relative w-full aspect-[3/4] rounded-xl overflow-hidden"
      style={{
        background: 'rgba(241, 245, 249, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
      }}
    >
      {/* Hidden video element */}
      <video ref={localVideoRef} className="hidden" playsInline muted autoPlay />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none z-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(100, 116, 139, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100, 116, 139, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '25% 20%',
        }}
      />

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

      {/* Recording indicator */}
      <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
        <div
          className="w-2.5 h-2.5 rounded-full bg-red-500 recording-indicator"
          style={{ boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)' }}
        />
      </div>

      {/* Corner accents - white to match VisionHUD */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/50 z-10" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/50 z-10" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/50 z-10" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/50 z-10" />
    </div>
  )
}
