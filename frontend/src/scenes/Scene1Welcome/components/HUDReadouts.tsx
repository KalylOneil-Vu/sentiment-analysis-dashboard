import { useState, useEffect } from 'react'

const STATUS_MESSAGES = [
  'ANALYZING FACIAL STRUCTURE',
  'CALIBRATING SENSORS',
  'MAPPING EXPRESSION POINTS',
  'INITIALIZING EMOTION DETECTION',
  'SYSTEM READY',
]

export function HUDReadouts() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(false)
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % STATUS_MESSAGES.length)
        setIsTyping(true)
      }, 300)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Top left readout */}
      <div className="absolute top-6 left-6 entrance-animate entrance-delay-6">
        <div className="hud-readout flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
          <span>FACE DETECTION: ACTIVE</span>
        </div>
      </div>

      {/* Bottom left readout - cycling messages */}
      <div className="absolute bottom-6 left-6 entrance-animate entrance-delay-7">
        <div className={`hud-readout ${isTyping ? 'typing-cursor' : ''}`}>
          {STATUS_MESSAGES[currentIndex]}
        </div>
      </div>

      {/* Bottom right readout */}
      <div className="absolute bottom-6 right-6 entrance-animate entrance-delay-6">
        <div className="hud-readout text-right">
          <div>LATENCY: 12MS</div>
          <div className="mt-1">FPS: 30</div>
        </div>
      </div>
    </>
  )
}
