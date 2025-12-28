import { useEffect } from 'react'
import { useSharedVision } from '../../hooks/useSharedVision'
import { useEmotionSimulation } from '../../hooks/useEmotionSimulation'
import { useBackendAnalysis } from '../../hooks/useBackendAnalysis'
import { useFastVLM } from '../../hooks/useFastVLM'
import { useHealthcareSignals } from '../../hooks/useHealthcareSignals'
import { useSceneStore } from '../../stores/sceneStore'
import { mapBackendEmotion } from '../../types/backend'
import { LightSignalNodes } from '../Scene1Welcome/components/LightSignalNodes'
import { AmbientGradient } from '../../components/AmbientGradient'
import { HealthcareCamera } from './components/HealthcareCamera'
import { SignalBars } from './components/SignalBars'

interface Scene3bHealthcareProps {
  onContinue: () => void
}

export function Scene3bHealthcare({ onContinue }: Scene3bHealthcareProps) {
  const setBackendEngagement = useSceneStore(state => state.setBackendEngagement)

  // Use shared vision detection from provider
  const { videoRef, isStreaming, data } = useSharedVision({ preset: 'healthcare' })
  const faceLandmarks = data.faceLandmarks

  // FastVLM analysis - runs real-time inference on video frames
  const { currentAnalysis: fastvlmAnalysis } = useFastVLM({
    videoRef,
    enabled: isStreaming,
  })

  // Backend analysis - captures frames and sends to backend with FastVLM data
  const { engagement } = useBackendAnalysis({
    videoRef,
    enabled: isStreaming,
    captureInterval: 5000,
    fastvlmAnalysis,
  })

  // Sync backend engagement to store when it updates
  useEffect(() => {
    if (engagement) {
      const emotion = engagement.persons?.[0]?.details?.dominant_emotion
        ? mapBackendEmotion(engagement.persons[0].details.dominant_emotion)
        : null
      setBackendEngagement(engagement, emotion)
    }
  }, [engagement, setBackendEngagement])

  const faceDetected = faceLandmarks !== null && faceLandmarks.length > 0
  const { currentEmotion } = useEmotionSimulation({ faceDetected })

  const signals = useHealthcareSignals({
    currentEmotion: currentEmotion.type,
    faceDetected,
  })

  return (
    <div
      className="relative w-full h-full flex items-center justify-center p-6 md:p-10 transition-colors duration-300"
      style={{
        background: `linear-gradient(to bottom, var(--bg-from), var(--bg-to))`,
      }}
    >
      {/* Video is managed by VisionDetectionProvider */}

      {/* Floating signal nodes - light theme */}
      <LightSignalNodes />

      {/* Ambient gradient based on emotion */}
      <AmbientGradient emotion={currentEmotion.type} />

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

      {/* Main two-panel layout */}
      <div
        className="relative flex flex-col md:flex-row items-stretch gap-6 max-w-5xl w-full z-10"
        style={{ maxHeight: '85vh' }}
      >
        {/* Left panel - Camera */}
        <div className="w-full md:w-[38%]">
          <div
            className="h-full p-5 rounded-2xl flex flex-col"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              The Face of Our Emotions
            </h2>

            {/* Camera display */}
            <div className="flex-1 min-h-0">
              <HealthcareCamera videoRef={videoRef} landmarks={faceLandmarks} />
            </div>

            {/* Bottom info */}
            <div
              className="mt-4 pt-3"
              style={{ borderTop: '1px solid var(--glass-border)' }}
            >
              <p
                className="text-[10px] leading-relaxed"
                style={{ color: 'var(--text-muted)' }}
              >
                AI can flag potential changes in patient condition, helping clinicians respond
                faster.
              </p>
              <button
                className="mt-1.5 text-[9px] tracking-[0.12em] uppercase transition-colors"
                style={{ color: 'var(--accent)' }}
              >
                Learn More About Accenture's POV
              </button>
            </div>
          </div>
        </div>

        {/* Right panel - Healthcare signals */}
        <div className="w-full md:w-[62%]">
          <div
            className="h-full p-5 rounded-2xl flex flex-col"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--glass-border)',
            }}
          >
            {/* Healthcare header */}
            <div className="mb-6">
              <h3
                className="text-xl font-semibold mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                Healthcare
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                Change your expression to watch how the signals react in real time.
              </p>
            </div>

            {/* Signal bars */}
            <div className="flex-1 min-h-0 entrance-animate entrance-delay-3">
              <SignalBars signals={signals} />
            </div>

            {/* Continue button */}
            <div className="mt-6 entrance-animate entrance-delay-4">
              <button
                onClick={onContinue}
                className="w-full py-2.5 rounded-full text-sm font-medium tracking-[0.12em] uppercase transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                style={{
                  background: 'var(--glass-bg-strong)',
                  backdropFilter: 'blur(10px)',
                  border: '1.5px solid var(--accent-muted)',
                  color: 'var(--text-primary)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                }}
              >
                Continue to Next Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scene indicator */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-0.5 entrance-animate entrance-delay-5">
        <span
          className="text-[10px] tracking-[0.2em] uppercase"
          style={{ color: 'var(--text-faint)' }}
        >
          Scene 3b
        </span>
        <span
          className="text-[10px] tracking-[0.15em] uppercase"
          style={{ color: 'var(--accent-muted)' }}
        >
          Healthcare
        </span>
      </div>
    </div>
  )
}
