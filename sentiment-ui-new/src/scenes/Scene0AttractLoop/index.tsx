import { useEffect, useState, useRef } from 'react'
import { useProximityDetection } from '../../hooks/useProximityDetection'
import { useAmbientAudio } from '../../hooks/useAmbientAudio'
import { useSceneStore } from '../../stores/sceneStore'
import { useWebcam } from '../../hooks/useWebcam'
import { useVisionHUD } from '../../hooks/useVisionHUD'
import { VisionHUDOverlay } from '../../components/VisionHUD/VisionHUDOverlay'
import { PulsingGrid } from './components/PulsingGrid'
import { SignalNodes } from './components/SignalNodes'
import { HUDOverlay } from './components/HUDOverlay'
import { ThemeToggle } from '../../components/ThemeToggle'

interface Scene0Props {
  onAdvance?: () => void
  isExiting?: boolean
}

export function Scene0AttractLoop({ onAdvance, isExiting = false }: Scene0Props) {
  const [breathingPhase, setBreathingPhase] = useState(0)
  const [simulatedEmotion, setSimulatedEmotion] = useState(0)

  // Create local video element for this scene (same pattern as CameraPanel)
  const localVideoRef = useRef<HTMLVideoElement>(null)

  // Start local webcam
  const { isStreaming } = useWebcam(localVideoRef)

  // Run vision detection on local video
  const { data, config, isReady } = useVisionHUD(localVideoRef, isStreaming)

  const poseLandmarks = data.poseLandmarks
  const faceLandmarks = data.faceLandmarks
  const isPoseReady = isReady.pose
  const isFaceReady = isReady.face

  // Proximity detection
  const proximity = useProximityDetection(poseLandmarks, faceLandmarks)

  // Ambient audio
  useAmbientAudio(true)

  // Store actions
  const setUserPresence = useSceneStore(state => state.setUserPresence)
  const setEmotionalShift = useSceneStore(state => state.setEmotionalShift)
  const emotionalShift = useSceneStore(state => state.emotionalShift)

  // Update store with detection data
  useEffect(() => {
    setUserPresence(proximity.isPresent, proximity.level)
  }, [proximity, setUserPresence])

  // Breathing animation loop
  useEffect(() => {
    let animationId: number
    const startTime = performance.now()

    function animate(time: number) {
      const elapsed = (time - startTime) / 1000
      setBreathingPhase((elapsed / 4) % 1) // 4 second cycle
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [])

  // Simulate emotional shift based on proximity and time
  // In a real implementation, this would come from facial expression analysis
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate subtle emotional variations
      const baseEmotion = proximity.isPresent ? 0.2 : 0.05
      const variation = Math.sin(Date.now() / 3000) * 0.15
      const proximityBoost = proximity.level * 0.3

      const newEmotion = Math.min(1, Math.max(0, baseEmotion + variation + proximityBoost))
      setSimulatedEmotion(newEmotion)
      setEmotionalShift(newEmotion)
    }, 250) // Reduced frequency for performance

    return () => clearInterval(interval)
  }, [proximity, setEmotionalShift])

  const isLoading = !isPoseReady || !isFaceReady
  const [showLoading, setShowLoading] = useState(true)

  // Fade out loading screen once systems are ready
  useEffect(() => {
    if (!isLoading) {
      // Small delay for smooth transition
      const timer = setTimeout(() => setShowLoading(false), 500)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  return (
    <div
      className="relative w-full h-full overflow-hidden cursor-pointer transition-colors duration-300"
      style={{
        background: `linear-gradient(to bottom, var(--bg-from), var(--bg-to))`,
      }}
      onClick={!isLoading ? onAdvance : undefined}
    >
      {/* Hidden video element for local webcam */}
      <video ref={localVideoRef} className="hidden" playsInline muted autoPlay />

      {/* Loading overlay */}
      {showLoading && (
        <div
          className={`absolute inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-700 ${
            isLoading ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: 'linear-gradient(to bottom, var(--bg-from), var(--bg-to))',
          }}
        >
          {/* Animated loading spinner */}
          <div className="relative w-16 h-16 mb-8">
            {/* Outer ring */}
            <div
              className="absolute inset-0 rounded-full border-2 border-white/10"
            />
            {/* Spinning arc */}
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
              style={{
                borderTopColor: 'var(--accent)',
                animationDuration: '1.2s',
              }}
            />
            {/* Inner pulse */}
            <div
              className="absolute inset-3 rounded-full animate-pulse"
              style={{
                background: 'radial-gradient(circle, var(--accent-muted) 0%, transparent 70%)',
              }}
            />
          </div>

          {/* Loading text */}
          <div className="text-center space-y-3">
            <h2
              className="text-sm font-light tracking-[0.3em] uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              Initializing
            </h2>
            <div className="flex flex-col gap-2 text-[10px] tracking-[0.15em] uppercase">
              <div className="flex items-center justify-center gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    isStreaming ? 'bg-green-500' : 'bg-white/20'
                  }`}
                />
                <span style={{ color: isStreaming ? 'var(--text-muted)' : 'var(--text-faint)' }}>
                  Camera {isStreaming ? 'Active' : 'Starting...'}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    isPoseReady ? 'bg-green-500' : 'bg-white/20 animate-pulse'
                  }`}
                />
                <span style={{ color: isPoseReady ? 'var(--text-muted)' : 'var(--text-faint)' }}>
                  Pose Detection {isPoseReady ? 'Ready' : 'Loading...'}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    isFaceReady ? 'bg-green-500' : 'bg-white/20 animate-pulse'
                  }`}
                />
                <span style={{ color: isFaceReady ? 'var(--text-muted)' : 'var(--text-faint)' }}>
                  Face Detection {isFaceReady ? 'Ready' : 'Loading...'}
                </span>
              </div>
            </div>
          </div>

          {/* Subtle brand */}
          <div
            className="absolute bottom-8 text-[9px] tracking-[0.4em] uppercase"
            style={{ color: 'var(--text-faint)' }}
          >
            Sentiment Analysis
          </div>
        </div>
      )}

      {/* Background grid with pulse effect */}
      <div className="absolute inset-0 z-0">
        <PulsingGrid intensity={0.6 + proximity.level * 0.4} />
      </div>

      {/* Floating signal nodes */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <SignalNodes emotionalShift={emotionalShift} isConverging={isExiting} />
      </div>

      {/* Theme toggle - top center */}
      <div
        className="absolute top-6 left-1/2 -translate-x-1/2 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <ThemeToggle />
      </div>

      {/* VisionHUD Component - large camera panel for vertical displays */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4">
        <div
          className={`relative w-full h-[75vh] max-w-[90vw] rounded-2xl overflow-hidden transition-all duration-700 ease-in-out ${
            isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: `
              0 0 80px rgba(0, 0, 0, 0.6),
              0 0 40px rgba(255, 255, 255, 0.03),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
          }}
        >
          {/* VisionHUD Overlay */}
          <VisionHUDOverlay
            videoRef={localVideoRef}
            faceLandmarks={data.faceLandmarks}
            poseLandmarks={data.poseLandmarks}
            hands={data.hands}
            objects={data.objects}
            faceBio={data.faceBio}
            config={config}
          />

          {/* Corner brackets */}
          <div className="absolute inset-3 pointer-events-none">
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/50" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/50" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/50" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/50" />
          </div>

          {/* Recording indicator */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"
                 style={{ boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)' }} />
            <span className="text-[10px] text-white/70 font-medium tracking-wider">LIVE</span>
          </div>

          {/* Status label */}
          <div className="absolute top-3 right-3">
            <div
              className="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wider"
              style={{
                background: proximity.isPresent ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                color: proximity.isPresent ? '#22c55e' : 'rgba(255, 255, 255, 0.5)',
                border: `1px solid ${proximity.isPresent ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
              }}
            >
              {proximity.isPresent ? 'DETECTED' : 'SCANNING'}
            </div>
          </div>
        </div>

        {/* Label below camera */}
        <div className="mt-4 text-center">
          <div className="text-[10px] text-white/40 tracking-[0.4em] uppercase">
            Vision Analysis
          </div>
        </div>
      </div>

      {/* HUD text overlay */}
      <div
        className={`absolute inset-0 z-30 pointer-events-none transition-opacity duration-700 ease-in-out ${isExiting ? 'opacity-0' : 'opacity-100'}`}
      >
        <HUDOverlay
          isUserPresent={proximity.isPresent}
          isLoading={isLoading}
        />
      </div>

      {/* Debug info (hidden in production) */}
      {import.meta.env.DEV && (
        <div
          className="absolute bottom-6 left-6 z-40 text-[8px] space-y-0.5"
          style={{ color: 'var(--text-faint)', opacity: 0.5 }}
        >
          <div>Streaming: {isStreaming ? 'YES' : 'NO'}</div>
          <div>Pose: {isPoseReady ? 'READY' : 'LOADING'}</div>
          <div>Face: {isFaceReady ? 'READY' : 'LOADING'}</div>
          <div>Proximity: {(proximity.level * 100).toFixed(0)}%</div>
          <div>Emotion: {(simulatedEmotion * 100).toFixed(0)}%</div>
        </div>
      )}
    </div>
  )
}
