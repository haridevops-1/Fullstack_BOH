from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DonationCreate(BaseModel):
    name: str # The name of the donor person
    mobile_number: str
    food_name: str
    category: str
    approx_quantity: str
    address: str
    area_landmark: str
    city: str
    pincode: str
    notes: Optional[str] = None

class DonationRead(BaseModel):
    id: int
    donor_id: int
    trust_id: int
    name: str 
    mobile_number: str
    food_name: str
    category: str
    approx_quantity: str
    address: str
    area_landmark: str
    city: str
    pincode: str
    notes: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    vehicle_number: Optional[str] = None
    eta: Optional[str] = None
    proof_image: Optional[str] = None
    
    class Config:
        from_attributes = True

class StatusUpdate(BaseModel):
    status: str
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    vehicle_number: Optional[str] = None
    eta: Optional[str] = None
    proof_image: Optional[str] = None
