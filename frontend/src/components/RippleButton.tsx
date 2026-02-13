import { ReactNode, ButtonHTMLAttributes } from 'react'
import { useRipple } from '../hooks/useRipple'

interface RippleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function RippleButton({ children, className = '', onClick, ...props }: RippleButtonProps) {
  const { createRipple, rippleElements } = useRipple()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(e)
    onClick?.(e)
  }

  return (
    <button
      className={`ripple-container ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
      {rippleElements}
    </button>
  )
}
