from typing import Callable, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import UserRole


class Tool:
    """Represents a callable AI tool with authorization."""
    
    def __init__(
        self,
        name: str,
        description: str,
        handler: Callable,
        required_roles: list[UserRole],
        parameters: dict
    ):
        self.name = name
        self.description = description
        self.handler = handler
        self.required_roles = required_roles
        self.parameters = parameters
    
    async def execute(
        self,
        db: AsyncSession,
        user_id: str,
        user_role: UserRole,
        arguments: dict
    ) -> Any:
        """Execute the tool with authorization check."""
        if user_role not in self.required_roles:
            raise PermissionError(f"Role '{user_role}' not authorized for tool '{self.name}'")
        
        return await self.handler(db, user_id, user_role, **arguments)


class ToolRegistry:
    """Registry for AI tools."""
    
    def __init__(self):
        self._tools: Dict[str, Tool] = {}
    
    def register(self, tool: Tool) -> None:
        """Register a tool."""
        self._tools[tool.name] = tool
    
    def get(self, name: str) -> Optional[Tool]:
        """Get a tool by name."""
        return self._tools.get(name)
    
    def get_all(self) -> list[Tool]:
        """Get all registered tools."""
        return list(self._tools.values())
    
    def get_for_role(self, role: UserRole) -> list[Tool]:
        """Get tools available for a specific role."""
        return [tool for tool in self._tools.values() if role in tool.required_roles]


# Global tool registry
_registry = ToolRegistry()


def get_tool_registry() -> ToolRegistry:
    """Get the global tool registry."""
    return _registry


# Tool handlers
async def tool_get_my_attendance(
    db: AsyncSession,
    user_id: str,
    user_role: UserRole
) -> dict:
    """Get current user's attendance (student only)."""
    from app.services.attendance_service import AttendanceService
    from app.repositories.student_repository import StudentRepository
    
    student_repo = StudentRepository(db)
    attendance_service = AttendanceService(db)
    
    student = await student_repo.get_by_user_id(user_id)
    if not student:
        raise ValueError("Student profile not found")
    
    return await attendance_service.get_student_attendance(
        student.id, user_id, user_role.value
    )


async def tool_get_child_attendance(
    db: AsyncSession,
    user_id: str,
    user_role: UserRole,
    child_id: str
) -> dict:
    """Get child's attendance (parent only)."""
    from app.services.attendance_service import AttendanceService
    
    attendance_service = AttendanceService(db)
    
    # In production, verify parent-child relationship here
    return await attendance_service.get_student_attendance(
        child_id, user_id, user_role.value
    )


async def tool_get_linked_children(
    db: AsyncSession,
    user_id: str,
    user_role: UserRole
) -> list:
    """Get linked children (parent only)."""
    from app.repositories.parent_repository import ParentRepository
    from app.repositories.user_repository import UserRepository
    
    user_repo = UserRepository(db)
    parent_repo = ParentRepository(db)
    
    user = await user_repo.get_by_id(user_id)
    parent = await parent_repo.get_by_user_id(user_id)
    
    if not parent:
        raise ValueError("Parent profile not found")
    
    children = await parent_repo.get_children(parent.id)
    
    return [
        {
            "id": child.id,
            "name": child.user.full_name if child.user else "Unknown",
            "roll_number": child.roll_number
        }
        for child in children
    ]


async def tool_mark_attendance(
    db: AsyncSession,
    user_id: str,
    user_role: UserRole,
    student_id: str,
    status: str,
    class_id: str,
    remarks: str = None
) -> dict:
    """Mark attendance (teacher only)."""
    from app.services.attendance_service import AttendanceService
    from app.models.attendance import AttendanceStatus
    
    attendance_service = AttendanceService(db)
    
    attendance = await attendance_service.mark_attendance(
        student_id=student_id,
        status=AttendanceStatus(status),
        teacher_id=user_id,
        class_id=class_id,
        remarks=remarks
    )
    
    return {
        "success": True,
        "student_id": student_id,
        "status": status,
        "date": attendance.date.isoformat()
    }


async def tool_get_school_analytics(
    db: AsyncSession,
    user_id: str,
    user_role: UserRole
) -> dict:
    """Get school attendance analytics (principal only)."""
    from app.services.attendance_service import AttendanceService
    
    attendance_service = AttendanceService(db)
    return await attendance_service.get_school_analytics()


