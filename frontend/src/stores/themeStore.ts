import { create } from 'zustand'

const STORAGE_KEY = 'sentiment-ui-theme'

interface ThemeState {
  isDarkMode: boolean
  toggleTheme: () => void
}

// Get initial theme from localStorage or default to light mode
const getInitialTheme = (): boolean => {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored !== null) {
    return stored === 'dark'
  }
  return false // Default to light mode
}

// Apply theme class to document
const applyTheme = (isDark: boolean) => {
  if (typeof document === 'undefined') return
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light')
}

export const useThemeStore = create<ThemeState>((set) => {
  // Apply initial theme on store creation
  const initialDarkMode = getInitialTheme()
  applyTheme(initialDarkMode)

  return {
    isDarkMode: initialDarkMode,

    toggleTheme: () => set((state) => {
      const newDarkMode = !state.isDarkMode
      applyTheme(newDarkMode)
      return { isDarkMode: newDarkMode }
    }),
  }
})
