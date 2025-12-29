import { useState, useEffect } from 'react'
import { useSharedVision } from '../../hooks/useSharedVision'
import { LightSignalNodes } from '../Scene1Welcome/components/LightSignalNodes'
import { ReplayCamera } from './components/ReplayCamera'
import { TakeawayCard } from './components/TakeawayCard'
import { ActionButtons } from './components/ActionButtons'

interface Scene5SummaryProps {
  onReplay: () => void
  onVisionHUD?: () => void
}

const CYCLE_INTERVAL = 4000 // 4 seconds

const TAKEAWAYS = [
  { text: 'You saw how AI interprets facial cues in real time.', scene: 'Analysis' },
  { text: 'You explored real-world applications across industries.', scene: 'Retail' },
  { text: 'You learned why responsible, ethical implementation is essential.', scene: 'Sensitivity' },
]

export function Scene5Summary({ onReplay, onVisionHUD }: Scene5SummaryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Use shared vision detection from provider
  const { videoRef, data } = useSharedVision({ preset: 'summary' })
  const faceLandmarks = data.faceLandmarks

  // Auto-cycle through takeaways
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % TAKEAWAYS.length)
    }, CYCLE_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  const currentTakeaway = TAKEAWAYS[currentIndex]

  return (
    <div
      className="relative w-full h-full flex items-center justify-center p-6 md:p-10 transition-colors duration-300"
      style={{
        background: `linear-gradient(to bottom, var(--bg-from), var(--bg-to))`,
      }}
    >
      {/* Video is managed by VisionDetectionProvider */}

      {/* Floating signal nodes */}
      <LightSignalNodes />

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

      {/* Main content */}
      <div
        className="relative flex flex-col max-w-4xl w-full z-10"
        style={{ maxHeight: '90vh' }}
      >
        {/* Main title */}
        <h1
          className="text-2xl md:text-3xl font-semibold mb-6 entrance-animate"
          style={{ color: 'var(--text-primary)' }}
        >
          The Face of Our Emotions
        </h1>

        {/* Two-column layout */}
        <div className="flex flex-col md:flex-row items-stretch gap-6">
          {/* Left - Camera */}
          <div className="w-full md:w-[40%]">
            <ReplayCamera
              videoRef={videoRef}
              landmarks={faceLandmarks}
              sceneLabel={currentTakeaway.scene}
            />
          </div>

          {/* Right - Content */}
          <div className="w-full md:w-[60%] flex flex-col">
            {/* Thank you message */}
            <div className="mb-4">
              <p
                className="text-[11px] tracking-[0.15em] uppercase font-medium mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Thank you for participating.
              </p>
              <p
                className="text-sm font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Here's a recap of what you experienced:
              </p>
            </div>

            {/* Takeaway card with pagination */}
            <div className="mb-6 entrance-animate entrance-delay-3">
              <TakeawayCard
                takeaways={TAKEAWAYS.map(t => t.text)}
                currentIndex={currentIndex}
              />
            </div>

            {/* Action buttons */}
            <div className="entrance-animate entrance-delay-4">
              <ActionButtons onReplay={onReplay} onVisionHUD={onVisionHUD} />
            </div>
          </div>
        </div>

        {/* Closing statement */}
        <div
          className="mt-8 pt-6 text-center entrance-animate entrance-delay-5"
          style={{ borderTop: '1px solid var(--glass-border)' }}
        >
          <p
            className="text-xs tracking-[0.2em] uppercase mb-2"
            style={{ color: 'var(--accent)' }}
          >
            Responsible Implementation
          </p>
          <p
            className="text-sm leading-relaxed max-w-lg mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Technology is only as good as its deployment. Accenture partners
            with organizations to implement AI solutions that are both
            powerful and principled.
          </p>
        </div>
      </div>

      {/* Scene indicator */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-0.5 entrance-animate entrance-delay-6">
        <span
          className="text-[10px] tracking-[0.2em] uppercase"
          style={{ color: 'var(--text-faint)' }}
        >
          Scene 05
        </span>
        <span
          className="text-[10px] tracking-[0.15em] uppercase"
          style={{ color: 'var(--accent-muted)' }}
        >
          Summary
        </span>
      </div>
    </div>
  )
}
