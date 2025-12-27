import { useRef, useState } from 'react'
import { useWebcam } from '../../hooks/useWebcam'
import { useFaceDetection } from '../../hooks/useFaceDetection'
import { useEmotionSimulation } from '../../hooks/useEmotionSimulation'
import { useSensitivityBias } from '../../hooks/useSensitivityBias'
import { LightSignalNodes } from '../Scene1Welcome/components/LightSignalNodes'
import { AmbientGradient } from '../../components/AmbientGradient'
import { SensitivityCamera } from './components/SensitivityCamera'
import { SensitivitySlider } from './components/SensitivitySlider'
import { MetricCards } from './components/MetricCards'

interface Scene4SensitivityProps {
  onContinue: () => void
}

export function Scene4Sensitivity({ onContinue }: Scene4SensitivityProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [sensitivity, setSensitivity] = useState(50)

  const { isStreaming } = useWebcam(videoRef)
  const { landmarks: faceLandmarks } = useFaceDetection(videoRef, isStreaming)

  const faceDetected = faceLandmarks !== null && faceLandmarks.length > 0
  const { currentEmotion } = useEmotionSimulation({ faceDetected })

  const metrics = useSensitivityBias({
    currentEmotion: currentEmotion.type,
    sensitivity,
    faceDetected,
  })

  return (
    <div
      className="relative w-full h-full flex items-center justify-center p-6 md:p-10 transition-colors duration-300"
      style={{
        background: `linear-gradient(to bottom, var(--bg-from), var(--bg-to))`,
      }}
    >
      {/* Hidden video */}
      <video ref={videoRef} className="hidden" playsInline muted autoPlay />

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
      <div
        className="relative flex flex-col md:flex-row items-stretch gap-6 max-w-5xl w-full z-10"
        style={{ maxHeight: '85vh' }}
      >
        {/* Left panel - Camera */}
        <div className="w-full md:w-[42%]">
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
              <SensitivityCamera videoRef={videoRef} landmarks={faceLandmarks} />
            </div>

            {/* Bottom info */}
            <div
              className="mt-4 pt-3"
              style={{ borderTop: '1px solid var(--glass-border)' }}
            >
              <p
                className="text-xs font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Responsible tuning and diverse datasets matter.
              </p>
            </div>
          </div>
        </div>

        {/* Right panel - Sensitivity controls */}
        <div className="w-full md:w-[58%]">
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
                Sensitivity Bias
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                Small adjustments can drastically change model predictions.
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                  Adjust the slider below
                </span>{' '}
                to see how bias can change outcomes.
              </p>
            </div>

            {/* Sensitivity Slider */}
            <div className="mb-6 entrance-animate entrance-delay-3">
              <SensitivitySlider value={sensitivity} onChange={setSensitivity} />
            </div>

            {/* Metric Cards */}
            <div className="flex-1 min-h-0 entrance-animate entrance-delay-4">
              <MetricCards metrics={metrics} />
            </div>

            {/* Continue button */}
            <div className="mt-6 entrance-animate entrance-delay-5">
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
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scene indicator */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-0.5 entrance-animate entrance-delay-6">
        <span
          className="text-[10px] tracking-[0.2em] uppercase"
          style={{ color: 'var(--text-faint)' }}
        >
          Scene 04
        </span>
        <span
          className="text-[10px] tracking-[0.15em] uppercase"
          style={{ color: 'var(--accent-muted)' }}
        >
          Sensitivity
        </span>
      </div>
    </div>
  )
}
