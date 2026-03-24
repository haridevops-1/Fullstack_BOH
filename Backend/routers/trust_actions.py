from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from dependencies import get_db, get_current_user
import models, schemas
from typing import List

router = APIRouter(prefix="/api/trust", tags=["Trust Actions"])


@router.get("/dashboard")
def dashboard(
    trust_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    incoming = (
        db.query(models.Donation)
        .filter(
            models.Donation.trust_id == trust_id, models.Donation.status == "pending"
        )
        .count()
    )
    rejected = (
        db.query(models.Donation)
        .filter(
            models.Donation.trust_id == trust_id, models.Donation.status == "rejected"
        )
        .count()
    )
    accepted = (
        db.query(models.Donation)
        .filter(
            models.Donation.trust_id == trust_id,
            models.Donation.status != "pending",
            models.Donation.status != "rejected",
        )
        .count()
    )

    return {"incoming": incoming, "accepted": accepted, "rejected": rejected}


@router.get("/donations_details")
def donations(
    trust_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return (
        db.query(models.Donation)
        .filter(models.Donation.trust_id == trust_id)
        .order_by(models.Donation.created_at.desc())
        .all()
    )


@router.get("/accepted_details")
def accepted_details(
    trust_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return (
        db.query(models.Donation)
        .filter(
            models.Donation.trust_id == trust_id,
            models.Donation.status.in_(["accepted", "reached", "picked"]),
        )
        .order_by(models.Donation.created_at.desc())
        .all()
    )


@router.get("/rejected_details")
def rejected_details(
    trust_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return (
        db.query(models.Donation)
        .filter(
            models.Donation.trust_id == trust_id, models.Donation.status == "rejected"
        )
        .order_by(models.Donation.created_at.desc())
        .all()
    )


@router.put("/donations/{id}/status")
def update_status(
    id: int,    
    status_data: schemas.StatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    donation = db.query(models.Donation).filter(models.Donation.id == id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    # Save the status
    donation.status = status_data.status

    if status_data.reject_reason is not None:
        donation.reject_reason = status_data.reject_reason

    db.commit()
    return {"message": "Donation details updated successfully"}