async def tool_create_teacher_escalation(
    db: AsyncSession,
    user_id: str,
    user_role: UserRole,
    reason: str,
    student_id: str = None,
    contact_number: str = None
) -> dict:
    """Create teacher escalation request (parent only)."""
    from app.services.escalation_service import EscalationService
    from app.models.escalation import EscalationType
    
    escalation_service = EscalationService(db)
    
    escalation = await escalation_service.create_escalation(
        requested_by=user_id,
        escalation_type=EscalationType.TEACHER,
        reason=reason,
        student_id=student_id,
        contact_number=contact_number
    )
    
    return {
        "success": True,
        "escalation_id": escalation.id,
        "status": escalation.status.value
    }


async def tool_create_management_escalation(
    db: AsyncSession,
    user_id: str,
    user_role: UserRole,
    reason: str,
    student_id: str = None,
    contact_number: str = None
) -> dict:
    """Create management escalation request (parent only)."""
    from app.services.escalation_service import EscalationService
    from app.models.escalation import EscalationType
    
    escalation_service = EscalationService(db)
    
    escalation = await escalation_service.create_escalation(
        requested_by=user_id,
        escalation_type=EscalationType.MANAGEMENT,
        reason=reason,
        student_id=student_id,
        contact_number=contact_number
    )
    
    return {
        "success": True,
        "escalation_id": escalation.id,
        "status": escalation.status.value
    }


async def tool_get_current_user(
    db: AsyncSession,
    user_id: str,
    user_role: UserRole
) -> dict:
    """Get current user information."""
    from app.repositories.user_repository import UserRepository
    
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    
    if not user:
        raise ValueError("User not found")
    
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role.value,
        "is_active": user.is_active
    }


async def tool_get_student_attendance(
    db: AsyncSession,
    user_id: str,
    user_role: UserRole,
    student_id: str
) -> dict:
    """Get student attendance (teacher or principal)."""
    from app.services.attendance_service import AttendanceService
    
    attendance_service = AttendanceService(db)
    
    return await attendance_service.get_student_attendance(
        student_id, user_id, user_role.value
    )


# Register tools
def register_default_tools():
    """Register all default AI tools."""
    registry = get_tool_registry()
    
    registry.register(Tool(
        name="get_my_attendance",
        description="Get the current student's attendance percentage and details",
        handler=tool_get_my_attendance,
        required_roles=[UserRole.STUDENT],
        parameters={}
    ))
    
    registry.register(Tool(
        name="get_child_attendance",
        description="Get a specific child's attendance (for parents)",
        handler=tool_get_child_attendance,
        required_roles=[UserRole.PARENT],
        parameters={"child_id": {"type": "string", "required": True}}
    ))
    
    registry.register(Tool(
        name="get_linked_children",
        description="Get list of linked children (for parents)",
        handler=tool_get_linked_children,
        required_roles=[UserRole.PARENT],
        parameters={}
    ))
    
    registry.register(Tool(
        name="mark_attendance",
        description="Mark attendance for a student (for teachers)",
        handler=tool_mark_attendance,
        required_roles=[UserRole.TEACHER],
        parameters={
            "student_id": {"type": "string", "required": True},
            "status": {"type": "string", "required": True},
            "class_id": {"type": "string", "required": True},
            "remarks": {"type": "string", "required": False}
        }
    ))
    
    registry.register(Tool(
        name="get_school_analytics",
        description="Get school-wide attendance analytics (for principals)",
        handler=tool_get_school_analytics,
        required_roles=[UserRole.PRINCIPAL],
        parameters={}
    ))
    
    registry.register(Tool(
        name="create_teacher_escalation",
        description="Request a call from a teacher (for parents)",
        handler=tool_create_teacher_escalation,
        required_roles=[UserRole.PARENT],
        parameters={
            "reason": {"type": "string", "required": True},
            "student_id": {"type": "string", "required": False},
            "contact_number": {"type": "string", "required": False}
        }
    ))
    
    registry.register(Tool(
        name="create_management_escalation",
        description="Request a call from school management (for parents)",
        handler=tool_create_management_escalation,
        required_roles=[UserRole.PARENT],
        parameters={
            "reason": {"type": "string", "required": True},
            "student_id": {"type": "string", "required": False},
            "contact_number": {"type": "string", "required": False}
        }
    ))
    
    registry.register(Tool(
        name="get_current_user",
        description="Get current user information (all roles)",
        handler=tool_get_current_user,
        required_roles=[UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER, UserRole.PRINCIPAL],
        parameters={}
    ))
    
    registry.register(Tool(
        name="get_student_attendance",
        description="Get a specific student's attendance (for teachers and principals)",
        handler=tool_get_student_attendance,
        required_roles=[UserRole.TEACHER, UserRole.PRINCIPAL],
        parameters={"student_id": {"type": "string", "required": True}}
    ))


# Initialize tools on import
register_default_tools()
