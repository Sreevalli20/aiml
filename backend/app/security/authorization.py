from typing import Optional
from app.models.user import UserRole


class AuthorizationError(Exception):
    """Raised when authorization fails."""
    def __init__(self, message: str, code: str = "FORBIDDEN"):
        self.message = message
        self.code = code
        super().__init__(message)


# Role-based permissions
ROLE_PERMISSIONS = {
    UserRole.STUDENT: [
        "view_own_attendance",
        "ask_questions",
        "view_own_info",
    ],
    UserRole.PARENT: [
        "view_child_attendance",
        "view_child_info",
        "ask_questions",
        "request_teacher_escalation",
        "request_management_escalation",
    ],
    UserRole.TEACHER: [
        "view_assigned_students",
        "view_assigned_attendance",
        "mark_attendance",
        "update_attendance",
        "request_teacher_escalation",
    ],
    UserRole.PRINCIPAL: [
        "view_school_analytics",
        "view_all_attendance",
        "view_management_info",
        "perform_management_actions",
    ],
}


def check_role_permission(user_role: UserRole, permission: str) -> bool:
    """Check if a role has a specific permission."""
    return permission in ROLE_PERMISSIONS.get(user_role, [])


def require_permission(user_role: UserRole, permission: str) -> None:
    """Raise AuthorizationError if role doesn't have permission."""
    if not check_role_permission(user_role, permission):
        raise AuthorizationError(
            f"Role '{user_role}' does not have permission '{permission}'"
        )


def check_resource_ownership(
    user_id: str,
    user_role: UserRole,
    resource_owner_id: Optional[str] = None,
    resource_type: Optional[str] = None,
    additional_context: Optional[dict] = None
) -> bool:
    """
    Check if user has access to a resource based on ownership and relationships.
    
    This is a simplified version. In production, you would:
    - Query the database for relationships (e.g., parent-child, teacher-class)
    - Check if the user is the owner or has a valid relationship
    """
    # Principal can access everything
    if user_role == UserRole.PRINCIPAL:
        return True
    
    # If no owner specified, deny
    if resource_owner_id is None:
        return False
    
    # User owns the resource
    if user_id == resource_owner_id:
        return True
    
    # Parent checking child resource
    if user_role == UserRole.PARENT and resource_type == "student":
        # In production, check StudentParentRelationship table
        # For now, this would be a database query
        pass
    
    # Teacher checking student in their class
    if user_role == UserRole.TEACHER and resource_type == "student":
        # In production, check TeacherClassAssignment and StudentClassRelationship
        # For now, this would be a database query
        pass
    
    return False


def require_resource_ownership(
    user_id: str,
    user_role: UserRole,
    resource_owner_id: Optional[str] = None,
    resource_type: Optional[str] = None,
    additional_context: Optional[dict] = None
) -> None:
    """Raise AuthorizationError if user doesn't have resource access."""
    if not check_resource_ownership(
        user_id, user_role, resource_owner_id, resource_type, additional_context
    ):
        raise AuthorizationError(
            f"User does not have access to resource '{resource_type}'"
        )
