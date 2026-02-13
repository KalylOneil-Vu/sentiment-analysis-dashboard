import { useState, useEffect } from 'react'
import { useSharedVision } from '../../hooks/useSharedVision'
import { useUnifiedEmotion } from '../../hooks/useUnifiedEmotion'
import { useBackendAnalysis } from '../../hooks/useBackendAnalysis'
import { useFastVLM } from '../../hooks/useFastVLM'
import { useStressMonitoring } from '../../hooks/useStressMonitoring'
import { useSceneStore } from '../../stores/sceneStore'
import { mapBackendEmotion } from '../../types/backend'
import { LightSignalNodes } from '../Scene1Welcome/components/LightSignalNodes'
import { AmbientGradient } from '../../components/AmbientGradient'
import { ScenarioDisplay } from './components/ScenarioDisplay'
import { ScenarioGrid } from './components/ScenarioGrid'
import { SCENARIOS } from '../../data/scenarios'

interface Scene3cHighStressProps {
  onContinue: () => void
}

export function Scene3cHighStress({ onContinue }: Scene3cHighStressProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const setBackendEngagement = useSceneStore(state => state.setBackendEngagement)

  // Use shared vision detection from provider
  const { videoRef, isStreaming, data } = useSharedVision({ preset: 'stress' })
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

  // Use unified emotion (prioritizes face-api, then backend, then simulated)
  const { emotion: currentEmotion, faceDetected } = useUnifiedEmotion()

  const stressData = useStressMonitoring({
    currentEmotion: currentEmotion.type,
    faceDetected,
  })

  const selectedScenario = SCENARIOS[selectedIndex]

  return (
    <div
      className="scene-container scene-scrollable relative w-full h-full flex items-center justify-center p-3 md:p-6 lg:p-10 transition-colors duration-300 overflow-y-auto"
      style={{
        background: `linear-gradient(to bottom, var(--bg-from), var(--bg-to))`,
      }}
    >
      {/* Video is managed by VisionDetectionProvider */}

      {/* Floating signal nodes */}
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
      <div className="panel-layout aspect-flex relative flex flex-col md:flex-row items-stretch gap-3 md:gap-6 max-w-5xl w-full z-10">
        {/* Left panel - Scenario display */}
        <div className="w-full md:w-[45%]">
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

            {/* Scenario display with camera and stress bar */}
            <div className="flex-1 min-h-0">
              <ScenarioDisplay
                scenario={selectedScenario}
                videoRef={videoRef}
                landmarks={faceLandmarks}
                stressData={stressData}
              />
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
                Emotion-aware systems help maintain performance and reduce burnout in critical
                roles.
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

        {/* Right panel - Scenario selector */}
        <div className="w-full md:w-[55%]">
          <div
            className="h-full p-5 rounded-2xl flex flex-col"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--glass-border)',
            }}
          >
            {/* Header */}
            <div className="mb-4">
              <h3
                className="text-xl font-semibold mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                High Stress Roles
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                Emotion-aware systems help maintain performance and reduce burnout in critical
                roles.
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                  Select the different scenarios
                </span>{' '}
                to monitor stress in real time.
              </p>
            </div>

            {/* Scenario grid */}
            <div className="flex-1 min-h-0 entrance-animate entrance-delay-3">
              <ScenarioGrid
                scenarios={SCENARIOS}
                selectedIndex={selectedIndex}
                onSelectScenario={setSelectedIndex}
              />
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
      <div className="scene-indicator absolute top-6 right-6 flex flex-col items-end gap-0.5 entrance-animate entrance-delay-5">
        <span
          className="text-[10px] tracking-[0.2em] uppercase"
          style={{ color: 'var(--text-faint)' }}
        >
          Scene 3c
        </span>
        <span
          className="text-[10px] tracking-[0.15em] uppercase"
          style={{ color: 'var(--accent-muted)' }}
        >
          High Stress
        </span>
      </div>
    </div>
  )
}
