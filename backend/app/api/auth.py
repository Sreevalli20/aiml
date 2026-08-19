from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.schemas.auth import LoginRequest, LoginResponse, UserResponse, TokenResponse, DemoLoginRequest
from app.services.auth_service import AuthService
from app.security.dependencies import get_current_user
from app.models.user import User
from app.services.audit_service import AuditService
from app.models.audit_log import AuditAction

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
async def login(
    credentials: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Authenticate user and return JWT token."""
    auth_service = AuthService(db)
    audit_service = AuditService(db)
    
    try:
        user, access_token = await auth_service.authenticate_user(
            credentials.identifier,
            credentials.password
        )
        
        # Log successful login (non-blocking)
        try:
            await audit_service.log_action(
                user_id=user.id,
                user_role=user.role.value,
                action=AuditAction.LOGIN,
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent"),
                success=True
            )
        except Exception as audit_error:
            # Log audit failure but don't block login
            print(f"Audit log failed: {audit_error}")
        
        return LoginResponse(
            token=TokenResponse(
                access_token=access_token,
                token_type="bearer",
                expires_in=3600
            ),
            user=UserResponse(
                id=user.id,
                email=user.email,
                username=user.username,
                full_name=user.full_name,
                role=user.role,
                is_active=user.is_active
            )
        )
    except Exception as e:
        # Log failed login attempt (non-blocking)
        try:
            await audit_service.log_action(
                user_id="unknown",
                user_role="unknown",
                action=AuditAction.LOGIN,
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent"),
                success=False,
                details={"identifier": credentials.identifier}
            )
        except Exception as audit_error:
            # Log audit failure but don't block error response
            print(f"Audit log failed: {audit_error}")
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"}
        )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user profile."""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active
    )


@router.post("/logout")
async def logout(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Logout user (client-side token removal)."""
    audit_service = AuditService(db)
    
    await audit_service.log_action(
        user_id=current_user.id,
        user_role=current_user.role.value,
        action=AuditAction.LOGOUT,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        success=True
    )
    
    return {"success": True, "message": "Logged out successfully"}


@router.post("/demo-login", response_model=LoginResponse)
async def demo_login(
    request_data: DemoLoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Demo login without password - returns in-memory demo user without database dependency."""
    from app.security.jwt import create_access_token
    from datetime import timedelta
    from app.config import settings
    from app.models.user import UserRole
    import uuid
    
    # Convert string role to UserRole enum
    try:
        role_enum = UserRole(request_data.role.lower())
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid role: {request_data.role}. Must be one of: student, parent, teacher, principal"
        )
    
    # Create in-memory demo user (no database dependency)
    user_id = str(uuid.uuid4())
    role_str = role_enum.value
    
    # Lightweight demo user object with required attributes
    class DemoUser:
        def __init__(self, id, email, username, hashed_password, full_name, role, is_active):
            self.id = id
            self.email = email
            self.username = username
            self.hashed_password = hashed_password
            self.full_name = full_name
            self.role = role
            self.is_active = is_active
    
    user = DemoUser(
        id=user_id,
        email=f"demo_{role_str}@xyz.ai",
        username=f"demo_{role_str}",
        hashed_password="demo_hash",
        full_name=f"Demo {role_str.capitalize()}",
        role=role_enum,
        is_active=True
    )
    
    # Create access token using existing JWT creation logic
    access_token = create_access_token(
        data={"sub": user.id, "role": user.role.value},
        expires_delta=timedelta(minutes=settings.jwt_access_token_expire_minutes)
    )
    
    # Log successful demo login (non-blocking)
    try:
        audit_service = AuditService(db)
        await audit_service.log_action(
            user_id=user.id,
            user_role=user.role.value,
            action=AuditAction.LOGIN,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            success=True,
            details={"demo_login": True}
        )
    except Exception as audit_error:
        print(f"Audit log failed: {audit_error}")
    
    return LoginResponse(
        token=TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=3600
        ),
        user=UserResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active
        )
    )
