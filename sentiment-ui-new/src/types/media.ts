export interface MediaItem {
  id: string
  type: 'video' | 'image'
  src: string
  thumbnail?: string
  alt: string
  caption?: string
}

export interface MediaGalleryConfig {
  autoPlay?: boolean
  autoAdvanceInterval?: number
  loop?: boolean
  showThumbnails?: boolean
  showIndicators?: boolean
}
