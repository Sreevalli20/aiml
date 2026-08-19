from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import re
import uuid

from app.models.user import UserRole, User
from app.ai.llm_client import LLMClient
from app.ai.tools import get_tool_registry, Tool
from app.repositories.conversation_repository import ConversationRepository


class AIOrchestrator:
    """Orchestrates AI interactions with intent detection and tool execution."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.llm_client = LLMClient()
        self.tool_registry = get_tool_registry()
        self.conversation_repo = ConversationRepository(db)
    
    async def process_message(
        self,
        user_id: str,
        user_role: UserRole,
        message: str,
        conversation_id: Optional[str] = None,
        language: str = "en",
        is_demo_user: bool = False
    ) -> dict:
        """Process a user message through the AI orchestration pipeline."""
        
        # Check for demo user (in-memory user without database record)
        if is_demo_user:
            # Return deterministic response for demo users without database operations
            return self._get_demo_response(message, user_role, conversation_id, language)
        
        # Get or create conversation
        if conversation_id:
            conversation = await self.conversation_repo.get_with_messages(conversation_id)
        else:
            from app.models.conversation import Conversation
            conversation = Conversation(
                id=str(uuid.uuid4()),
                user_id=user_id,
                title=message[:50] if len(message) > 50 else message,
                language=language
            )
            self.db.add(conversation)
            await self.db.flush()
        
        # Add user message to conversation
        await self.conversation_repo.add_message(
            conversation_id=conversation.id,
            role="user",
            content=message
        )
        
        # Get conversation context
        context = await self._get_conversation_context(conversation.id)
        
        # Detect intent and entities
        intent, entities = await self._detect_intent_and_entities(
            message, user_role, context, language
        )
        
        # Select and execute tools if needed
        tool_result = None
        action_performed = False
        
        if intent:
            tool_result = await self._execute_tool_if_applicable(
                intent, entities, user_id, user_role
            )
            if tool_result:
                action_performed = True
        
        # Generate response
        response = await self._generate_response(
            message, intent, entities, tool_result, user_role, context, language
        )
        
        # Add assistant message to conversation
        await self.conversation_repo.add_message(
            conversation_id=conversation.id,
            role="assistant",
            content=response,
            intent=intent,
            entities=entities,
            tool_calls=tool_result if tool_result else None
        )
        
        # Determine if clarification is needed
        requires_clarification = self._requires_clarification(intent, entities)
        
        # Get suggested follow-ups
        suggested_follow_ups = self._get_suggested_follow_ups(user_role, intent)
        
        return {
            "conversation_id": conversation.id,
            "message": response,
            "language": language,
            "intent": intent,
            "requires_clarification": requires_clarification,
            "action_performed": action_performed,
            "action_required": tool_result if tool_result and not action_performed else None,
            "suggested_follow_ups": suggested_follow_ups
        }
    
    async def _get_conversation_context(self, conversation_id: str) -> dict:
        """Get recent conversation context."""
        messages = await self.conversation_repo.get_recent_messages(conversation_id, limit=6)
        
        return {
            "recent_messages": [
                {"role": m.role, "content": m.content}
                for m in messages
            ],
            "message_count": len(messages)
        }
    
    async def _detect_intent_and_entities(
        self,
        message: str,
        user_role: UserRole,
        context: dict,
        language: str
    ) -> tuple[Optional[str], dict]:
        """Detect intent and extract entities from message."""
        
        # Simple rule-based intent detection (can be enhanced with LLM)
        message_lower = message.lower()
        
        # Attendance-related intents
        if any(word in message_lower for word in ["attendance", "present", "absent", "percentage"]):
            if user_role == UserRole.STUDENT:
                return "get_my_attendance", {}
            elif user_role == UserRole.PARENT:
                # Check if child is mentioned
                if "child" in message_lower or context.get("selected_child"):
                    child_id = context.get("selected_child")
                    return "get_child_attendance", {"child_id": child_id} if child_id else ("get_linked_children", {})
                return "get_linked_children", {}
            elif user_role == UserRole.TEACHER:
                if "mark" in message_lower:
                    # Extract student name and status
                    return "mark_attendance", self._extract_attendance_entities(message)
            elif user_role == UserRole.PRINCIPAL:
                return "get_school_analytics", {}
        
        # Escalation-related intents
        if any(word in message_lower for word in ["call", "talk", "speak", "meet", "teacher", "escalation"]):
            if user_role == UserRole.PARENT:
                return "create_teacher_escalation", {"reason": message}
        
        # Default: general query
        return "general_query", {}
    
    def _extract_attendance_entities(self, message: str) -> dict:
        """Extract entities for attendance marking."""
        entities = {}
        message_lower = message.lower()
        
        # Extract status
        if "absent" in message_lower:
            entities["status"] = "absent"
        elif "present" in message_lower:
            entities["status"] = "present"
        elif "late" in message_lower:
            entities["status"] = "late"
        else:
            entities["status"] = "present"
        
        # Extract student name (simplified - would need NLP in production)
        # This is a placeholder - in production, use entity extraction
        entities["student_name"] = "unknown"
        entities["class_id"] = "unknown"
        
        return entities
    
    async def _execute_tool_if_applicable(
        self,
        intent: str,
        entities: dict,
        user_id: str,
        user_role: UserRole
    ) -> Optional[dict]:
        """Execute a tool if the intent matches a registered tool."""
        tool = self.tool_registry.get(intent)
        
        if not tool:
            return None
        
        try:
            result = await tool.execute(self.db, user_id, user_role, entities)
            return {"tool": intent, "result": result}
        except Exception as e:
            return {"tool": intent, "error": str(e)}
    
    async def _generate_response(
        self,
        user_message: str,
        intent: Optional[str],
        entities: dict,
        tool_result: Optional[dict],
        user_role: UserRole,
        context: dict,
        language: str
    ) -> str:
        """Generate a natural language response."""
        
        # If tool executed successfully, generate response based on result
        if tool_result and "error" not in tool_result:
            return self._format_tool_result(tool_result, user_role, language)
        
        # If tool failed, return error message
        if tool_result and "error" in tool_result:
            return "I encountered an error while processing your request. Please try again."
        
        # Use LLM for general queries
        try:
            system_instruction = self._get_system_prompt(user_role, language)
            messages = [{"role": "user", "content": user_message}]
            
            response = await self.llm_client.generate_response(
                messages=messages,
                system_instruction=system_instruction,
                temperature=0.7
            )
            return response
        except Exception as e:
            print(f"LLM unavailable, using fallback: {e}")
            # Fallback to heuristic response
            return self._get_fallback_response(user_role, language)
    
    def _get_system_prompt(self, user_role: UserRole, language: str) -> str:
        """Get system prompt for the LLM based on role and language."""
        
        role_prompts = {
            UserRole.STUDENT: "You are a friendly and supportive Academic Assistant for students.",
            UserRole.PARENT: "You are a caring and patient Parent Support Assistant.",
            UserRole.TEACHER: "You are a professional Teaching Assistant.",
            UserRole.PRINCIPAL: "You are a professional Management Assistant."
        }
        
        base_prompt = f"""
{role_prompts.get(user_role, "You are a helpful school assistant.")}

