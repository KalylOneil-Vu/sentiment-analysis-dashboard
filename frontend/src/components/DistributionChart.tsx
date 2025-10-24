import { RoomEngagement } from '../types';

interface DistributionChartProps {
  engagement: RoomEngagement;
}

export default function DistributionChart({ engagement }: DistributionChartProps) {
  const { distribution } = engagement;
  const { percentages } = distribution;

  const segments = [
    {
      label: 'Highly Engaged',
      percentage: percentages.highly_engaged,
      count: distribution.highly_engaged,
      color: 'bg-green-500',
      textColor: 'text-green-500',
    },
    {
      label: 'Neutral',
      percentage: percentages.neutral,
      count: distribution.neutral,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500',
    },
    {
      label: 'Disengaged',
      percentage: percentages.disengaged,
      count: distribution.disengaged,
      color: 'bg-red-500',
      textColor: 'text-red-500',
    },
  ];

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h2 className="text-lg font-semibold mb-4">Engagement Distribution</h2>

      {/* Bar Chart */}
      <div className="mb-6">
        <div className="h-12 flex rounded-lg overflow-hidden">
          {segments.map((segment, index) => (
            segment.percentage > 0 && (
              <div
                key={index}
                className={`${segment.color} flex items-center justify-center text-white text-sm font-medium transition-all duration-500`}
                style={{ width: `${segment.percentage}%` }}
              >
                {segment.percentage > 10 && `${Math.round(segment.percentage)}%`}
              </div>
            )
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-4">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${segment.color}`}></div>
            <div className="flex-1">
              <p className="text-sm text-slate-400">{segment.label}</p>
              <p className={`text-xl font-bold ${segment.textColor}`}>
                {segment.count}
                <span className="text-sm text-slate-400 ml-1">
                  ({Math.round(segment.percentage)}%)
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Component Averages */}
      <div className="mt-6 pt-6 border-t border-slate-700">
        <h3 className="text-sm font-medium text-slate-400 mb-3">Component Averages</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Emotion</span>
            <span className="font-semibold">{Math.round(engagement.averages.emotion * 100)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Body Language</span>
            <span className="font-semibold">{Math.round(engagement.averages.body_language * 100)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Speech</span>
            <span className="font-semibold">{Math.round(engagement.averages.speech * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
