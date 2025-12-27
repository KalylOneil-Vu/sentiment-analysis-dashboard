export interface Scenario {
  id: string
  name: string
  shortName: string
  description: string
  bgGradient: string
  icon: string
}

export interface StressMonitoringResult {
  stressLevel: number
  isElevated: boolean
  alertMessage: string | null
}
