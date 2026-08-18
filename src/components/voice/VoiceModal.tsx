import React, { useEffect, useState } from 'react';
import { X, Mic, MicOff, Volume2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { AudioWaveform } from './AudioWaveform';
import { useLanguage } from '../../state/LanguageContext';
import { useRole } from '../../state/RoleContext';
import { useChat } from '../../state/ChatContext';
import { cn } from '../../utils/cn';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({ isOpen, onClose }) => {
  const { currentLanguage } = useLanguage();
  const { currentPersona } = useRole();
  const { sendMessage } = useChat();
  const [transcribedText, setTranscribedText] = useState<string>('');

  const {
    status,
    audioLevel,
    errorMessage,
    startListening,
    stopListening,
    cancel,
  } = useVoiceRecorder((text) => {
    setTranscribedText(text);
    sendMessage(text);
    setTimeout(() => {
      onClose();
    }, 1200);
  });

  useEffect(() => {
    if (isOpen) {
      setTranscribedText('');
      startListening();
    } else {
      cancel();
    }
  }, [isOpen, startListening, cancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-center p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={() => {
            cancel();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <span className="text-[11px] px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold uppercase tracking-wider">
            Voice Assistant • {currentLanguage.name}
          </span>
          <h3 className="text-2xl font-bold text-slate-900 font-display pt-2">
            Speak to {currentPersona.personaName}
          </h3>
          <p className="text-xs text-slate-500">
            Natural voice processing with multilingual speech intelligence
          </p>
        </div>

        {/* Dynamic Voice Waveform & Visual Orb */}
        <div className="relative py-4 flex flex-col items-center justify-center">
          {/* Animated Glow Rings */}
          <div className="relative flex items-center justify-center">
            {status === 'recording' && (
              <div
                className="absolute w-36 h-36 rounded-full bg-blue-500/20 animate-ping"
                style={{ transform: `scale(${1 + audioLevel * 0.8})` }}
              />
            )}
            <div className={cn(
              'w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl',
              status === 'recording'
                ? 'bg-blue-600 text-white shadow-blue-500/40'
                : status === 'transcribing' || status === 'thinking'
                  ? 'bg-amber-500 text-white shadow-amber-500/30 animate-pulse'
                  : status === 'error'
                    ? 'bg-rose-600 text-white shadow-rose-500/30'
                    : 'bg-slate-100 text-slate-500'
            )}>
              {status === 'recording' ? (
                <Mic className="w-10 h-10 animate-bounce" />
              ) : status === 'transcribing' || status === 'thinking' ? (
                <Sparkles className="w-10 h-10 animate-spin" />
              ) : status === 'speaking' ? (
                <Volume2 className="w-10 h-10 animate-pulse" />
              ) : status === 'error' ? (
                <AlertCircle className="w-10 h-10" />
              ) : (
                <MicOff className="w-10 h-10" />
              )}
            </div>
          </div>

          {/* Audio Wave Visualizer */}
          <div className="w-full mt-6">
            <AudioWaveform isActive={status === 'recording'} level={audioLevel} bars={24} />
          </div>
        </div>

        {/* Status Message */}
        <div className="min-h-[48px] flex items-center justify-center px-4">
          {status === 'recording' && (
            <p className="text-sm font-semibold text-blue-700">
              Listening in {currentLanguage.nativeName}... Speak your question clearly
            </p>
          )}
          {status === 'transcribing' && (
            <p className="text-sm font-medium text-amber-700 flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Transcribing voice audio via Speech-to-Text...</span>
            </p>
          )}
          {status === 'thinking' && (
            <p className="text-sm font-medium text-blue-700 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Consulting School ERP & AI Assistant...</span>
            </p>
          )}
          {status === 'error' && (
            <div className="text-xs text-rose-700 space-y-1">
              <p className="font-bold">Voice Processing Notice</p>
              <p className="opacity-90">{errorMessage || 'Unable to record voice or connect to backend audio API.'}</p>
            </div>
          )}
          {transcribedText && (
            <p className="text-xs font-mono text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              &ldquo;{transcribedText}&rdquo;
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center space-x-3 pt-2">
          {status === 'recording' ? (
            <button
              onClick={stopListening}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              Done Speaking
            </button>
          ) : status === 'error' ? (
            <button
              onClick={startListening}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all cursor-pointer"
            >
              Try Again
            </button>
          ) : (
            <button
              onClick={startListening}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all cursor-pointer"
            >
              Start Recording
            </button>
          )}
        </div>

        {/* Architecture Note */}
        <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-3 font-mono">
          Voice Flow: Mic → <code className="text-blue-600">/api/voice/transcribe</code> → Orchestrator → <code className="text-blue-600">/api/voice/synthesize</code>
        </div>
      </div>
    </div>
  );
};
