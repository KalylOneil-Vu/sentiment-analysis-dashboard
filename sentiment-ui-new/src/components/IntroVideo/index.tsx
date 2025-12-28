/**
 * IntroVideo Component
 * Full-screen portrait video player for scene introductions
 */

import { useRef, useEffect, useState, useCallback } from 'react'

interface IntroVideoProps {
  videoUrl: string
  onVideoEnd: () => void
  onSkip?: () => void
  className?: string
}

export function IntroVideo({
  videoUrl,
  onVideoEnd,
  onSkip,
  className = '',
}: IntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [hasError, setHasError] = useState(false)

  // Start playing when mounted
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Reset state for new video
    setProgress(0)
    setHasError(false)
    setIsPlaying(false)

    video
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.error('[IntroVideo] Playback error:', err)
        setHasError(true)
        // Auto-skip on error after a short delay
        setTimeout(onVideoEnd, 500)
      })
  }, [videoUrl, onVideoEnd])

  // Handle video end
  const handleEnded = useCallback(() => {
    setIsPlaying(false)
    onVideoEnd()
  }, [onVideoEnd])

  // Track progress
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (video && video.duration) {
      setProgress((video.currentTime / video.duration) * 100)
    }
  }, [])

  // Handle errors
  const handleError = useCallback(() => {
    console.error('[IntroVideo] Video error, skipping')
    setHasError(true)
    onVideoEnd()
  }, [onVideoEnd])

  // Handle skip
  const handleSkip = useCallback(() => {
    const video = videoRef.current
    if (video) {
      video.pause()
    }
    onSkip?.()
  }, [onSkip])

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center ${className}`}
    >
      {/* Video container - portrait aspect ratio centered */}
      <div className="relative w-full h-full flex items-center justify-center">
        {!hasError ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="h-full max-w-full object-contain"
            style={{ aspectRatio: '9/16' }}
            playsInline
            onEnded={handleEnded}
            onTimeUpdate={handleTimeUpdate}
            onError={handleError}
          />
        ) : (
          <div className="text-white/50 text-sm">Loading...</div>
        )}
      </div>

      {/* Progress bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div
          className="h-full bg-white/80 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Skip button */}
      {onSkip && (
        <button
          onClick={handleSkip}
          className="absolute bottom-8 right-8 px-4 py-2 text-sm text-white/60 hover:text-white transition-colors backdrop-blur-sm bg-black/30 rounded-lg"
        >
          Skip
        </button>
      )}

      {/* Playing indicator */}
      {isPlaying && (
        <div className="absolute top-8 left-8 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
          <span className="text-xs text-white/60 tracking-widest uppercase">
            Playing
          </span>
        </div>
      )}
    </div>
  )
}
