/**
 * SceneWithIntro Wrapper
 * Wraps scene content with intro video functionality
 */

import { ReactNode } from 'react'
import { IntroVideo } from '../IntroVideo'
import { useSceneIntro } from '../../hooks/useSceneIntro'

interface SceneWithIntroProps {
  sceneNumber: number
  children: ReactNode
  skipVideo?: boolean
}

export function SceneWithIntro({
  sceneNumber,
  children,
  skipVideo = false,
}: SceneWithIntroProps) {
  const { phase, videoConfig, onVideoEnd, skipToContent } = useSceneIntro({
    sceneNumber,
    skipVideo,
  })

  // Show intro video if in video phase
  if (phase === 'video' && videoConfig) {
    return (
      <IntroVideo
        videoUrl={videoConfig.videoUrl}
        onVideoEnd={onVideoEnd}
        onSkip={skipToContent}
      />
    )
  }

  // Show scene content
  return <>{children}</>
}
