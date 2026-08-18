import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Sparkles } from 'lucide-react';
import { useLanguage } from '../../state/LanguageContext';
import { useRole } from '../../state/RoleContext';
import { cn } from '../../utils/cn';

interface MessageComposerProps {
  onSend: (text: string) => void;
  onOpenVoice: () => void;
  isThinking: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSend,
  onOpenVoice,
  isThinking
}) => {
  const [text, setText] = useState('');
  const { currentLanguage } = useLanguage();
  const { currentPersona } = useRole();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (text.trim() && !isThinking) {
        onSend(text);
        setText('');
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isThinking) {
      onSend(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="relative w-full">
      <div className="relative rounded-2xl bg-slate-100/90 border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white transition-all shadow-inner p-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isThinking}
          rows={1}
          placeholder={`Ask ${currentPersona.personaName} in ${currentLanguage.nativeName}... (e.g. "${currentPersona.suggestedPrompts[0]}")`}
          className="w-full px-3 py-2 bg-transparent text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none max-h-32 leading-relaxed"
        />

        <div className="flex items-center justify-between pt-2 px-1 border-t border-slate-200/60">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-mono font-medium shadow-2xs">
              {currentLanguage.nativeName} ({currentLanguage.code})
            </span>
            <span className="text-[11px] text-slate-400 hidden md:inline">
              Press Enter to send
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onOpenVoice}
              title="Voice Assistant Mode"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 transition-colors cursor-pointer"
            >
              <Mic className="w-4 h-4 text-blue-600" />
            </button>

            <button
              type="submit"
              disabled={!text.trim() || isThinking}
              className={cn(
                'inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all duration-150 cursor-pointer',
                text.trim() && !isThinking
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
              )}
            >
              {isThinking ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <span>SEND</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-center text-slate-400 mt-2.5 uppercase tracking-widest font-mono">
        Powered by XYZ AI Orchestration Engine
      </p>
    </form>
  );
};
