import { RefObject } from 'react'
import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { Scenario, StressMonitoringResult } from '../../../types/scenario'
import { CompactCameraOverlay } from './CompactCameraOverlay'
import { StressBar } from './StressBar'

interface ScenarioDisplayProps {
  scenario: Scenario
  videoRef: RefObject<HTMLVideoElement | null>
  landmarks: NormalizedLandmark[] | null
  stressData: StressMonitoringResult
}

export function ScenarioDisplay({
  scenario,
  videoRef,
  landmarks,
  stressData,
}: ScenarioDisplayProps) {
  return (
    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
      {/* Scenario background */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: scenario.bgGradient }}
      >
        {/* Scenario icon */}
        <span className="text-6xl opacity-30">{scenario.icon}</span>

        {/* Scenario name overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white text-sm font-medium tracking-wide">
            {scenario.name}
          </p>
        </div>
      </div>

      {/* Camera overlay - bottom left */}
      <div className="absolute bottom-4 left-4">
        <CompactCameraOverlay videoRef={videoRef} landmarks={landmarks} />
      </div>

      {/* Stress bar overlay - bottom area */}
      <div
        className="absolute bottom-4 left-28 right-4 p-3 rounded-lg"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <StressBar stressData={stressData} />
      </div>
    </div>
  )
}
