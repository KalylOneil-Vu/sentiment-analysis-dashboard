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
    <div className="space-y-3">
      {/* Audio Level Indicator */}
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 border ${
          isActive ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-zinc-700 bg-zinc-900'
        } rounded flex items-center justify-center transition-all`}>
          <div className={`w-3 h-3 rounded-full ${
            isActive ? 'bg-emerald-500' : 'bg-zinc-600'
          }`}></div>
        </div>

        {/* Audio Level Bar */}
        <div className="flex-1">
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-100"
              style={{ width: `${audioLevel * 100}%` }}
            />
          </div>
          <p className="text-[9px] text-zinc-600 mt-1 uppercase tracking-wider font-semibold">
            {isActive ? 'SIGNAL MONITORING' : 'STANDBY'}
          </p>
        </div>

        {/* Level Display */}
        <div className="text-right">
          <div className="text-sm font-bold font-mono text-zinc-400">{Math.round(audioLevel * 100)}</div>
          <p className="text-[8px] text-zinc-700 uppercase tracking-wider">DB</p>
        </div>
      </div>

      {/* Active Status */}
      {isActive && audioLevel > 0.3 && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">
            AUDIO DETECTED
          </span>
        </div>
      )}
    </div>
  );
}
