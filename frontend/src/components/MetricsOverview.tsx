import { RoomEngagement } from '../types';

interface MetricsOverviewProps {
  engagement: RoomEngagement;
}

export default function MetricsOverview({ engagement }: MetricsOverviewProps) {
  // Safely access participation with fallback
  const participation = engagement?.participation || { speaking_count: 0, participation_rate: 0 };

  const metrics = [
    {
      label: 'Total Participants',
      value: engagement?.total_participants || 0,
      icon: '👥',
    },
    {
      label: 'Active Participants',
      value: engagement?.active_participants || 0,
      icon: '✅',
    },
    {
      label: 'Currently Speaking',
      value: participation.speaking_count,
      icon: '🎤',
    },
    {
      label: 'Participation Rate',
      value: `${Math.round(participation.participation_rate * 100)}%`,
      icon: '📊',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-slate-800 rounded-lg p-4 border border-slate-700"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{metric.icon}</span>
            <h3 className="text-sm font-medium text-slate-400">{metric.label}</h3>
          </div>
          <p className="text-3xl font-bold">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}
