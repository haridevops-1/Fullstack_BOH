from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import time

from database import engine, Base
from routers import (
    donor_auth,
    donor_actions,
    donor_profile,
    trust_auth,
    trust_actions,
    trust_profile,
    admin_auth,
    admin,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # This runs when the server starts
    print("LOG: BRIDGE OF HOPE BACKEND STARTING...")
    try:
        # Important: Importing models here ensures they are registered with 'Base'
        import models

        # Create database tables if they don't exist
        Base.metadata.create_all(bind=engine)
        print("LOG: DATABASE CONNECTION SUCCESSFUL")
    except Exception as e:
        print(f"LOG: DATABASE ERROR: {e}")

    yield
    # This runs when the server stops
    print("LOG: BACKEND SHUTTING DOWN...")


app = FastAPI(title="Bridge of Hope API", lifespan=lifespan)

# Enable CORS for all
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,
)


# Request Logging Middleware (Helpful for debugging)
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    print(
        f"DEBUG: {request.method} {request.url.path} - {response.status_code} ({duration:.2f}s)"
    )
    return response


# Global Error Handler: This helps debug 500 errors but ignores normal login/signup errors
from starlette.exceptions import HTTPException as StarletteHTTPException


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # If the error is a normal "status" error (like 404 or 401), let it go through!
    if isinstance(exc, StarletteHTTPException):
        return await http_exception_handler(request, exc)

    print(f"CRITICAL ERROR on {request.url.path}: {exc}")
    return {
        "detail": f"Database or Server Error: {str(exc)}",
        "error_type": type(exc).__name__,
    }


from fastapi.exception_handlers import http_exception_handler

# Register all Routers
app.include_router(donor_auth.router)
app.include_router(donor_actions.router)
app.include_router(donor_profile.router)
app.include_router(trust_auth.router)
app.include_router(trust_actions.router)
app.include_router(trust_profile.router)
app.include_router(admin_auth.router)
app.include_router(admin.router)


@app.get("/")
def home():
    return {"message": "API is Online"}


@app.get("/health")
def health():
    return {"status": "healthy"}
