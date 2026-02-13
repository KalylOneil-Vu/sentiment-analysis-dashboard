import { useThemeStore } from '../stores/themeStore'
import { Tooltip } from './Tooltip'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const isDarkMode = useThemeStore(state => state.isDarkMode)
  const toggleTheme = useThemeStore(state => state.toggleTheme)

  return (
    <Tooltip content={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'} position="bottom">
      <button
      onClick={toggleTheme}
      className={`flex items-center gap-1 px-3 py-2 rounded-full transition-all duration-300 ${className}`}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--glass-border)',
      }}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Sun icon */}
      <span
        className={`transition-all duration-300 ${
          !isDarkMode ? 'opacity-100 scale-100' : 'opacity-40 scale-90'
        }`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'var(--accent)' }}
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </span>

      {/* Divider */}
      <span
        className="w-px h-4 mx-1"
        style={{ background: 'var(--glass-border)' }}
      />

      {/* Moon icon */}
      <span
        className={`transition-all duration-300 ${
          isDarkMode ? 'opacity-100 scale-100' : 'opacity-40 scale-90'
        }`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'var(--accent)' }}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </span>
      </button>
    </Tooltip>
  )
}
