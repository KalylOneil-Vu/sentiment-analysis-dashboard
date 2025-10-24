import { useEffect, useRef, useState, useCallback } from 'react';
import { RoomEngagement, WebSocketMessage } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

interface UseWebSocketReturn {
  isConnected: boolean;
  latestEngagement: RoomEngagement | null;
  sendFrame: (
    frameData: string,
    fastvlmText?: string,
    fastvlmKeywords?: {
      positive: string[];
      negative: string[];
      bodyLanguage: string[];
      emotions: string[];
    }
  ) => void;
  sendAudio: (audioData: ArrayBuffer) => void;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket(clientId: string): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [latestEngagement, setLatestEngagement] = useState<RoomEngagement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      const ws = new WebSocket(`${WS_URL}/${clientId}`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'engagement_update':
              setLatestEngagement(message.data as RoomEngagement);
              break;
            case 'pong':
              // Heartbeat response
              break;
            case 'error':
              console.error('Server error:', message.data);
              break;
            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = window.setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  }, [clientId]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const sendFrame = useCallback((
    frameData: string,
    fastvlmText?: string,
    fastvlmKeywords?: {
      positive: string[];
      negative: string[];
      bodyLanguage: string[];
      emotions: string[];
    }
  ) => {
    console.log('sendFrame called, WebSocket state:', wsRef.current?.readyState);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('Sending video frame with FastVLM data via WebSocket');

      // Flatten keywords into simple array for backend
      const keywordArray = fastvlmKeywords
        ? [
            ...fastvlmKeywords.positive,
            ...fastvlmKeywords.negative,
            ...fastvlmKeywords.bodyLanguage,
            ...fastvlmKeywords.emotions,
          ]
        : [];

      wsRef.current.send(JSON.stringify({
        type: 'video_frame',
        frame: frameData,
        fastvlm_text: fastvlmText || '',
        fastvlm_keywords: keywordArray,
      }));
    } else {
      console.log('WebSocket not open, cannot send frame');
    }
  }, []);

  const sendAudio = useCallback((audioData: ArrayBuffer) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Convert ArrayBuffer to base64
      const base64 = btoa(
        new Uint8Array(audioData).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      wsRef.current.send(JSON.stringify({
        type: 'audio_chunk',
        data: base64
      }));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    latestEngagement,
    sendFrame,
    sendAudio,
    connect,
    disconnect
  };
}
