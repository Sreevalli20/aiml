import { apiClient } from './client';
import { 
  ChatMessage, 
  ChatRequestPayload, 
  ChatResponsePayload, 
  ConversationSummary 
} from '../types/chat';
import { ApiResponse } from '../types/api';

export const chatApi = {
  /**
   * Send a conversational message to the backend AI agent orchestration layer.
   * Multi-turn context is managed backend-side via conversation_id.
   */
  async sendMessage(payload: ChatRequestPayload): Promise<ChatResponsePayload> {
    const res = await apiClient.post<ApiResponse<ChatResponsePayload> | ChatResponsePayload>(
      '/api/v1/chat',
      payload
    );
    if ('data' in res && res.data) {
      return res.data;
    }
    return res as ChatResponsePayload;
  },

  /**
   * Retrieve list of past conversations for the authenticated user.
   */
  async getConversations(): Promise<ConversationSummary[]> {
    const res = await apiClient.get<ApiResponse<ConversationSummary[]> | ConversationSummary[]>(
      '/api/v1/chat/conversations'
    );
    if ('data' in res && Array.isArray(res.data)) {
      return res.data;
    }
    if (Array.isArray(res)) {
      return res;
    }
    return [];
  },

  /**
   * Fetch full message history for a specific conversation ID.
   */
  async getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
    const res = await apiClient.get<ApiResponse<ChatMessage[]> | ChatMessage[]>(
      `/api/v1/chat/conversations/${conversationId}`
    );
    if ('data' in res && Array.isArray(res.data)) {
      return res.data;
    }
    if (Array.isArray(res)) {
      return res;
    }
    return [];
  },

  /**
   * Create a new blank conversation session.
   */
  async createConversation(title?: string): Promise<{ conversation_id: string; title: string }> {
    const res = await apiClient.post<ApiResponse<{ conversation_id: string; title: string }> | { conversation_id: string; title: string }>(
      '/api/v1/chat/conversations',
      { title: title || 'New Conversation' }
    );
    if ('data' in res && res.data) {
      return res.data;
    }
    return res as { conversation_id: string; title: string };
  },

  /**
   * Delete a conversation session.
   */
  async deleteConversation(conversationId: string): Promise<void> {
    await apiClient.delete(`/api/v1/chat/conversations/${conversationId}`);
  }
};
