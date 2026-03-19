from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

# Load environment variables
# Load environment variables, force override if already set
load_dotenv(override=True)

# Get database URL
DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback if DATABASE_URL is missing
if not DATABASE_URL:
    print("DATABASE_URL not found, using local SQLite database")
    DATABASE_URL = "sqlite:///./fallback.db"

# Create engine
engine = create_engine(DATABASE_URL)

# Create session
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

# Base class for models
Base = declarative_base()