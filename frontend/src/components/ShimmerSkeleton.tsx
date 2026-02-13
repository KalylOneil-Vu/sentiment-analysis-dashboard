interface ShimmerSkeletonProps {
  width?: string
  height?: string
  rounded?: boolean
  className?: string
}

export function ShimmerSkeleton({
  width = '100%',
  height = '100%',
  rounded = false,
  className = '',
}: ShimmerSkeletonProps) {
  return (
    <div
      className={`shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius: rounded ? '9999px' : '12px',
      }}
    />
  )
}
