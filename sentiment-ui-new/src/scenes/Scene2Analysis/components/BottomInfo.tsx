interface BottomInfoProps {
  povUrl?: string
}

export function BottomInfo({ povUrl = '#' }: BottomInfoProps) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] text-slate-500 leading-relaxed whitespace-nowrap">
        AI facial analysis helps understand emotional states in real-time.
      </p>

      <a
        href={povUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-[10px] tracking-[0.15em] uppercase text-teal-500 hover:text-teal-600 transition-colors font-medium"
        style={{
          textDecoration: 'none',
          borderBottom: '1px solid rgba(20, 184, 166, 0.3)',
          paddingBottom: '2px',
        }}
      >
        Learn More About Accenture's POV
      </a>
    </div>
  )
}
