import React, { useRef, useEffect } from 'react';
import { Bot, Sparkles, MessageSquare } from 'lucide-react';
import { useChat } from '../../state/ChatContext';
import { useRole } from '../../state/RoleContext';
import { useLanguage } from '../../state/LanguageContext';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import { SuggestedPrompts } from './SuggestedPrompts';

interface ChatContainerProps {
  onOpenVoice: () => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ onOpenVoice }) => {
  const {
    messages,
    isThinking,
    sendMessage,
    retryLastMessage,
    executeActionCard,
    submitEscalation,
  } = useChat();
  const { currentPersona } = useRole();
  const { currentLanguage } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white relative">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto py-6 flex flex-col items-center justify-center space-y-6 text-center">
            {/* Glowing Bento Assistant Orb */}
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20" />
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl shadow-lg shadow-blue-500/30">
                <Bot className="w-6 h-6" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-semibold text-blue-700">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>{currentPersona.badge}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 font-display">
                How can I assist you today?
              </h3>
              <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                {currentPersona.personaDescription}
              </p>
            </div>

            {/* Language greeting info card (Bento) */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left max-w-md w-full">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-medium">
                <span>Native Language Greeting</span>
                <span className="font-mono text-[10px] text-blue-600 font-semibold">{currentLanguage.name}</span>
              </div>
              <p className="text-sm text-slate-800 font-medium">
                &ldquo;{currentLanguage.greeting}&rdquo;
              </p>
            </div>

            {/* Suggested prompts in 2-column Bento Grid */}
            <div className="w-full pt-2">
              <SuggestedPrompts
                onSelectPrompt={(p) => sendMessage(p)}
                disabled={isThinking}
              />
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onExecuteAction={
                  msg.actionCard ? (action) => executeActionCard(msg.id, action) : undefined
                }
                onSubmitEscalation={
                  msg.escalationCard ? (esc) => submitEscalation(msg.id, esc) : undefined
                }
                onRetry={msg.error ? retryLastMessage : undefined}
              />
            ))}

            {/* Thinking indicator bubble */}
            {isThinking && (
              <div className="flex items-start space-x-3 my-4">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 rounded-tl-none shadow-xs flex items-center space-x-3">
                  <div className="flex space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Processing via AI Agent Orchestration...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Composer Area */}
      <div className="p-4 md:px-8 border-t border-slate-200/80 bg-white">
        <div className="max-w-3xl mx-auto">
          {messages.length > 0 && (
            <div className="mb-3">
              <SuggestedPrompts
                onSelectPrompt={(p) => sendMessage(p)}
                disabled={isThinking}
              />
            </div>
          )}
          <MessageComposer
            onSend={sendMessage}
            onOpenVoice={onOpenVoice}
            isThinking={isThinking}
          />
        </div>
      </div>
    </div>
  );
};
