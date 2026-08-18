from fastapi import APIRouter
from app.api import auth, chat, attendance, escalation, health, debug

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["attendance"])
api_router.include_router(escalation.router, prefix="/escalations", tags=["escalations"])
api_router.include_router(health.router, tags=["health"])
api_router.include_router(debug.router, prefix="/debug", tags=["debug"])
