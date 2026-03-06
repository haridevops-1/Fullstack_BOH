from pydantic import BaseModel
from typing import Optional

class TrustProfileRead(BaseModel):
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

class TrustProfileUpdate(BaseModel):
    trust_name: Optional[str] = None
    email_id: Optional[str] = None
    mobile_number: Optional[str] = None
    trust_address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    trust_photo: Optional[str] = None
