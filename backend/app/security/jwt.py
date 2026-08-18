from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from pydantic import BaseModel
from app.config import settings


class TokenData(BaseModel):
    user_id: str
    role: str
    exp: Optional[datetime] = None


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.jwt_access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm
    )
    return encoded_jwt


def decode_token(token: str) -> TokenData:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm]
        )
        
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        exp: Optional[datetime] = payload.get("exp")
        
        if user_id is None or role is None:
            raise ValueError("Invalid token payload")
        
        return TokenData(user_id=user_id, role=role, exp=exp)
    except JWTError as e:
        raise ValueError(f"Invalid token: {str(e)}")
