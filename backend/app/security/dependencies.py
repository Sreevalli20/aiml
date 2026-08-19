from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db import get_db
from app.models.user import User, UserRole
from app.security.jwt import decode_token, TokenData
from app.security.authorization import AuthorizationError


security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get the current authenticated user from JWT token."""
    try:
        token_data = decode_token(credentials.credentials)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Query user from database
    result = await db.execute(select(User).where(User.id == token_data.user_id))
    user = result.scalar_one_or_none()
    
    # If user not found in database, reconstruct from token for demo users
    if user is None:
        try:
            role_enum = UserRole(token_data.role)
            user = User(
                id=token_data.user_id,
                email=f"demo_{token_data.role}@xyz.ai",
                username=f"demo_{token_data.role}",
                hashed_password="demo_hash",
                full_name=f"Demo {token_data.role.capitalize()}",
                role=role_enum,
                is_active=True
            )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user role in token",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )
    
    return user


async def get_current_user_role(
    current_user: User = Depends(get_current_user)
) -> UserRole:
    """Get the current user's role."""
    return current_user.role


async def require_role(required_role: UserRole):
    """Dependency to require a specific role."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{required_role}' required"
            )
        return current_user
    return role_checker


async def handle_authorization_error():
    """Handle authorization errors."""
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied"
    )
