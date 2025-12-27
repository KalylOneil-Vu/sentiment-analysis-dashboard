import { useRef, useEffect, useState } from 'react'
import { useWebcam } from '../../hooks/useWebcam'
import { usePoseDetection } from '../../hooks/usePoseDetection'
import { useProximityDetection } from '../../hooks/useProximityDetection'
import { useAmbientAudio } from '../../hooks/useAmbientAudio'
import { useSceneStore } from '../../stores/sceneStore'
import { PulsingGrid } from './components/PulsingGrid'
import { SilhouetteCanvas } from './components/SilhouetteCanvas'
import { SignalNodes } from './components/SignalNodes'
import { HUDOverlay } from './components/HUDOverlay'
import { ThemeToggle } from '../../components/ThemeToggle'

interface Scene0Props {
  onAdvance?: () => void
  isExiting?: boolean
}

export function Scene0AttractLoop({ onAdvance, isExiting = false }: Scene0Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [breathingPhase, setBreathingPhase] = useState(0)
  const [simulatedEmotion, setSimulatedEmotion] = useState(0)

  // Webcam hook
  const { isStreaming, error: webcamError } = useWebcam(videoRef)

  // Detection hooks - only use pose detection for Scene 0 (face detection is heavy)
  const { landmarks: poseLandmarks, isReady: isPoseReady } = usePoseDetection(
    videoRef,
    isStreaming
  )
  // Disable face detection in Scene 0 for performance
  const faceLandmarks = null
  const isFaceReady = true

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

  return (
    <div
      className="relative w-full h-full overflow-hidden cursor-pointer transition-colors duration-300"
      style={{
        background: `linear-gradient(to bottom, var(--bg-from), var(--bg-to))`,
      }}
      onClick={onAdvance}
    >
      {/* Theme toggle - top center */}
      <div
        className="absolute top-6 left-1/2 -translate-x-1/2 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <ThemeToggle />
      </div>

      {/* Hidden video element for webcam */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
        autoPlay
      />

      {/* Background grid with pulse effect */}
      <PulsingGrid intensity={0.6 + proximity.level * 0.4} />

      {/* Pose and face silhouette rendering */}
      <div
        className={`transition-opacity duration-700 ease-in-out ${isExiting ? 'opacity-0' : 'opacity-100'}`}
      >
        <SilhouetteCanvas
          poseLandmarks={poseLandmarks}
          faceLandmarks={faceLandmarks}
          breathingPhase={breathingPhase}
        />
      </div>

      {/* Floating signal nodes */}
      <SignalNodes emotionalShift={emotionalShift} isConverging={isExiting} />

      {/* HUD text overlay */}
      <div
        className={`transition-opacity duration-700 ease-in-out ${isExiting ? 'opacity-0' : 'opacity-100'}`}
      >
        <HUDOverlay
          isUserPresent={proximity.isPresent}
          isLoading={isLoading}
        />
      </div>

      {/* Webcam error display */}
      {webcamError && (
        <div className="absolute inset-x-0 bottom-20 flex justify-center">
          <div className="glass-panel px-4 py-2">
            <p className="text-xs text-slate-500 text-center">
              {webcamError}
            </p>
          </div>
        </div>
      )}

      {/* Debug info (hidden in production) */}
      {import.meta.env.DEV && (
        <div
          className="absolute bottom-6 left-6 text-[8px] space-y-0.5"
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
