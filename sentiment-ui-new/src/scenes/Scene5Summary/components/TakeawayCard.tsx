interface TakeawayCardProps {
  takeaways: string[]
  currentIndex: number
}

export function TakeawayCard({ takeaways, currentIndex }: TakeawayCardProps) {
  return (
    <div className="space-y-4">
      {/* Takeaway card */}
      <div
        className="p-4 rounded-lg min-h-[80px] flex items-center justify-center"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.3)',
        }}
      >
        <p
          className="text-sm text-slate-700 text-center leading-relaxed transition-opacity duration-300"
          key={currentIndex}
          style={{ animation: 'fadeIn 0.3s ease-in-out' }}
        >
          {takeaways[currentIndex]}
        </p>
      </div>

      {/* Pagination dots */}
      <div className="flex items-center justify-center gap-2">
        {takeaways.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-slate-700 scale-110'
                : 'bg-slate-300'
            }`}
          />
        ))}
      </div>

      {/* Inline keyframes for fade animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
