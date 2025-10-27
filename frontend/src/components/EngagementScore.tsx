import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface EngagementScoreProps {
  score: number;
}

export default function EngagementScore({ score }: EngagementScoreProps) {
  const percentage = Math.round(score * 100);
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getScoreColor = () => {
    if (score >= 0.7) return '#22c55e'; // green
    if (score >= 0.4) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const getStatus = () => {
    if (score >= 0.7) return { text: 'Excellent', icon: TrendingUp };
    if (score >= 0.4) return { text: 'Moderate', icon: Activity };
    return { text: 'Low', icon: TrendingDown };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <div className="card h-full flex flex-col">
      <div className="card-header flex items-center justify-between">
        <h2 className="text-sm font-semibold">Overall Engagement</h2>
        <div className="flex items-center gap-2">
          <StatusIcon className="w-4 h-4" style={{ color: getScoreColor() }} />
          <span className="text-xs font-medium" style={{ color: getScoreColor() }}>
            {status.text}
          </span>
        </div>
      </div>

      <div className="card-body flex-1 flex items-center justify-center">
        <div className="relative">
          {/* Circular Progress */}
          <svg className="w-48 h-48 transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-neutral-800"
            />

            {/* Progress Circle */}
            <motion.circle
              cx="96"
              cy="96"
              r={radius}
              stroke={getScoreColor()}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              className="text-5xl font-bold"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {percentage}%
            </motion.div>
            <div className="text-xs text-neutral-400 font-medium mt-1">
              Engagement Score
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 pb-6">
        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: getScoreColor() }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-neutral-500">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
