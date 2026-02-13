import { Scenario } from '../../../types/scenario'

interface ScenarioGridProps {
  scenarios: Scenario[]
  selectedIndex: number
  onSelectScenario: (index: number) => void
}

export function ScenarioGrid({
  scenarios,
  selectedIndex,
  onSelectScenario,
}: ScenarioGridProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {scenarios.map((scenario, index) => (
        <button
          key={scenario.id}
          onClick={() => onSelectScenario(index)}
          className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 hover-lift stagger-item ${
            index === selectedIndex
              ? 'ring-2 ring-teal-500 ring-offset-2'
              : 'hover:ring-1 hover:ring-slate-300'
          }`}
          style={{
            background: scenario.bgGradient,
          }}
        >
          {/* Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl opacity-60">{scenario.icon}</span>
          </div>

          {/* Label overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-1.5">
            <p className="text-white text-[8px] font-medium tracking-wide text-center truncate">
              {scenario.shortName}
            </p>
          </div>

          {/* Selected indicator */}
          {index === selectedIndex && (
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal-400 shadow-lg" />
          )}
        </button>
      ))}
    </div>
  )
}
