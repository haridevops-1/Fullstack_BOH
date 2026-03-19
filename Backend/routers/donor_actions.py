from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from dependencies import get_db, get_current_user
import models, schemas
import datetime
from typing import List

router = APIRouter(prefix="/api/donor", tags=["Donor Actions"])

@router.get("/dashboard")
def dashboard(donor_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    total = db.query(models.Donation).filter(models.Donation.donor_id == donor_id).count()
    pending = db.query(models.Donation).filter(models.Donation.donor_id == donor_id, models.Donation.status == "pending").count()
    rejected = db.query(models.Donation).filter(models.Donation.donor_id == donor_id, models.Donation.status == "rejected").count()
    accepted = db.query(models.Donation).filter(models.Donation.donor_id == donor_id, models.Donation.status != "pending", models.Donation.status != "rejected").count()
    
    return {
        "total_donations": total,
        "pending": pending,
        "accepted": accepted,
        "rejected": rejected
    }

@router.get("/all_trusts")
def all_trusts(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    print("LOG: Someone is searching for all [Verified Trusts]...")
    trusts = db.query(models.Trust).filter(models.Trust.is_verified == True).all()
    print(f"LOG: Found {len(trusts)} verified trusts in the database.")
    return trusts

@router.post("/new_donation")
def create_donation(trust_id: int, donor_id: int, donation_data: schemas.DonationCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    new_donation = models.Donation(
        donor_id=donor_id,
        trust_id=trust_id,
        name=donation_data.name,
        mobile_number=donation_data.mobile_number,
        food_name=donation_data.food_name,
        category=donation_data.category,
        approx_quantity=donation_data.approx_quantity,
        address=donation_data.address,
        area_landmark=donation_data.area_landmark,
        city=donation_data.city,
        pincode=donation_data.pincode,
        notes=donation_data.notes,
        scheduled_time=donation_data.scheduled_time,
        status="pending",
        created_at=datetime.datetime.now()
    )
    db.add(new_donation)
    db.commit()
    db.refresh(new_donation)
    return new_donation

@router.get("/donations")
def get_donations(donor_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    results = db.query(models.Donation, models.Trust.trust_name).join(
        models.Trust, models.Donation.trust_id == models.Trust.id
    ).filter(models.Donation.donor_id == donor_id).order_by(models.Donation.created_at.desc()).all()
    
    donations_list = []
    for donation, trust_name in results:
        d_dict = {c.name: getattr(donation, c.name) for c in donation.__table__.columns}
        d_dict["trust_name"] = trust_name
        donations_list.append(d_dict)
    
    return donations_list

@router.get("/donations/{id}")
def get_donation_detail(id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = db.query(models.Donation, models.Trust.trust_name).join(
        models.Trust, models.Donation.trust_id == models.Trust.id
    ).filter(models.Donation.id == id).first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Donation not found")
        
    donation, trust_name = result
    d_dict = {c.name: getattr(donation, c.name) for c in donation.__table__.columns}
    d_dict["trust_name"] = trust_name
    return d_dict


