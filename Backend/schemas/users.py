from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    Firstname: str
    Lastname: str
    email: str
    mobile_number: str
    city: str
    Pincode: str
    photo: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: str
    password: str
