from pydantic import BaseModel
from typing import Optional


class DonorProfileUpdate(BaseModel):
    Firstname: Optional[str] = None
    Lastname: Optional[str] = None
    email: Optional[str] = None
    mobile_number: Optional[str] = None
    city: Optional[str] = None
    Pincode: Optional[str] = None
    photo: Optional[str] = None  # Base64 data
