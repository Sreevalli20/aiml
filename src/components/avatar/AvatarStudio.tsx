import React, { useState } from 'react';
import { Mic, Sparkles, MessageSquare, Radio } from 'lucide-react';
import { AIAvatar, AvatarState } from './AIAvatar';
import { useRole } from '../../state/RoleContext';
import { useLanguage } from '../../state/LanguageContext';
import { useChat } from '../../state/ChatContext';
import { AudioWaveform } from '../voice/AudioWaveform';

interface AvatarStudioProps {
  onOpenVoice: () => void;
  onSwitchToChat: () => void;
}

export const AvatarStudio: React.FC<AvatarStudioProps> = ({
  onOpenVoice,
  onSwitchToChat,
}) => {
  const { currentPersona } = useRole();
  const { currentLanguage } = useLanguage();
  const { isThinking, sendMessage } = useChat();
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');

  const activeState: AvatarState = isThinking ? 'thinking' : avatarState;

  const handleTestPrompt = (prompt: string) => {
    setAvatarState('thinking');
    sendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto p-6 md:p-10">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col items-center justify-between space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs text-blue-700 font-semibold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>Interactive AI Avatar Studio</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 font-display">
            Meet {currentPersona.personaName}
          </h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            Human-like digital school assistant designed for natural speech interaction, real-time feedback, and accessible multilingual assistance.
          </p>
        </div>

        {/* Central Character Stage */}
        <div className="relative flex flex-col items-center justify-center py-4">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col items-center">
            <AIAvatar state={activeState} size="xl" />

            {/* Waveform Visualizer */}
            <div className="w-72 mt-6">
              <AudioWaveform
                isActive={activeState === 'speaking' || activeState === 'listening'}
                level={activeState === 'speaking' ? 0.7 : 0.4}
                bars={20}
              />
            </div>
          </div>
        </div>

        {/* State Simulator Bento Card & Controls */}
        <div className="w-full max-w-xl p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2.5">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Avatar Animation State</span>
            <span className="font-mono text-blue-600 uppercase font-bold text-[11px]">
              Current: {activeState}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {(['idle', 'listening', 'thinking', 'speaking', 'error'] as AvatarState[]).map((st) => (
              <button
                key={st}
                onClick={() => setAvatarState(st)}
                className={`py-2 px-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                  avatarState === st
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={onOpenVoice}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Start Voice Session</span>
            </button>

            <button
              onClick={onSwitchToChat}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Switch to Chat</span>
            </button>
          </div>
        </div>

        {/* Suggested Voice Prompts */}
        <div className="w-full max-w-xl text-center space-y-2 pb-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Click to send test prompt to AI backend
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {currentPersona.suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleTestPrompt(prompt)}
                disabled={isThinking}
                className="text-xs px-3.5 py-1.5 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer disabled:opacity-50 shadow-2xs font-medium"
              >
                &ldquo;{prompt}&rdquo;
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
