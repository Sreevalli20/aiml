import { useState, useRef, useCallback } from 'react';
import { VoiceStatus } from '../types/voice';
import { voiceApi } from '../api/voice';
import { chatApi } from '../api/chat';

export function useVoiceRecorder(onTranscriptionCompleted?: (text: string) => void) {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const startListening = useCallback(async () => {
    setErrorMessage(null);
    setStatus('listening');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatus('recording');

      // Setup audio analyzer for wave visualization
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((p, c) => p + c, 0) / dataArray.length;
        setAudioLevel(avg / 255);
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {});
        }
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 0) {
          setStatus('transcribing');
          try {
            const transcription = await voiceApi.transcribeAudio(audioBlob);
            if (transcription.text) {
              setStatus('thinking');
              if (onTranscriptionCompleted) {
                onTranscriptionCompleted(transcription.text);
              }
            } else {
              setStatus('idle');
            }
          } catch (err: unknown) {
            setStatus('error');
            setErrorMessage(err instanceof Error ? err.message : 'Transcription failed');
          }
        } else {
          setStatus('idle');
        }
      };

      mediaRecorder.start();
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Microphone permission denied or audio input unavailable'
      );
    }
  }, [onTranscriptionCompleted]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const cancel = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setStatus('idle');
    setAudioLevel(0);
    setErrorMessage(null);
  }, []);

  return {
    status,
    audioLevel,
    errorMessage,
    startListening,
    stopListening,
    cancel,
    setStatus,
  };
}
