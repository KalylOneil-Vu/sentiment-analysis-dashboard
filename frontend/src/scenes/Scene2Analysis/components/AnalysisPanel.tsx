import { EmotionState, LandmarkVisibility } from '../../../types/emotion'
import { EmotionDisplay } from './EmotionDisplay'
import { FocusScore } from './FocusScore'
import { LandmarkToggle } from './LandmarkToggle'
import { BottomInfo } from './BottomInfo'

interface AnalysisPanelProps {
  emotion: EmotionState
  focusScore: number
  landmarkVisibility: LandmarkVisibility
  onLandmarkToggle: (key: keyof LandmarkVisibility) => void
  onContinue: () => void
  hideContinueButton?: boolean
  hideBottomInfo?: boolean
}

export function AnalysisPanel({
  emotion,
  focusScore,
  landmarkVisibility,
  onLandmarkToggle,
  onContinue,
  hideContinueButton = false,
  hideBottomInfo = false,
}: AnalysisPanelProps) {
  return (
    <div className="flex flex-col flex-1 h-full">
      {/* Content sections */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="entrance-animate entrance-delay-3">
          <EmotionDisplay emotion={emotion} />
        </div>

        <div className="entrance-animate entrance-delay-4">
          <FocusScore score={focusScore} />
        </div>

        <div className="entrance-animate entrance-delay-5">
          <LandmarkToggle
            visibility={landmarkVisibility}
            onToggle={onLandmarkToggle}
          />
        </div>
      </div>

      {/* Continue button */}
      {!hideContinueButton && (
        <div className="mt-4 entrance-animate entrance-delay-6">
          <button
            onClick={onContinue}
            className="w-full py-2.5 rounded-full text-sm font-medium tracking-[0.15em] uppercase transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(20, 184, 166, 0.6)',
              color: '#334155',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            }}
          >
            Continue
          </button>
        </div>
      )}

      {/* Bottom info */}
      {!hideBottomInfo && (
        <div className="mt-4 entrance-animate entrance-delay-7">
          <BottomInfo />
        </div>
      )}
    </div>
  )
}
