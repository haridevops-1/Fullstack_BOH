from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from dependencies import get_db, get_current_user
import models, schemas
from cloudinary_utils import upload_image
from typing import List

router = APIRouter(prefix="/api/trust", tags=["Trust Actions"])

@router.get("/dashboard")
def dashboard(trust_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    incoming = db.query(models.Donation).filter(models.Donation.trust_id == trust_id, models.Donation.status == "pending").count()
    rejected = db.query(models.Donation).filter(models.Donation.trust_id == trust_id, models.Donation.status == "rejected").count()
    accepted = db.query(models.Donation).filter(models.Donation.trust_id == trust_id, models.Donation.status != "pending", models.Donation.status != "rejected").count()
    
    return {
        "incoming": incoming,
        "accepted": accepted,
        "rejected": rejected
    }

@router.get("/donations_details")
def donations(trust_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(models.Donation).filter(models.Donation.trust_id == trust_id).order_by(models.Donation.created_at.desc()).all()

@router.get("/accepted_details")
def accepted_details(trust_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(models.Donation).filter(
        models.Donation.trust_id == trust_id, 
        models.Donation.status.in_(["accepted", "reached", "picked"])
    ).order_by(models.Donation.created_at.desc()).all()

@router.get("/rejected_details")
def rejected_details(trust_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(models.Donation).filter(
        models.Donation.trust_id == trust_id, 
        models.Donation.status == "rejected"
    ).order_by(models.Donation.created_at.desc()).all()

@router.put("/donations/{id}/status")
def update_status(id: int, status_data: schemas.StatusUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    donation = db.query(models.Donation).filter(models.Donation.id == id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    # Save the status and tracking info
    donation.status = status_data.status
    
    if status_data.driver_name is not None:
        donation.driver_name = status_data.driver_name
    if status_data.driver_phone is not None:
        donation.driver_phone = status_data.driver_phone
    if status_data.vehicle_number is not None:
        donation.vehicle_number = status_data.vehicle_number
    if status_data.eta is not None:
        donation.eta = status_data.eta
    if status_data.proof_image is not None:
        donation.proof_image = upload_image(status_data.proof_image)
        
    db.commit()
    return {"message": "Donation details updated successfully"}


