/**
 * ContextSlide Component
 * Full-screen informational slides for narrative context
 * Designed for executive audience - clean, editorial typography
 *
 * Portrait layout: Video (top) → Text (middle) → Image Grid (bottom)
 * Landscape layout: Text only (centered)
 */

import { ReactNode, useRef, useEffect, useState } from 'react'
import { useIsPortrait } from '../../hooks/useIsPortrait'

interface ContextSlideProps {
  /** Main headline/title */
  title: string
  /** Body content - can be string or JSX for formatted text */
  children: ReactNode
  /** Optional subtitle or sector tags */
  subtitle?: string
  /** Button text */
  buttonText?: string
  /** Called when user clicks continue */
  onContinue: () => void
  /** Featured video URL for top section (portrait only) */
  featuredVideo?: string
  /** Number of placeholder boxes for bottom grid (portrait only) */
  placeholderCount?: number
  /** Gallery videos for bottom grid (portrait only) - can be string or object with src, scale, and position */
  galleryVideos?: (string | { src: string; scale?: number; position?: string })[]
}


export function ContextSlide({
  title,
  children,
  subtitle,
  buttonText = 'Continue',
  onContinue,
  featuredVideo,
  placeholderCount: _placeholderCount = 3,
  galleryVideos = [],
}: ContextSlideProps) {
  const isPortrait = useIsPortrait()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [galleryLoaded, setGalleryLoaded] = useState<boolean[]>(Array(6).fill(false))

  const handleGalleryLoaded = (index: number) => {
    setGalleryLoaded(prev => {
      const next = [...prev]
      next[index] = true
      return next
    })
  }

  useEffect(() => {
    if (videoRef.current && featuredVideo) {
      videoRef.current.play().catch(() => {})
    }
  }, [featuredVideo])

  const showPortraitLayout = isPortrait && featuredVideo

  // Landscape or no video: centered text layout
  if (!showPortraitLayout) {
    return (
      <div
        className="relative w-full h-full flex flex-col items-center justify-center p-8 md:p-16 lg:p-24"
        style={{
          background: 'linear-gradient(to bottom, var(--bg-from), var(--bg-to))',
        }}
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(var(--grid-line) 1px, transparent 1px),
              linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        <div className="relative z-10 max-w-3xl w-full text-center">
          <h1
            className="text-xs md:text-sm tracking-[0.3em] uppercase mb-8 md:mb-12 entrance-animate"
            style={{ color: 'var(--accent)' }}
          >
            {title}
          </h1>

          <div
            className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed mb-8 md:mb-12 entrance-animate entrance-delay-2"
            style={{ color: 'var(--text-primary)', letterSpacing: '0.01em' }}
          >
            {children}
          </div>

          {subtitle && (
            <p
              className="text-sm md:text-base tracking-[0.2em] uppercase mb-12 md:mb-16 entrance-animate entrance-delay-3"
              style={{ color: 'var(--text-muted)' }}
            >
              {subtitle}
            </p>
          )}

          <button
            onClick={onContinue}
            className="entrance-animate entrance-delay-4 px-8 py-3 rounded-full text-sm tracking-[0.15em] uppercase transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
            }}
          >
            {buttonText}
          </button>
        </div>

        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-px entrance-animate entrance-delay-5"
          style={{ background: 'var(--accent-muted)' }}
        />
      </div>
    )
  }

  // Portrait layout: Video (top) → Text (middle) → Grid (bottom)
  // Proportional for kiosk: 30% video, 40% text area, 30% gallery
  return (
    <div
      className="relative w-full h-full flex flex-col"
      style={{
        background: 'linear-gradient(to bottom, var(--bg-from), var(--bg-to))',
      }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Featured Video - Top (30vh) */}
      <div className="relative z-10 w-full p-4 pb-0 entrance-animate" style={{ height: '30vh' }}>
        <div
          className="w-full h-full rounded-xl overflow-hidden relative"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          }}
        >
          <video
            ref={videoRef}
            src={featuredVideo}
            className="w-full h-full object-cover absolute inset-0"
            style={{
              opacity: videoLoaded ? 1 : 0,
              transition: 'opacity 500ms ease',
              objectPosition: 'center 37%',
            }}
            playsInline
            muted
            loop
            onLoadedData={() => setVideoLoaded(true)}
          />
        </div>
      </div>

      {/* Text Content - Middle (40vh, centered) */}
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center px-8"
        style={{ height: '40vh' }}
      >
        <h1
          className="text-base tracking-[0.3em] uppercase mb-8 entrance-animate entrance-delay-1"
          style={{ color: 'var(--accent)' }}
        >
          {title}
        </h1>

        <div
          className="text-3xl font-light leading-relaxed mb-8 max-w-2xl entrance-animate entrance-delay-2"
          style={{ color: 'var(--text-primary)', letterSpacing: '0.01em' }}
        >
          {children}
        </div>

        {subtitle && (
          <p
            className="text-base tracking-[0.2em] uppercase mb-8 entrance-animate entrance-delay-3"
            style={{ color: 'var(--text-muted)' }}
          >
            {subtitle}
          </p>
        )}

        <button
          onClick={onContinue}
          className="px-10 py-4 rounded-full text-base tracking-[0.15em] uppercase transition-all duration-300 hover:scale-[1.02] entrance-animate entrance-delay-4"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-primary)',
          }}
        >
          {buttonText}
        </button>
      </div>

      {/* Video/Image Gallery - Bottom (30vh, 2x3 grid) */}
      <div
        className="relative z-10 w-full p-4 pt-0 entrance-animate entrance-delay-3"
        style={{ height: '30vh' }}
      >
        <div className="grid grid-cols-3 gap-3 h-full">
          {Array.from({ length: 6 }).map((_, index) => {
            const videoItem = galleryVideos[index]
            const videoSrc = typeof videoItem === 'string' ? videoItem : videoItem?.src
            const videoScale = typeof videoItem === 'object' ? videoItem?.scale : undefined
            const videoPosition = typeof videoItem === 'object' ? videoItem?.position : undefined
            return (
              <div
                key={index}
                className="rounded-lg overflow-hidden relative"
                style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid var(--glass-border)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                }}
              >
                {videoSrc ? (
                  <video
                    src={videoSrc}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      opacity: galleryLoaded[index] ? 1 : 0,
                      transition: 'opacity 500ms ease',
                      ...(videoScale && { transform: `scale(${videoScale})` }),
                      ...(videoPosition && { objectPosition: videoPosition }),
                    }}
                    playsInline
                    muted
                    loop
                    autoPlay
                    onLoadedData={() => handleGalleryLoaded(index)}
                  />
                ) : (
                  <>
                    {/* Placeholder with subtle gradient overlay */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg,
                          rgba(100, 120, 140, 0.3) 0%,
                          rgba(60, 80, 100, 0.5) 100%)`,
                      }}
                    />
                    {/* Simulated face silhouette placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                      <div
                        className="w-1/2 h-2/3 rounded-full"
                        style={{
                          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, transparent 70%)',
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
