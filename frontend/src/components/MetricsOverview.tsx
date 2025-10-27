import { RoomEngagement } from '../types';

interface MetricsOverviewProps {
  engagement: RoomEngagement;
}

export default function MetricsOverview({ engagement }: MetricsOverviewProps) {
  // Safely access participation with fallback
  const participation = engagement?.participation || { speaking_count: 0, participation_rate: 0 };

  const metrics = [
    {
      label: 'Total Personnel',
      value: engagement?.total_participants || 0,
      unit: 'COUNT',
    },
    {
      label: 'Active Units',
      value: engagement?.active_participants || 0,
      unit: 'ACTIVE',
    },
    {
      label: 'Transmitting',
      value: participation.speaking_count,
      unit: 'LIVE',
    },
    {
      label: 'Participation Index',
      value: `${Math.round(participation.participation_rate * 100)}`,
      unit: 'PCT',
    },
  ];

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-lg overflow-hidden backdrop-blur-sm">
      <div className="px-4 py-2.5 bg-zinc-900/60 border-b border-zinc-800/50">
        <h2 className="text-xs font-semibold tracking-wide text-zinc-300">Key Metrics</h2>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-zinc-900/50 border border-zinc-800/40 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-medium text-zinc-400 tracking-wide">{metric.label}</h3>
                <span className="text-[9px] text-zinc-600 font-semibold bg-zinc-800/50 px-1.5 py-0.5 rounded">{metric.unit}</span>
              </div>
              <p className="text-3xl font-bold text-zinc-100">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
