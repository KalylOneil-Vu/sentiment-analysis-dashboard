import type { MediaItem } from '../../types/media'

interface ThumbnailStripProps {
  items: MediaItem[]
  activeIndex: number
  onSelect: (index: number) => void
}

export function ThumbnailStrip({ items, activeIndex, onSelect }: ThumbnailStripProps) {
  if (items.length <= 1) return null

  return (
    <div className="flex justify-center gap-2 mt-4 overflow-x-auto px-2">
      {items.map((item, index) => {
        const isSelected = index === activeIndex
        const thumbnailSrc = item.thumbnail || item.src

        return (
          <button
            key={item.id}
            onClick={() => onSelect(index)}
            className={`
              relative flex-shrink-0 w-16 h-10 rounded-lg overflow-hidden
              transition-all duration-200 entrance-animate
              ${isSelected ? 'ring-2 ring-offset-2 scale-105' : 'opacity-70 hover:opacity-100'}
            `}
            style={{
              animationDelay: `${index * 50}ms`,
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              ringColor: isSelected ? 'var(--accent)' : undefined,
              ringOffsetColor: 'var(--bg-to)',
            }}
            aria-label={`View ${item.alt}`}
          >
            {item.type === 'video' ? (
              <video
                src={thumbnailSrc}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
            ) : (
              <img
                src={thumbnailSrc}
                alt={item.alt}
                className="w-full h-full object-cover"
              />
            )}

            {/* Selection indicator */}
            {isSelected && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: `inset 0 0 0 2px var(--accent)`,
                }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
