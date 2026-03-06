from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies import get_db
import models, schemas

# We create a router to handle all "Donor Profile" related links
router = APIRouter(prefix="/api/donor/profile", tags=["Donor Profile"])

# This link GETS the donor's information using their ID
@router.get("/update")
def get_profile(donor_id: int, db: Session = Depends(get_db)):
    # Look for the user in the database
    user = db.query(models.User).filter(models.User.id == donor_id).first()
    
    # If we can't find them, send an error
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Send the user data back to the frontend
    return user

# This link UPDATES the donor's information
@router.put("/update")
def update_profile(donor_id: int, profile_data: schemas.DonorProfileUpdate, db: Session = Depends(get_db)):
    # Find the user first
    user = db.query(models.User).filter(models.User.id == donor_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # If the frontend sent a neue name, email, etc., update it in the database
    if profile_data.Firstname: user.Firstname = profile_data.Firstname
    if profile_data.Lastname: user.Lastname = profile_data.Lastname
    if profile_data.email: user.email = profile_data.email
    if profile_data.mobile_number: user.mobile_number = profile_data.mobile_number
    if profile_data.city: user.city = profile_data.city
    if profile_data.Pincode: user.Pincode = profile_data.Pincode
    if profile_data.photo: user.photo = profile_data.photo
    
    # Save the changes to the database
    db.commit()
    
    return {"message": "Profile updated successfully!"}
