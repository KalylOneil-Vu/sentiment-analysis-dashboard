let audioContext: AudioContext | null = null

export function initAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

export async function resumeAudioContext(): Promise<void> {
  if (audioContext?.state === 'suspended') {
    await audioContext.resume()
  }
}

export function getAudioContext(): AudioContext | null {
  return audioContext
}

interface PingConfig {
  frequency?: number      // Hz, default 700
  duration?: number       // seconds, default 0.04
  volume?: number         // 0-1, default 0.15
  reverbDecay?: number    // seconds, default 1.5
}

export function playSonarPing(config: PingConfig = {}): void {
  const ctx = initAudioContext()
  if (ctx.state !== 'running') return

  const {
    frequency = 680,
    duration = 0.05,
    volume = 0.12,
    reverbDecay = 1.8
  } = config

  const now = ctx.currentTime

  // Create oscillator for the ping tone
  const oscillator = ctx.createOscillator()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, now)
  // Slight frequency drop for sonar feel
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.95, now + duration)

  // Create gain node for envelope
  const gainNode = ctx.createGain()
  gainNode.gain.setValueAtTime(0, now)
  gainNode.gain.linearRampToValueAtTime(volume, now + duration * 0.15)
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration)

  // Create delay for subtle reverb effect
  const delayNode = ctx.createDelay(2)
  delayNode.delayTime.setValueAtTime(0.12, now)

  const feedbackGain = ctx.createGain()
  feedbackGain.gain.setValueAtTime(0.25, now)

  const reverbGain = ctx.createGain()
  reverbGain.gain.setValueAtTime(0.15, now)
  reverbGain.gain.exponentialRampToValueAtTime(0.001, now + reverbDecay)

  // Low-pass filter for warmer reverb
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(2000, now)

  // Connect dry signal
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  // Connect reverb chain
  gainNode.connect(filter)
  filter.connect(delayNode)
  delayNode.connect(feedbackGain)
  feedbackGain.connect(delayNode) // Feedback loop
  feedbackGain.connect(reverbGain)
  reverbGain.connect(ctx.destination)

  // Start and schedule stop
  oscillator.start(now)
  oscillator.stop(now + duration + reverbDecay)

  // Cleanup
  oscillator.onended = () => {
    oscillator.disconnect()
    gainNode.disconnect()
    delayNode.disconnect()
    feedbackGain.disconnect()
    reverbGain.disconnect()
    filter.disconnect()
  }
}

// Ambient loop that plays ping at intervals
export function startAmbientPingLoop(intervalMs: number = 6000): () => void {
  let timeoutId: ReturnType<typeof setTimeout>
  let isRunning = true

  function scheduleNext() {
    if (!isRunning) return

    // Add randomness to interval (70% - 130% of base)
    const jitter = intervalMs * (0.7 + Math.random() * 0.6)

    timeoutId = setTimeout(() => {
      // Vary volume slightly
      playSonarPing({
        volume: 0.08 + Math.random() * 0.06,
        frequency: 660 + Math.random() * 40,
      })
      scheduleNext()
    }, jitter)
  }

  // Start after initial delay
  timeoutId = setTimeout(() => {
    playSonarPing({ volume: 0.1 })
    scheduleNext()
  }, 2000)

  // Return cleanup function
  return () => {
    isRunning = false
    clearTimeout(timeoutId)
  }
}

// Secondary ambient tone (subtle background hum)
export function playAmbientHum(duration: number = 0.5): void {
  const ctx = initAudioContext()
  if (ctx.state !== 'running') return

  const now = ctx.currentTime

  const oscillator = ctx.createOscillator()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(120, now)

  const gainNode = ctx.createGain()
  gainNode.gain.setValueAtTime(0, now)
  gainNode.gain.linearRampToValueAtTime(0.02, now + 0.1)
  gainNode.gain.linearRampToValueAtTime(0.02, now + duration - 0.1)
  gainNode.gain.linearRampToValueAtTime(0, now + duration)

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.start(now)
  oscillator.stop(now + duration)

  oscillator.onended = () => {
    oscillator.disconnect()
    gainNode.disconnect()
  }
}
