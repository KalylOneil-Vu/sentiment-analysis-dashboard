import { RoomEngagement } from '../types';
import EngagementScore from './EngagementScore';
import ParticipantsList from './ParticipantsList';
import DistributionChart from './DistributionChart';
import MetricsOverview from './MetricsOverview';

interface DashboardProps {
  engagement: RoomEngagement | null;
  fastvlmText?: string;
}

export default function Dashboard({ engagement, fastvlmText }: DashboardProps) {
  if (!engagement) {
    return (
      <div className="bg-slate-800 rounded-lg p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Waiting for Analysis...</h2>
        <p className="text-slate-400">
          Start analysis to begin monitoring engagement metrics
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Engagement Score */}
      <EngagementScore score={engagement.overall_score} />

      {/* FastVLM Context Display */}
      {fastvlmText && (
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">FastVLM Context</h3>
          <p className="text-slate-300 italic leading-relaxed">
            "{fastvlmText}"
          </p>
        </div>
      )}

      {/* Metrics Overview */}
      <MetricsOverview engagement={engagement} />

      {/* Distribution Chart */}
      <DistributionChart engagement={engagement} />

      {/* Participants List */}
      <ParticipantsList persons={engagement.persons} />
    </div>
  );
}
