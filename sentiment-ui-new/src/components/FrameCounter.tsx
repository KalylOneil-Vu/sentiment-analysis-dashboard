import { useFrameRate } from '../hooks/useFrameRate'

export function FrameCounter() {
  const fps = useFrameRate()

  return (
    <div className="frame-counter">
      FPS: {fps}
    </div>
  )
}
