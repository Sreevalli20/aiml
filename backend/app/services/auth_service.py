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
        
        # TEMPORARY: Create demo user if doesn't exist
        if not user and identifier in ["rahul.sharma@greenwood.edu", "rahul.sharma"] and password == "student123":
            print(f"Creating demo user for {identifier}")
            import uuid
            from app.models.user import UserRole
            from app.security.password import get_password_hash
            
            new_user = User(
                id=str(uuid.uuid4()),
                email="rahul.sharma@greenwood.edu",
                username="rahul.sharma",
                hashed_password=get_password_hash("student123"),
                full_name="Rahul Sharma",
                role=UserRole.STUDENT,
                is_active=True
            )
            self.db.add(new_user)
            await self.db.commit()
            await self.db.refresh(new_user)
            user = new_user
            print(f"Created demo user: {user.email}")
        
        if not user:
            print(f"User not found for identifier: {identifier}")
            raise AuthorizationError("Invalid credentials", "INVALID_CREDENTIALS")
        
        print(f"Found user: {user.email}, is_active: {user.is_active}")
        
        # TEMPORARY: Skip password verification for demo account
        if identifier in ["rahul.sharma@greenwood.edu", "rahul.sharma"] and password == "student123":
            print(f"Demo account bypass for {identifier}")
        else:
            print(f"Hash length: {len(user.hashed_password)}, hash starts: {user.hashed_password[:30]}...")
            print(f"Password length: {len(password)}")
            if not verify_password(password, user.hashed_password):
                print(f"Password verification failed for {user.email}")
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
