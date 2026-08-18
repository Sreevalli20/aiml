from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.db import init_db
from app.api import api_router
from app.middleware import setup_cors, RequestLoggingMiddleware, RateLimitMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup
    print(f"Starting {settings.app_name} v{settings.app_version}...")
    print(f"Debug mode: {settings.debug}")
    
    # Initialize database (creates tables if they don't exist)
    # Always run as fallback if Alembic migrations fail
    try:
        await init_db()
        print("Database initialized")
    except Exception as e:
        print(f"Database initialization failed: {e}")
        # Continue anyway - migrations might have handled it
    
    yield
    
    # Shutdown
    print("Shutting down...")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Human-like AI School Assistant Backend",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None
)

# Setup middleware
setup_cors(app)
app.add_middleware(RequestLoggingMiddleware)

# Only add rate limiting in production or if configured
if not settings.debug:
    app.add_middleware(RateLimitMiddleware, calls=100, period=60)

# Include API routes
app.include_router(api_router, prefix="/api/v1")


# Root endpoint
@app.get("/")
async def root():
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "docs": "/docs" if settings.debug else "disabled"
    }


# Exception handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    correlation_id = getattr(request.state, "correlation_id", "unknown")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail,
            "correlation_id": correlation_id
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    correlation_id = getattr(request.state, "correlation_id", "unknown")
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": "Validation error",
            "details": exc.errors(),
            "correlation_id": correlation_id
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    correlation_id = getattr(request.state, "correlation_id", "unknown")
    
    if settings.debug:
        # Return full error details in debug mode
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": str(exc),
                "type": type(exc).__name__,
                "correlation_id": correlation_id
            }
        )
    else:
        # Return generic error in production
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "Internal server error",
                "correlation_id": correlation_id
            }
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
