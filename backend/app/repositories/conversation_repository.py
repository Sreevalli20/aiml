from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app.models.conversation import Conversation, ConversationMessage
from app.repositories.base import BaseRepository


class ConversationRepository(BaseRepository[Conversation]):
    def __init__(self, db: AsyncSession):
        super().__init__(Conversation, db)
    
    async def get_by_user_id(self, user_id: str, limit: int = 50) -> List[Conversation]:
        """Get all conversations for a user."""
        result = await self.db.execute(
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_with_messages(self, conversation_id: str) -> Optional[Conversation]:
        """Get conversation with all messages."""
        result = await self.db.execute(
            select(Conversation)
            .options(selectinload(Conversation.messages))
            .where(Conversation.id == conversation_id)
        )
        return result.scalar_one_or_none()
    
    async def add_message(
        self,
        conversation_id: str,
        role: str,
        content: str,
        intent: Optional[str] = None,
        entities: Optional[dict] = None,
        tool_calls: Optional[dict] = None
    ) -> ConversationMessage:
        """Add a message to a conversation."""
        message = ConversationMessage(
            conversation_id=conversation_id,
            role=role,
            content=content,
            intent=intent,
            entities=entities,
            tool_calls=tool_calls
        )
        self.db.add(message)
        
        # Update conversation timestamp
        await self.db.execute(
            select(Conversation).where(Conversation.id == conversation_id)
        )
        
        await self.db.flush()
        await self.db.refresh(message)
        return message
    
    async def get_recent_messages(
        self,
        conversation_id: str,
        limit: int = 10
    ) -> List[ConversationMessage]:
        """Get recent messages from a conversation."""
        result = await self.db.execute(
            select(ConversationMessage)
            .where(ConversationMessage.conversation_id == conversation_id)
            .order_by(ConversationMessage.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
