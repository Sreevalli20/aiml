from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.schemas.chat import ChatRequest, ChatResponse, ConversationListResponse, ConversationCreate
from app.security.dependencies import get_current_user
from app.models.user import User
from app.ai.orchestrator import AIOrchestrator
from app.repositories.conversation_repository import ConversationRepository
from app.services.audit_service import AuditService
from app.models.audit_log import AuditAction

router = APIRouter()


@router.post("", response_model=ChatResponse)
async def send_message(
    request_data: ChatRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send a message to the AI assistant."""
    audit_service = AuditService(db)
    
    # Check for prompt injection attempts
    message_lower = request_data.message.lower()
    if any(phrase in message_lower for phrase in [
        "ignore previous instructions",
        "ignore all instructions",
        "system prompt",
        "api key",
        "secret",
        "password",
        "token",
        "show me your",
        "reveal your"
    ]):
        await audit_service.log_security_event(
            user_id=current_user.id,
            user_role=current_user.role.value,
            event_type="prompt_injection_attempt",
            details={"message": request_data.message},
            ip_address=request.client.host if request.client else None
        )
        # Return safe refusal
        return ChatResponse(
            conversation_id=request_data.conversation_id or "new",
            message="I can't help with that request. Is there something else I can assist you with?",
            language=request_data.language,
            intent="security_refusal",
            requires_clarification=False,
            action_performed=False,
            suggested_follow_ups=[]
        )
    
    try:
        orchestrator = AIOrchestrator(db)
        result = await orchestrator.process_message(
            user_id=current_user.id,
            user_role=current_user.role,
            message=request_data.message,
            conversation_id=request_data.conversation_id,
            language=request_data.language
        )
        
        # Log conversation message
        await audit_service.log_action(
            user_id=current_user.id,
            user_role=current_user.role.value,
            action=AuditAction.CONVERSATION_MESSAGE,
            resource_type="conversation",
            resource_id=result["conversation_id"],
            success=True
        )
        
        return ChatResponse(**result)
    except Exception as e:
        await audit_service.log_action(
            user_id=current_user.id,
            user_role=current_user.role.value,
            action=AuditAction.CONVERSATION_MESSAGE,
            success=False,
            details={"error": str(e)}
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process message"
        )


@router.get("/conversations", response_model=ConversationListResponse)
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get list of user's conversations."""
    conversation_repo = ConversationRepository(db)
    conversations = await conversation_repo.get_by_user_id(current_user.id)
    
    return ConversationListResponse(
        conversations=[
            {
                "id": conv.id,
                "title": conv.title,
                "last_message": conv.messages[-1].content if conv.messages else "",
                "updated_at": conv.updated_at.isoformat(),
                "message_count": len(conv.messages)
            }
            for conv in conversations
        ]
    )


@router.post("/conversations")
async def create_conversation(
    data: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new conversation."""
    from app.models.conversation import Conversation
    import uuid
    
    conversation = Conversation(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        title=data.title,
        language="en"
    )
    db.add(conversation)
    await db.commit()
    
    return {
        "conversation_id": conversation.id,
        "title": conversation.title
    }


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a conversation."""
    conversation_repo = ConversationRepository(db)
    conversation = await conversation_repo.get_by_id(conversation_id)
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this conversation")
    
    await conversation_repo.delete(conversation_id)
    await db.commit()
    
    return {"success": True, "message": "Conversation deleted"}
