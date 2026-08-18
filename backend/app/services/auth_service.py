from datetime import timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.security.password import verify_password
from app.security.jwt import create_access_token
from app.security.authorization import AuthorizationError
from app.config import settings


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
    
    async def authenticate_user(
        self,
        identifier: str,
        password: str
    ) -> tuple[User, str]:
        """Authenticate a user and return user with access token."""
        user = await self.user_repo.get_by_identifier(identifier)
        
        if not user:
            raise AuthorizationError("Invalid credentials", "INVALID_CREDENTIALS")
        
        if not verify_password(password, user.hashed_password):
            raise AuthorizationError("Invalid credentials", "INVALID_CREDENTIALS")
        
        if not user.is_active:
            raise AuthorizationError("Account is inactive", "ACCOUNT_INACTIVE")
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user.id, "role": user.role.value},
            expires_delta=timedelta(minutes=settings.jwt_access_token_expire_minutes)
        )
        
        return user, access_token
    
    async def get_user_by_id(self, user_id: str) -> User:
        """Get user by ID."""
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise AuthorizationError("User not found", "USER_NOT_FOUND")
        return user
