import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ChatMessage, 
  ConversationSummary, 
  ActionConfirmationData, 
  EscalationData 
} from '../types/chat';
import { chatApi } from '../api/chat';
import { attendanceApi } from '../api/attendance';
import { supportApi } from '../api/support';
import { ApiError } from '../api/client';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { useRole } from './RoleContext';

interface ChatContextValue {
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  messages: ChatMessage[];
  isThinking: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  startNewConversation: () => void;
  selectConversation: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  executeActionCard: (messageId: string, action: ActionConfirmationData) => Promise<void>;
  submitEscalation: (messageId: string, escalation: EscalationData) => Promise<void>;
  refreshConversations: () => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeRole, isAuthenticated } = useAuth();
  const { currentLanguage } = useLanguage();
  const { selectedRole } = useRole();

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);

  // Load conversation summaries when authenticated or on mount
  const refreshConversations = useCallback(async () => {
    try {
      const list = await chatApi.getConversations();
      setConversations(list);
    } catch {
      // Backend may be offline or unauthenticated; do not create fake conversations
      setConversations([]);
    }
  }, []);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations, isAuthenticated]);

  const selectConversation = useCallback(async (conversationId: string) => {
    setActiveConversationId(conversationId);
    setIsLoadingHistory(true);
    setError(null);
    try {
      const history = await chatApi.getConversationMessages(conversationId);
      setMessages(history);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(`Failed to load conversation history: ${err.message}`);
      } else {
        setError('Failed to load conversation history from backend.');
      }
      setMessages([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const startNewConversation = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setError(null);
    setLastUserMessage(null);
  }, []);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      await chatApi.deleteConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (activeConversationId === conversationId) {
        startNewConversation();
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(`Could not delete conversation: ${err.message}`);
      }
    }
  }, [activeConversationId, startNewConversation]);

  const sendMessage = useCallback(async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    setLastUserMessage(trimmed);
    const userMsgId = `usr_${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
      language: currentLanguage.code,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);
    setError(null);

    try {
      const response = await chatApi.sendMessage({
        message: trimmed,
        conversation_id: activeConversationId || undefined,
        language: currentLanguage.code,
        role_hint: activeRole || selectedRole,
        client_timestamp: new Date().toISOString(),
      });

      if (response.conversation_id && response.conversation_id !== activeConversationId) {
        setActiveConversationId(response.conversation_id);
        refreshConversations();
      }

      const assistantMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        actionCard: response.action_required,
        escalationCard: response.escalation_offered,
        suggestedFollowUps: response.suggested_follow_ups,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      let errMsg = 'Unable to receive response from backend.';
      if (err instanceof ApiError) {
        errMsg = err.message;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }

      const errorAssistantMessage: ChatMessage = {
        id: `ai_err_${Date.now()}`,
        sender: 'assistant',
        content: `**Connection Error**: ${errMsg}`,
        timestamp: new Date().toISOString(),
        error: true,
      };

      setMessages((prev) => [...prev, errorAssistantMessage]);
      setError(errMsg);
    } finally {
      setIsThinking(false);
    }
  }, [activeConversationId, currentLanguage.code, activeRole, selectedRole, refreshConversations]);

  const retryLastMessage = useCallback(async () => {
    if (lastUserMessage) {
      await sendMessage(lastUserMessage);
    }
  }, [lastUserMessage, sendMessage]);

  const executeActionCard = useCallback(async (messageId: string, action: ActionConfirmationData) => {
    try {
      if (action.actionType === 'mark_attendance' && action.studentId) {
        const res = await attendanceApi.markAttendance({
          studentId: action.studentId,
          studentName: action.studentName,
          classId: action.classId,
          date: action.date || new Date().toISOString().split('T')[0],
          status: action.status || 'absent',
          remarks: action.remarks,
        });

        // Update card in message history with real backend status
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === messageId && msg.actionCard) {
              return {
                ...msg,
                actionCard: {
                  ...msg.actionCard,
                  confirmed: true,
                  executed: res.success,
                  statusMessage: res.message || 'Attendance updated successfully.',
                },
              };
            }
            return msg;
          })
        );
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof ApiError ? err.message : 'Attendance could not be updated.';
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId && msg.actionCard) {
            return {
              ...msg,
              actionCard: {
                ...msg.actionCard,
                confirmed: true,
                executed: false,
                statusMessage: `Attendance could not be updated: ${errorMsg}`,
              },
            };
          }
          return msg;
        })
      );
    }
  }, []);

  const submitEscalation = useCallback(async (messageId: string, escalation: EscalationData) => {
    try {
      const res = await supportApi.requestTeacherCall({
        teacherId: escalation.teacherId,
        studentId: escalation.studentName,
        reason: escalation.reason || 'Parent inquiry escalation',
        contactNumber: escalation.contactPhone || '',
        preferredTime: escalation.preferredTimeSlot,
        roleHint: activeRole || selectedRole,
      });

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId && msg.escalationCard) {
            return {
              ...msg,
              escalationCard: {
                ...msg.escalationCard,
                status: 'submitted',
                reason: res.message || 'Your call request has been submitted.',
              },
            };
          }
          return msg;
        })
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof ApiError ? err.message : "I couldn't submit the request right now.";
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId && msg.escalationCard) {
            return {
              ...msg,
              escalationCard: {
                ...msg.escalationCard,
                status: 'failed',
                reason: `I couldn't submit the request right now: ${errorMsg}`,
              },
            };
          }
          return msg;
        })
      );
    }
  }, [activeRole, selectedRole]);

  const value = useMemo<ChatContextValue>(() => ({
    conversations,
    activeConversationId,
    messages,
    isThinking,
    isLoadingHistory,
    error,
    sendMessage,
    retryLastMessage,
    startNewConversation,
    selectConversation,
    deleteConversation,
    executeActionCard,
    submitEscalation,
    refreshConversations,
  }), [
    conversations,
    activeConversationId,
    messages,
    isThinking,
    isLoadingHistory,
    error,
    sendMessage,
    retryLastMessage,
    startNewConversation,
    selectConversation,
    deleteConversation,
    executeActionCard,
    submitEscalation,
    refreshConversations,
  ]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export function useChat(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
