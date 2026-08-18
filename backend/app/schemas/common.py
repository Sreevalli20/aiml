from pydantic import BaseModel
from typing import Generic, TypeVar, Optional
from datetime import datetime


T = TypeVar('T')


class ApiResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    message: Optional[str] = None


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    code: Optional[str] = None
    details: Optional[dict] = None


class HealthResponse(BaseModel):
    success: bool
    status: str
    school: Optional[str] = None
    version: Optional[str] = None
    timestamp: datetime
    database_connected: bool
