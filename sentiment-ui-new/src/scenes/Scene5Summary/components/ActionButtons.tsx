interface ActionButtonsProps {
  onReplay: () => void
}

export function ActionButtons({ onReplay }: ActionButtonsProps) {
  return (
    <div className="space-y-3">
      {/* Top row - two buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          className="py-2.5 px-3 rounded-lg text-[10px] font-medium tracking-[0.1em] uppercase transition-all duration-200 hover:scale-[1.02]"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            color: '#334155',
          }}
          onClick={() => window.open('https://www.accenture.com/us-en/services/applied-intelligence/ai-ethics-governance', '_blank')}
        >
          Learn More About
          <br />
          Responsible AI
        </button>

        <button
          className="py-2.5 px-3 rounded-lg text-[10px] font-medium tracking-[0.1em] uppercase transition-all duration-200 hover:scale-[1.02]"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            color: '#334155',
          }}
          onClick={() => window.open('https://www.accenture.com/us-en/about/contact-us', '_blank')}
        >
          Connect With
          <br />
          Our Team
        </button>
      </div>

      {/* Full-width replay button */}
      <button
        onClick={onReplay}
        className="w-full py-3 rounded-lg text-sm font-medium tracking-[0.12em] uppercase transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1.5px solid rgba(20, 184, 166, 0.6)',
          color: '#334155',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
      >
        Replay Experience
      </button>
    </div>
  )
}
