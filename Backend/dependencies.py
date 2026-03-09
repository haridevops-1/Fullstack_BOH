import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic_settings import BaseSettings

# 1. Configuration Setup
class Settings(BaseSettings):
    DATABASE_URL: str
    class Config:
        env_file = ".env"

try:
    settings = Settings()
    SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL
except Exception:
    SQLALCHEMY_DATABASE_URL = ""
    print("LOG: WARNING - DATABASE_URL not found in .env")

# 2. Database Engine Setup
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    pool_pre_ping=True, 
    pool_recycle=3600,
    connect_args={"connect_timeout": 10}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 3. Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 4. Dependency to verify JWT Tokens
from fastapi import HTTPException, Header
import auth_utils

def get_current_user(authorization: str = Header(None)):
    """A helper to check if a valid JWT token is provided in the headers."""
    if authorization is None:
        raise HTTPException(status_code=401, detail="No authorization header found")
    
    # Header usually comes as "Bearer <token>"
    try:
        token = authorization.split(" ")[1]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token format")

    user_data = auth_utils.decode_access_token(token)
    if user_data is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return user_data
