export type MessageSender = 'user' | 'assistant' | 'system';

export interface ActionConfirmationData {
  actionType: 'mark_attendance' | 'schedule_meeting' | 'generic_action';
  title: string;
  studentId?: string;
  studentName?: string;
  date?: string;
  status?: 'present' | 'absent' | 'late' | 'excused';
  classId?: string;
  className?: string;
  remarks?: string;
  confirmed?: boolean;
  executed?: boolean;
  statusMessage?: string;
}

export interface EscalationData {
  escalationId?: string;
  targetRole: 'teacher' | 'management' | 'principal' | 'counselor';
  teacherId?: string;
  teacherName?: string;
  studentName?: string;
  reason?: string;
  requestedAt?: string;
  status: 'pending' | 'submitted' | 'failed' | 'cancelled';
  contactPhone?: string;
  preferredTimeSlot?: string;
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  content: string;
  timestamp: string;
  language?: string;
  actionCard?: ActionConfirmationData;
  escalationCard?: EscalationData;
  suggestedFollowUps?: string[];
  error?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ConversationSummary {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: string;
  createdAt: string;
  messageCount: number;
}

export interface ChatRequestPayload {
  message: string;
  conversation_id?: string;
  language?: string;
  role_hint?: string;
  client_timestamp?: string;
}

export interface ChatResponsePayload {
  message: string;
  conversation_id: string;
  sender?: MessageSender;
  action_required?: ActionConfirmationData;
  escalation_offered?: EscalationData;
  suggested_follow_ups?: string[];
  metadata?: Record<string, unknown>;
}
