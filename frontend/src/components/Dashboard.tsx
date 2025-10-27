import { motion } from 'framer-motion';
import { RoomEngagement } from '../types';
import EngagementScore from './EngagementScore';
import ParticipantsList from './ParticipantsList';
import DistributionChart from './DistributionChart';
import MetricsOverview from './MetricsOverview';
import { Loader2 } from 'lucide-react';

interface DashboardProps {
  engagement: RoomEngagement | null;
  fastvlmText?: string;
}

export default function Dashboard({ engagement, fastvlmText }: DashboardProps) {
  if (!engagement) {
    return (
      <div className="card h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-neutral-600 animate-spin mx-auto mb-4" />
          <h2 className="text-sm font-semibold mb-1">System Standby</h2>
          <p className="text-neutral-500 text-xs">
            Initialize analysis to begin monitoring
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {/* Primary Engagement Score - Left Top */}
      <motion.div
        className="row-span-2"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <EngagementScore score={engagement.overall_score} />
      </motion.div>

      {/* Metrics Overview - Right Top */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <MetricsOverview engagement={engagement} />
      </motion.div>

      {/* Distribution Chart - Right Middle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <DistributionChart engagement={engagement} />
      </motion.div>

      {/* FastVLM Intelligence Feed - Bottom Full Width */}
      {fastvlmText && (
        <motion.div
          className="col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-semibold">AI Visual Analysis</h3>
            </div>
            <div className="card-body">
              <p className="text-neutral-300 text-sm leading-relaxed">
                {fastvlmText}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Participants List - Bottom Full Width */}
      <motion.div
        className="col-span-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <ParticipantsList persons={engagement.persons} />
      </motion.div>
    </div>
  );
}
