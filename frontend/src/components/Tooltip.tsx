import { ReactNode } from 'react'

interface TooltipProps {
  children: ReactNode
  content: string
  position?: 'top' | 'bottom'
}

export function Tooltip({ children, content, position = 'top' }: TooltipProps) {
  return (
    <div className="tooltip-wrapper">
      {children}
      <div className={`tooltip tooltip-${position}`}>{content}</div>
    </div>
  )
}
