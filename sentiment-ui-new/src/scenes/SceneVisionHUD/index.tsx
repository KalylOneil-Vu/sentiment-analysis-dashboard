/**
 * Scene Vision HUD
 * Full-featured vision analysis HUD with all detection modules
 */

import { useRef } from 'react'
import { useWebcam } from '../../hooks/useWebcam'
import { useVisionHUD } from '../../hooks/useVisionHUD'
import { VisionHUDOverlay } from '../../components/VisionHUD/VisionHUDOverlay'
import { HUDControls } from './components/HUDControls'
import { HUDStatusBar } from './components/HUDStatusBar'
import { LightSignalNodes } from '../Scene1Welcome/components/LightSignalNodes'

interface SceneVisionHUDProps {
  onBack?: () => void
}

export function SceneVisionHUD({ onBack }: SceneVisionHUDProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  const { isStreaming } = useWebcam(videoRef)

  const {
    data,
    transcript,
    interimTranscript,
    sentiment,
    isReady,
    config,
    updateConfig,
    toggleModule,
  } = useVisionHUD(videoRef, isStreaming)

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, var(--bg-from), var(--bg-to))',
      }}
    >
      {/* Hidden video element */}
      <video ref={videoRef} className="hidden" playsInline muted autoPlay />

      {/* Background effects */}
      <LightSignalNodes />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(var(--grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Main video canvas container */}
      <div className="absolute inset-4 md:inset-8 rounded-2xl overflow-hidden">
        <div
          className="w-full h-full rounded-2xl overflow-hidden relative"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--glass-border)',
          }}
        >
          {/* VisionHUD Overlay - renders video + all detections */}
          <VisionHUDOverlay
            videoRef={videoRef}
            faceLandmarks={data.faceLandmarks}
            poseLandmarks={data.poseLandmarks}
            hands={data.hands}
            objects={data.objects}
            faceBio={data.faceBio}
            transcript={transcript}
            interimTranscript={interimTranscript}
            sentiment={sentiment}
            config={config}
          />
        </div>
      </div>

      {/* Status bar */}
      <HUDStatusBar isReady={isReady} />

      {/* Module controls */}
      <HUDControls
        config={config}
        updateConfig={updateConfig}
        toggleModule={toggleModule}
      />

      {/* Header */}
      <div className="absolute top-6 left-6 z-10">
        <h1
          className="text-xl font-semibold mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          Vision HUD
        </h1>
        <p
          className="text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          Real-time multi-modal detection
        </p>
      </div>

      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 right-6 z-10 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
          style={{
            background: 'var(--glass-bg-strong)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-primary)',
          }}
        >
          ← Back
        </button>
      )}

      {/* Scene indicator */}
      <div className="absolute bottom-6 right-6 flex flex-col items-end gap-0.5">
        <span
          className="text-[10px] tracking-[0.2em] uppercase"
          style={{ color: 'var(--text-faint)' }}
        >
          Vision HUD
        </span>
        <span
          className="text-[10px] tracking-[0.15em] uppercase"
          style={{ color: 'var(--accent-muted)' }}
        >
          Multi-Modal Detection
        </span>
      </div>
    </div>
  )
}
