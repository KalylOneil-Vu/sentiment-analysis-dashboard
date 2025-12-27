/**
 * Speech Recognition Hook
 * Uses Web Speech API for real-time speech-to-text
 */

import { useEffect, useRef, useState, useCallback } from 'react'

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message?: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

interface UseSpeechRecognitionReturn {
  transcript: string
  interimTranscript: string
  isListening: boolean
  isSupported: boolean
  error: string | null
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

export function useSpeechRecognition(
  isEnabled: boolean = true,
  language: string = 'en-US'
): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState<string>('')
  const [interimTranscript, setInterimTranscript] = useState<string>('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  // Track actual running state to prevent race conditions
  const isRunningRef = useRef(false)
  const isStartingRef = useRef(false)
  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported || !isEnabled) return

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = language
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      isRunningRef.current = true
      isStartingRef.current = false
      setIsListening(true)
      setError(null)
    }

    recognition.onend = () => {
      isRunningRef.current = false
      isStartingRef.current = false
      setIsListening(false)
      // Auto-restart if still enabled (with delay to prevent race)
      if (isEnabled && recognitionRef.current) {
        setTimeout(() => {
          if (isEnabled && recognitionRef.current && !isRunningRef.current && !isStartingRef.current) {
            try {
              isStartingRef.current = true
              recognition.start()
            } catch {
              isStartingRef.current = false
            }
          }
        }, 100)
      }
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interim = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0].transcript

        if (result.isFinal) {
          finalTranscript += text + ' '
        } else {
          interim += text
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript)
      }
      setInterimTranscript(interim)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[SpeechRecognition] Error:', event.error)

      // Handle specific errors
      switch (event.error) {
        case 'no-speech':
          // Ignore - just means no speech detected
          break
        case 'audio-capture':
          setError('No microphone detected')
          break
        case 'not-allowed':
          setError('Microphone permission denied')
          break
        case 'network':
          setError('Network error occurred')
          break
        default:
          setError(`Speech recognition error: ${event.error}`)
      }
    }

    recognitionRef.current = recognition

    // Auto-start after initialization if enabled
    if (isEnabled) {
      setTimeout(() => {
        if (!isRunningRef.current && !isStartingRef.current && recognitionRef.current) {
          try {
            isStartingRef.current = true
            recognition.start()
          } catch {
            isStartingRef.current = false
          }
        }
      }, 100)
    }

    return () => {
      recognition.abort()
      isRunningRef.current = false
      isStartingRef.current = false
      recognitionRef.current = null
    }
  }, [isSupported, isEnabled, language])

  const startListening = useCallback(() => {
    // Use refs for synchronous state check to prevent race conditions
    if (!recognitionRef.current || isRunningRef.current || isStartingRef.current) return

    try {
      isStartingRef.current = true
      recognitionRef.current.start()
    } catch (err) {
      isStartingRef.current = false
      console.error('[SpeechRecognition] Start error:', err)
    }
  }, [])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isRunningRef.current) return

    try {
      recognitionRef.current.stop()
    } catch (err) {
      console.error('[SpeechRecognition] Stop error:', err)
    }
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  // Auto-start when enabled changes - only trigger on actual enable/disable transitions
  const prevEnabledRef = useRef(isEnabled)
  useEffect(() => {
    // Only act on actual transitions, not on every render
    if (isEnabled && !prevEnabledRef.current) {
      // Just became enabled - start if not already running
      if (isSupported && !isRunningRef.current && !isStartingRef.current) {
        startListening()
      }
    }

    if (!isEnabled && prevEnabledRef.current) {
      // Just became disabled - stop
      stopListening()
    }

    prevEnabledRef.current = isEnabled
  }, [isEnabled, isSupported, startListening, stopListening])

  return {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}
