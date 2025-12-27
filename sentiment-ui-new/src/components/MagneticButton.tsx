import { ReactNode, ButtonHTMLAttributes } from 'react'
import { useMagneticEffect } from '../hooks/useMagneticEffect'

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  strength?: number
}

export function MagneticButton({
  children,
  className = '',
  strength = 6,
  ...props
}: MagneticButtonProps) {
  const { ref, onMouseMove, onMouseLeave } = useMagneticEffect<HTMLButtonElement>({ strength })

  return (
    <button
      ref={ref}
      className={`magnetic-button ${className}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      {...props}
    >
      {children}
    </button>
  )
}
