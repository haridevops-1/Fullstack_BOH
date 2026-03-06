from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies import get_db
import models, schemas

# Router for Trust Profile actions
router = APIRouter(prefix="/api/trust/profile", tags=["Trust Profile"])

# Get profile details for a specific Trust
@router.get("/")
def get_profile(trust_id: int, db: Session = Depends(get_db)):
    # Look for the trust in our database
    trust = db.query(models.Trust).filter(models.Trust.id == trust_id).first()
    
    # If not found, send an error message
    if not trust:
        raise HTTPException(status_code=404, detail="Trust not found")
        
    return trust

# Update profile details for a specific Trust
@router.put("/update")
def update_profile(trust_id: int, profile_data: schemas.TrustProfileUpdate, db: Session = Depends(get_db)):
    # Find the trust first
    trust = db.query(models.Trust).filter(models.Trust.id == trust_id).first()
    if not trust:
        raise HTTPException(status_code=404, detail="Trust not found")
    
    # Update the fields that were sent from the frontend
    if profile_data.trust_name: trust.trust_name = profile_data.trust_name
    if profile_data.email_id: trust.email_id = profile_data.email_id
    if profile_data.mobile_number: trust.mobile_number = profile_data.mobile_number
    if profile_data.trust_address: trust.trust_address = profile_data.trust_address
    if profile_data.city: trust.city = profile_data.city
    if profile_data.pincode: trust.pincode = profile_data.pincode
    if profile_data.trust_photo: trust.trust_photo = profile_data.trust_photo
    
    # Save the changes to the database
    db.commit()
    
    return {"message": "Trust profile updated successfully"}
