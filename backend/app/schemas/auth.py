from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.models.user import UserRole


class LoginRequest(BaseModel):
    identifier: str = Field(..., description="Email, username, or phone number")
    password: str = Field(..., min_length=1)
    role_hint: Optional[UserRole] = None


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: str
    role: UserRole


class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    full_name: str
    role: UserRole
    is_active: bool
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class LoginResponse(BaseModel):
    token: TokenResponse
    user: UserResponse


class DemoLoginRequest(BaseModel):
    role: UserRole
