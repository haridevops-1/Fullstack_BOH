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
