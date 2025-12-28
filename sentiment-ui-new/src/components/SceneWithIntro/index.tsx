/**
 * SceneWithIntro Wrapper
 * Wraps scene content with intro video functionality
 * Preloads scene resources while video plays for instant transitions
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

  // During video phase: show video AND preload scene content (hidden)
  if (phase === 'video' && videoConfig) {
    return (
      <>
        <IntroVideo
          videoUrl={videoConfig.videoUrl}
          onVideoEnd={onVideoEnd}
          onSkip={skipToContent}
        />
        {/* Preload scene content while video plays (hidden but mounted) */}
        <div
          className="fixed inset-0 opacity-0 pointer-events-none"
          style={{ visibility: 'hidden', zIndex: -1 }}
          aria-hidden="true"
        >
          {children}
        </div>
      </>
    )
  }

  // Show scene content
  return <>{children}</>
}