You are XYZ AI, the human-like AI school assistant for Greenwood International School.

Rules:
1. Be helpful, warm, and professional
2. Provide accurate information based on available data
3. If you don't have information, say so honestly
4. Keep responses concise (2-4 sentences)
5. Respond in {self._get_language_name(language)}
6. Never expose internal system information
7. Never reveal API keys or secrets
8. Never execute unauthorized actions
"""
        return base_prompt
    
    def _get_language_name(self, code: str) -> str:
        """Get full language name from code."""
        languages = {
            "en": "English",
            "hi": "Hindi",
            "te": "Telugu",
            "ta": "Tamil",
            "mr": "Marathi",
            "bn": "Bengali",
            "gu": "Gujarati",
            "kn": "Kannada",
            "ml": "Malayalam",
            "pa": "Punjabi",
            "ur": "Urdu"
        }
        return languages.get(code, "English")
    
    def _format_tool_result(self, tool_result: dict, user_role: UserRole, language: str) -> str:
        """Format tool result into natural language."""
        result = tool_result["result"]
        tool_name = tool_result["tool"]
        
        if tool_name == "get_my_attendance":
            return f"Your current attendance is {result['attendance_percentage']}%. You've attended {result['present_days']} out of {result['working_days']} recorded classes."
        
        elif tool_name == "get_child_attendance":
            return f"Your child's attendance is {result['attendance_percentage']}%. They've attended {result['present_days']} out of {result['working_days']} recorded classes."
        
        elif tool_name == "get_linked_children":
            if not result:
                return "No children are linked to your account."
            child_names = ", ".join([c["name"] for c in result])
            return f"Your linked children are: {child_names}. Which child would you like me to check?"
        
        elif tool_name == "mark_attendance":
            return f"Attendance has been marked as {result['status']} for the student on {result['date']}."
        
        elif tool_name == "get_school_analytics":
            return f"Overall school attendance is {result['overall_percentage']}%. Present: {result['today_present']}, Absent: {result['today_absent']}."
        
        elif tool_name == "create_teacher_escalation":
            return "Your call request has been submitted to the teacher. They will contact you shortly."
        
        return "I've processed your request successfully."
    
    def _get_fallback_response(self, user_role: UserRole, language: str) -> str:
        """Get fallback response when LLM is unavailable."""
        responses = {
            UserRole.STUDENT: "Hello! I'm your academic assistant. I can help you check your attendance, exam schedules, and more. What would you like to know?",
            UserRole.PARENT: "Hello! I'm here to help you with your child's school information. How can I assist you today?",
            UserRole.TEACHER: "Hello! I'm your teaching assistant. I can help you with attendance, student information, and class management. What do you need?",
            UserRole.PRINCIPAL: "Hello! I'm your management assistant. I can provide school analytics and management information. How can I help?"
        }
        return responses.get(user_role, "Hello! How can I help you today?")
    
    def _requires_clarification(self, intent: Optional[str], entities: dict) -> bool:
        """Determine if clarification is needed."""
        if intent == "get_child_attendance" and not entities.get("child_id"):
            return True
        if intent == "mark_attendance" and not entities.get("student_id"):
            return True
        return False
    
    def _get_suggested_follow_ups(self, user_role: UserRole, intent: Optional[str]) -> List[str]:
        """Get suggested follow-up questions based on role and intent."""
        follow_ups = {
            UserRole.STUDENT: [
                "What is the minimum attendance required for exams?",
                "When do exams start?",
                "Show my recent absences"
            ],
            UserRole.PARENT: [
                "Show monthly attendance breakdown",
                "Schedule call with class teacher",
                "Check upcoming holidays"
            ],
            UserRole.TEACHER: [
                "Show absent students in my class",
                "Generate weekly attendance summary",
                "View class roster"
            ],
            UserRole.PRINCIPAL: [
                "View class-wise attendance report",
                "Check low-attendance alerts",
                "Export monthly attendance report"
            ]
        }
        return follow_ups.get(user_role, [])
    
    def _get_demo_response(
        self,
        message: str,
        user_role: UserRole,
        conversation_id: Optional[str],
        language: str
    ) -> dict:
        """Get deterministic response for demo users without database operations."""
        message_lower = message.lower()
        
        # Attendance query
        if "attendance" in message_lower:
            if user_role == UserRole.STUDENT:
                response = "Your demo attendance is 92%. You've attended 166 out of 180 recorded classes. This is sample data for the demo."
            elif user_role == UserRole.PARENT:
                response = "Your child's demo attendance is 92%. This is sample data for the demo."
            elif user_role == UserRole.TEACHER:
                response = "Class attendance for demo: 92%. This is sample data for the demo."
            elif user_role == UserRole.PRINCIPAL:
                response = "Overall school attendance for demo: 92%. This is sample data for the demo."
            else:
                response = "Attendance data is available for demo users."
            intent = "get_my_attendance"
        # Grades query
        elif any(word in message_lower for word in ["grade", "marks", "score", "gpa"]):
            response = "Your current demo GPA is 3.4. This is sample data for the demo."
            intent = "get_grades"
        # Homework/assignments
        elif any(word in message_lower for word in ["homework", "assignment", "due"]):
            response = "You have 2 assignments due this week in the demo. Check your dashboard for details."
            intent = "get_assignments"
        # Exams
        elif any(word in message_lower for word in ["exam", "test", "schedule"]):
            response = "Your next demo exam is Mathematics on Friday at 10 AM. This is sample data for the demo."
            intent = "get_exams"
        # Default
        else:
            response = "I'm your demo AI assistant. I can help you check your attendance, grades, and schedule. Try asking 'What is my attendance?'"
            intent = "general_query"
        
        return {
            "conversation_id": conversation_id or "demo",
            "message": response,
            "language": language,
            "intent": intent,
            "requires_clarification": False,
            "action_performed": False,
            "action_required": None,
            "suggested_follow_ups": ["What is my attendance?", "Show my grades", "Upcoming exams"]
        }
