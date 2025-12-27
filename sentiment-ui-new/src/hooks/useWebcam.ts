import { useEffect, useRef, useState, RefObject } from 'react'

interface UseWebcamReturn {
  isStreaming: boolean
  error: string | null
  stream: MediaStream | null
}

export function useWebcam(videoRef: RefObject<HTMLVideoElement | null>): UseWebcamReturn {
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    let mounted = true

    async function startWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop())
          return
        }

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            if (mounted && videoRef.current) {
              videoRef.current.play()
                .then(() => {
                  if (mounted) setIsStreaming(true)
                })
                .catch(err => {
                  if (mounted) setError(`Failed to play video: ${err.message}`)
                })
            }
          }
        }
      } catch (err) {
        if (mounted) {
          const message = err instanceof Error ? err.message : 'Unknown error'
          setError(`Camera access denied: ${message}`)
        }
      }
    }

    startWebcam()

    return () => {
      mounted = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      setIsStreaming(false)
    }
  }, [videoRef])

  return {
    isStreaming,
    error,
    stream: streamRef.current,
  }
}
