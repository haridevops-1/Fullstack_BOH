from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from dependencies import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    Firstname = Column(String)
    Lastname = Column(String)
    email = Column(String, unique=True, index=True)
    mobile_number = Column(String)
    city = Column(String)
    Pincode = Column(String)
    password = Column(String)
    photo = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
