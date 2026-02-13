import { useRef, useEffect, useState } from 'react'
import type { MediaItem } from '../../types/media'

interface MediaPlayerProps {
  media: MediaItem
  isActive: boolean
  onEnded?: () => void
}

export function MediaPlayer({ media, isActive, onEnded }: MediaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!videoRef.current || media.type !== 'video') return

    if (isActive) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked, that's okay
      })
    } else {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [isActive, media.type])

  const handleLoadedData = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
  }

  return (
    <div
      className="relative w-full aspect-video rounded-xl overflow-hidden gallery-item-enter"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      }}
    >
      {media.type === 'video' ? (
        <video
          ref={videoRef}
          src={media.src}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          playsInline
          muted
          loop
          onLoadedData={handleLoadedData}
          onError={handleError}
          onEnded={onEnded}
        />
      ) : (
        <img
          src={media.src}
          alt={media.alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoadedData}
          onError={handleError}
        />
      )}

      {/* Loading state */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{
              borderColor: 'var(--accent)',
              borderTopColor: 'transparent',
            }}
          />
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ color: 'var(--text-muted)' }} className="text-sm">
            Failed to load media
          </span>
        </div>
      )}

      {/* Caption overlay */}
      {media.caption && isLoaded && (
        <div
          className="absolute bottom-0 left-0 right-0 p-3 text-sm"
          style={{
            background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
            color: 'white',
          }}
        >
          {media.caption}
        </div>
      )}
    </div>
  )
}
