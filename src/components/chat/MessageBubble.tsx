import React, { useState } from 'react';
import { Bot, User, Copy, Check, Volume2, RefreshCw, AlertCircle } from 'lucide-react';
import { ChatMessage, ActionConfirmationData, EscalationData } from '../../types/chat';
import { ConfirmationCard } from './ConfirmationCard';
import { EscalationCard } from './EscalationCard';
import { formatTime } from '../../utils/formatters';
import { voiceApi } from '../../api/voice';
import { cn } from '../../utils/cn';

interface MessageBubbleProps {
  message: ChatMessage;
  onExecuteAction?: (action: ActionConfirmationData) => Promise<void>;
  onSubmitEscalation?: (escalation: EscalationData) => Promise<void>;
  onRetry?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onExecuteAction,
  onSubmitEscalation,
  onRetry,
}) => {
  const isUser = message.sender === 'user';
  const isError = Boolean(message.error);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = async () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      const res = await voiceApi.synthesizeSpeech({ text: message.content });
      if (res.audioUrl) {
        const audio = new Audio(res.audioUrl);
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => setIsPlayingAudio(false);
        await audio.play();
      } else if (res.audioBase64) {
        const audio = new Audio(`data:audio/mp3;base64,${res.audioBase64}`);
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => setIsPlayingAudio(false);
        await audio.play();
      } else if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message.content);
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsPlayingAudio(false);
      }
    } catch {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message.content);
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsPlayingAudio(false);
      }
    }
  };

  return (
    <div className={cn('flex items-start space-x-3 my-4 group', isUser && 'flex-row-reverse space-x-reverse')}>
      {/* Avatar Icon */}
      <div className={cn(
        'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md text-xs font-semibold',
        isUser
          ? 'bg-blue-600 text-white shadow-blue-500/20'
          : isError
            ? 'bg-rose-100 text-rose-700 border border-rose-300'
            : 'bg-blue-600 text-white shadow-blue-500/20'
      )}>
        {isUser ? <User className="w-4 h-4" /> : isError ? <AlertCircle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble Content */}
      <div className={cn(
        'max-w-2xl rounded-2xl p-4 text-sm transition-all relative',
        isUser
          ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-500/20'
          : isError
            ? 'bg-rose-50 border border-rose-200 text-rose-900 rounded-tl-none shadow-xs'
            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
      )}>
        {/* Content text */}
        <div className="leading-relaxed whitespace-pre-wrap break-words font-normal">
          {message.content}
        </div>

        {/* Action Confirmation Card (e.g. Teacher Mark Attendance) */}
        {message.actionCard && onExecuteAction && (
          <ConfirmationCard
            action={message.actionCard}
            onConfirm={onExecuteAction}
          />
        )}

        {/* Human Escalation Card (e.g. Request Teacher Callback) */}
        {message.escalationCard && onSubmitEscalation && (
          <EscalationCard
            escalation={message.escalationCard}
            onSubmit={onSubmitEscalation}
          />
        )}

        {/* Footer info & quick actions */}
        <div className={cn(
          'flex items-center justify-between text-[10px] mt-2 pt-1.5 border-t opacity-85 font-mono',
          isUser ? 'border-blue-500/40 text-blue-100' : 'border-slate-100 text-slate-400'
        )}>
          <span>{formatTime(message.timestamp)}</span>

          <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isUser && !isError && (
              <button
                onClick={handleSpeak}
                disabled={isPlayingAudio}
                title="Read response aloud"
                className="p-1 hover:text-blue-600 rounded hover:bg-slate-100 transition-colors cursor-pointer text-slate-500"
              >
                <Volume2 className={cn('w-3.5 h-3.5', isPlayingAudio && 'text-blue-600 animate-pulse')} />
              </button>
            )}

            <button
              onClick={handleCopy}
              title="Copy text"
              className={cn(
                'p-1 rounded transition-colors cursor-pointer',
                isUser ? 'hover:text-white hover:bg-blue-700 text-blue-100' : 'hover:text-slate-900 hover:bg-slate-100 text-slate-400'
              )}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {isError && onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-semibold cursor-pointer"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Retry</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
