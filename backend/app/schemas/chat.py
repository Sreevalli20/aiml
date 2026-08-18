from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    conversation_id: Optional[str] = None
    language: str = "en"


class ChatResponse(BaseModel):
    conversation_id: str
    message: str
    language: str
    intent: Optional[str] = None
    requires_clarification: bool = False
    action_performed: bool = False
    action_required: Optional[Dict[str, Any]] = None
    suggested_follow_ups: Optional[List[str]] = None


class ConversationMessage(BaseModel):
    id: str
    role: str
    content: str
    timestamp: str
    intent: Optional[str] = None
    entities: Optional[Dict[str, Any]] = None


class ConversationResponse(BaseModel):
    id: str
    title: str
    language: str
    messages: List[ConversationMessage]
    created_at: str
    updated_at: str


class ConversationSummary(BaseModel):
    id: str
    title: str
    last_message: str
    updated_at: str
    message_count: int


class ConversationListResponse(BaseModel):
    conversations: List[ConversationSummary]


class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"
