import { useState, useEffect, useCallback, useRef } from 'react'
import type { MediaItem, MediaGalleryConfig } from '../../types/media'
import { MediaPlayer } from './MediaPlayer'
import { ThumbnailStrip } from './ThumbnailStrip'

interface MediaGalleryProps {
  items: MediaItem[]
  config?: MediaGalleryConfig
}

const DEFAULT_CONFIG: MediaGalleryConfig = {
  autoPlay: true,
  autoAdvanceInterval: 5000,
  loop: true,
  showThumbnails: true,
  showIndicators: true,
}

export function MediaGallery({ items, config }: MediaGalleryProps) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const goToNext = useCallback(() => {
    setActiveIndex(prev => {
      if (prev >= items.length - 1) {
        return mergedConfig.loop ? 0 : prev
      }
      return prev + 1
    })
  }, [items.length, mergedConfig.loop])

  const goToPrev = useCallback(() => {
    setActiveIndex(prev => {
      if (prev <= 0) {
        return mergedConfig.loop ? items.length - 1 : prev
      }
      return prev - 1
    })
  }, [items.length, mergedConfig.loop])

  // Auto-advance timer
  useEffect(() => {
    if (!mergedConfig.autoPlay || isPaused || items.length <= 1) {
      return
    }

    timerRef.current = setInterval(() => {
      goToNext()
    }, mergedConfig.autoAdvanceInterval)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [mergedConfig.autoPlay, mergedConfig.autoAdvanceInterval, isPaused, items.length, goToNext])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNext()
      } else if (e.key === 'ArrowLeft') {
        goToPrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrev])

  // Touch swipe support
  const touchStartX = useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    setIsPaused(true)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return

    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext()
      } else {
        goToPrev()
      }
    }

    touchStartX.current = null
    // Resume after interaction
    setTimeout(() => setIsPaused(false), 2000)
  }

  const handleSelect = (index: number) => {
    setActiveIndex(index)
    setIsPaused(true)
    // Resume after interaction
    setTimeout(() => setIsPaused(false), 2000)
  }

  if (!items || items.length === 0) return null

  return (
    <div
      ref={containerRef}
      className="media-gallery w-full entrance-animate"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Featured Media */}
      <div className="relative">
        <MediaPlayer
          media={items[activeIndex]}
          isActive={true}
          onEnded={goToNext}
        />
      </div>

      {/* Thumbnails */}
      {mergedConfig.showThumbnails && items.length > 1 && (
        <ThumbnailStrip
          items={items}
          activeIndex={activeIndex}
          onSelect={handleSelect}
        />
      )}

      {/* Progress Indicators */}
      {mergedConfig.showIndicators && items.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${index === activeIndex ? 'scale-125' : 'opacity-50 hover:opacity-75'}
              `}
              style={{
                background: index === activeIndex ? 'var(--accent)' : 'var(--text-muted)',
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
