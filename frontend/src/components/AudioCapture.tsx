import { useEffect, useRef, useState } from 'react';

interface AudioCaptureProps {
  isActive: boolean;
  onAudioData: (audioData: ArrayBuffer) => void;
}

export default function AudioCapture({ isActive, onAudioData }: AudioCaptureProps) {
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      startAudioCapture();
    } else {
      stopAudioCapture();
    }

    return () => {
      stopAudioCapture();
    };
  }, [isActive]);

  const startAudioCapture = async () => {
    try {
      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create audio context
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      // Create analyser for visualization
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      // Connect microphone
      const microphone = audioContext.createMediaStreamSource(stream);
      microphoneRef.current = microphone;
      microphone.connect(analyser);

      // Start audio level monitoring
      monitorAudioLevel();

      // Send audio chunks every 2 seconds
      recordingIntervalRef.current = window.setInterval(() => {
        captureAudioChunk();
      }, 2000);

    } catch (error) {
      console.error('Error starting audio capture:', error);
    }
  };

  const stopAudioCapture = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setAudioLevel(0);
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const checkLevel = () => {
      if (!analyserRef.current || !isActive) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255);

      requestAnimationFrame(checkLevel);
    };

    checkLevel();
  };

  const captureAudioChunk = async () => {
    // Note: In a real implementation, you would use MediaRecorder
    // to capture actual audio data. This is a placeholder.
    // For now, we'll just signal that audio is being captured
    console.log('Audio chunk captured (placeholder)');

    // In production, you would:
    // 1. Use MediaRecorder to record audio chunks
    // 2. Convert to appropriate format
    // 3. Call onAudioData with the ArrayBuffer
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Audio Monitor</h2>

      <div className="flex items-center gap-3">
        {/* Microphone Icon */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-500'
        }`}>
          🎤
        </div>

        {/* Audio Level Bar */}
        <div className="flex-1">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-100"
              style={{ width: `${audioLevel * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isActive ? 'Monitoring audio...' : 'Audio monitoring inactive'}
          </p>
        </div>
      </div>

      {isActive && audioLevel > 0.3 && (
        <div className="mt-3 text-sm text-green-400 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          Audio detected
        </div>
      )}
    </div>
  );
}
