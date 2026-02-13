interface SensitivitySliderProps {
  value: number
  onChange: (value: number) => void
}

export function SensitivitySlider({ value, onChange }: SensitivitySliderProps) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-slate-600">
        Sentiment Sensitivity
      </label>

      {/* Slider track and thumb */}
      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right,
              rgba(20, 184, 166, 0.8) 0%,
              rgba(20, 184, 166, 0.8) ${value}%,
              rgba(148, 163, 184, 0.3) ${value}%,
              rgba(148, 163, 184, 0.3) 100%)`,
          }}
        />

        {/* Custom styling for range input */}
        <style>{`
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: white;
            border: 2px solid rgba(20, 184, 166, 0.8);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
            cursor: pointer;
            transition: transform 0.15s ease;
          }
          input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.1);
          }
          input[type="range"]::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: white;
            border: 2px solid rgba(20, 184, 166, 0.8);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
            cursor: pointer;
          }
        `}</style>
      </div>

      {/* Labels */}
      <div className="flex justify-between text-[9px] text-slate-400 uppercase tracking-wider">
        <span>Conservative</span>
        <span>Sensitive</span>
      </div>
    </div>
  )
}
