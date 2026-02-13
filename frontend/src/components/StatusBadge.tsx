type StatusType = 'standby' | 'analyzing' | 'locked'

interface StatusBadgeProps {
  status: StatusType
}

const STATUS_CONFIG: Record<StatusType, { label: string; color: string }> = {
  standby: { label: 'Standby', color: '#f59e0b' }, // amber
  analyzing: { label: 'Analyzing', color: '#3b82f6' }, // blue
  locked: { label: 'Locked', color: '#22c55e' }, // green
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <div className="status-badge">
      <div
        className="status-dot"
        style={{ backgroundColor: config.color }}
      />
      <span style={{ color: config.color }}>{config.label}</span>
    </div>
  )
}
