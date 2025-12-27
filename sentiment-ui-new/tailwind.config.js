/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kiosk: {
          bg: '#f8fafc',
          'bg-alt': '#f1f5f9',
        },
        glow: {
          primary: '#67e8f9',
          secondary: '#a5b4fc',
          accent: '#c4b5fd',
          warm: '#fca5a5',
        },
        ethereal: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          glow: 'rgba(160, 220, 255, 1)',
          'glow-soft': 'rgba(160, 220, 255, 0.4)',
        },
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'grid-pulse': 'grid-pulse 3s ease-in-out infinite',
        'glow-breathe': 'glow-breathe 4s ease-in-out infinite',
        'node-drift': 'node-drift 20s ease-in-out infinite',
        'scan-line': 'scan-line 8s linear infinite',
        'text-flicker': 'text-flicker 4s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'ring-expand': 'ring-expand 1000ms ease-in-out forwards',
        'wash-in': 'wash-in 600ms ease-in-out forwards',
        'wash-out': 'wash-out 1200ms ease-in-out forwards',
        'content-reveal': 'content-reveal 800ms ease-out forwards',
      },
      keyframes: {
        'grid-pulse': {
          '0%, 100%': { opacity: '0.15' },
          '50%': { opacity: '0.25' },
        },
        'glow-breathe': {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(160, 220, 255, 0.4))' },
          '50%': { filter: 'drop-shadow(0 0 16px rgba(160, 220, 255, 0.7))' },
        },
        'node-drift': {
          '0%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(10px, -15px)' },
          '50%': { transform: 'translate(-5px, -25px)' },
          '75%': { transform: 'translate(-15px, -10px)' },
          '100%': { transform: 'translate(0, 0)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '10%': { opacity: '0.6' },
          '90%': { opacity: '0.6' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        'text-flicker': {
          '0%, 100%': { opacity: '1' },
          '92%': { opacity: '1' },
          '93%': { opacity: '0.7' },
          '94%': { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -35px, 0)' },
        },
        'ring-expand': {
          '0%': {
            width: '0',
            height: '0',
            opacity: '1',
          },
          '100%': {
            width: '300vmax',
            height: '300vmax',
            opacity: '0',
          },
        },
        'wash-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'wash-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'content-reveal': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.98)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
