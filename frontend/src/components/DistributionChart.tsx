import { RoomEngagement } from '../types';

interface DistributionChartProps {
  engagement: RoomEngagement;
}

export default function DistributionChart({ engagement }: DistributionChartProps) {
  const { distribution } = engagement;
  const { percentages } = distribution;

  const segments = [
    {
      label: 'Optimal',
      percentage: percentages.highly_engaged,
      count: distribution.highly_engaged,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
    },
    {
      label: 'Moderate',
      percentage: percentages.neutral,
      count: distribution.neutral,
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/40',
    },
    {
      label: 'Critical',
      percentage: percentages.disengaged,
      count: distribution.disengaged,
      color: 'bg-red-500',
      textColor: 'text-red-400',
      borderColor: 'border-red-500/40',
    },
  ];

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-lg overflow-hidden backdrop-blur-sm">
      <div className="px-4 py-2.5 bg-zinc-900/60 border-b border-zinc-800/50">
        <h2 className="text-xs font-semibold tracking-wide text-zinc-300">Engagement Distribution</h2>
      </div>

      <div className="p-3">
        {/* Bar Chart */}
        <div className="mb-3">
          <div className="h-8 flex rounded-lg overflow-hidden bg-zinc-900/50">
            {segments.map((segment, index) => (
              segment.percentage > 0 && (
                <div
                  key={index}
                  className={`${segment.color} flex items-center justify-center text-white text-[10px] font-semibold tracking-wide transition-all duration-700`}
                  style={{ width: `${segment.percentage}%` }}
                >
                  {segment.percentage > 12 && `${Math.round(segment.percentage)}%`}
                </div>
              )
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {segments.map((segment, index) => (
            <div key={index} className={`border ${segment.borderColor} bg-zinc-900/50 rounded-lg p-2`}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className={`w-1.5 h-1.5 rounded-full ${segment.color} shadow-sm`}></div>
                <p className="text-[10px] text-zinc-400 font-medium tracking-wide">{segment.label}</p>
              </div>
              <p className={`text-lg font-bold ${segment.textColor}`}>
                {segment.count}
                <span className="text-[10px] text-zinc-600 ml-1 font-medium">
                  ({Math.round(segment.percentage)}%)
                </span>
              </p>
            </div>
          ))}
        </div>

        {/* Component Averages */}
        <div className="pt-3 border-t border-zinc-800/50">
          <h3 className="text-[10px] font-semibold text-zinc-400 mb-2.5 tracking-wide">Component Analysis</h3>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-400 font-medium">Emotion</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-zinc-800/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-700"
                    style={{ width: `${engagement.averages.emotion * 100}%` }}
                  ></div>
                </div>
                <span className="font-semibold text-xs text-zinc-200 w-10 text-right">{Math.round(engagement.averages.emotion * 100)}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-400 font-medium">Body Language</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-zinc-800/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-700"
                    style={{ width: `${engagement.averages.body_language * 100}%` }}
                  ></div>
                </div>
                <span className="font-semibold text-xs text-zinc-200 w-10 text-right">{Math.round(engagement.averages.body_language * 100)}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-400 font-medium">Speech</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-zinc-800/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-700"
                    style={{ width: `${engagement.averages.speech * 100}%` }}
                  ></div>
                </div>
                <span className="font-semibold text-xs text-zinc-200 w-10 text-right">{Math.round(engagement.averages.speech * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
