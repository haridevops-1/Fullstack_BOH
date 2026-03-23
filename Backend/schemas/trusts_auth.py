from pydantic import BaseModel
from typing import Optional

class TrustCreate(BaseModel):
    trust_name: str
    trust_address: str
    mobile_number: str
    email_id: str
    password: str
    username: str
    city: str
    pincode: str
    license_number: str
    trust_photo: Optional[str] = None

class TrustRead(BaseModel):
    id: int
    trust_name: str
    trust_address: str
    mobile_number: str
    email_id: str
    username: str
    city: str
    pincode: str
    is_verified: bool
    license_number: str
    trust_photo: Optional[str] = None
    
    class Config:
        from_attributes = True

class TrustLogin(BaseModel):
    email_id: str
    password: str
