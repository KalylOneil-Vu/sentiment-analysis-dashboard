import { useRef, RefObject } from 'react'
import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { VisionHUDOverlay } from '../../../components/VisionHUD/VisionHUDOverlay'
import { useVisionHUD } from '../../../hooks/useVisionHUD'
import { useWebcam } from '../../../hooks/useWebcam'
import { MatchResult } from '../../../types/product'

interface CompactCameraProps {
  videoRef: RefObject<HTMLVideoElement | null>
  landmarks: NormalizedLandmark[] | null
  matchResult: MatchResult
  isAutoAdvancing: boolean
}

export function CompactCamera({
  videoRef,
  landmarks,
  matchResult,
  isAutoAdvancing,
}: CompactCameraProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)

  // Use local webcam and vision detection
  const { isStreaming } = useWebcam(localVideoRef)
  const { data, config } = useVisionHUD(localVideoRef, isStreaming)

  const getMatchColor = () => {
    if (matchResult.score >= 70) return '#22c55e'
    if (matchResult.score >= 50) return '#eab308'
    return '#ef4444'
  }

  return (
    <div
      className="flex items-center gap-4 p-3 rounded-xl"
      style={{
        background: 'rgba(255, 255, 255, 0.6)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
      }}
    >
      {/* Hidden video element */}
      <video ref={localVideoRef} className="hidden" playsInline muted autoPlay />

      {/* Small camera with VisionHUD overlay - 4:3 aspect ratio */}
      <div
        className="relative w-24 rounded-lg overflow-hidden flex-shrink-0"
        style={{
          aspectRatio: '4/3',
          background: 'rgba(241, 245, 249, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
        }}
      >
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
          className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-red-500 recording-indicator z-10"
          style={{ boxShadow: '0 0 4px rgba(239, 68, 68, 0.6)' }}
        />
      </div>

      {/* Match info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-xl font-bold"
            style={{ color: getMatchColor() }}
          >
            {matchResult.score}%
          </span>
          <span className="text-xl font-medium text-slate-600">Match</span>
        </div>
        <p className="text-base text-slate-500 leading-tight mt-1">
          {matchResult.label}
        </p>
        {isAutoAdvancing && (
          <p className="text-sm text-amber-600 mt-1 animate-pulse">
            Auto-advancing...
          </p>
        )}
      </div>
    </div>
  )
}
