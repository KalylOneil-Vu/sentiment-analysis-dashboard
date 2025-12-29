/**
 * ContextSlide Component
 * Full-screen informational slides for narrative context
 * Designed for executive audience - clean, editorial typography
 */

import { ReactNode } from 'react'

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
}

export function ContextSlide({
  title,
  children,
  subtitle,
  buttonText = 'Continue',
  onContinue,
}: ContextSlideProps) {
  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center p-8 md:p-16 lg:p-24"
      style={{
        background: 'linear-gradient(to bottom, var(--bg-from), var(--bg-to))',
      }}
    >
      {/* Subtle background pattern */}
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

      {/* Content container */}
      <div className="relative z-10 max-w-3xl w-full text-center">
        {/* Title */}
        <h1
          className="text-xs md:text-sm tracking-[0.3em] uppercase mb-8 md:mb-12 entrance-animate"
          style={{ color: 'var(--accent)' }}
        >
          {title}
        </h1>

        {/* Body content */}
        <div
          className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed mb-8 md:mb-12 entrance-animate entrance-delay-2"
          style={{
            color: 'var(--text-primary)',
            letterSpacing: '0.01em',
          }}
        >
          {children}
        </div>

        {/* Optional subtitle/tags */}
        {subtitle && (
          <p
            className="text-sm md:text-base tracking-[0.2em] uppercase mb-12 md:mb-16 entrance-animate entrance-delay-3"
            style={{ color: 'var(--text-muted)' }}
          >
            {subtitle}
          </p>
        )}

        {/* Continue button */}
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

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-px entrance-animate entrance-delay-5"
        style={{ background: 'var(--accent-muted)' }}
      />
    </div>
  )
}
