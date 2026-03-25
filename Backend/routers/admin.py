from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from dependencies import get_db, get_current_user
import models, schemas
from typing import List

router = APIRouter(prefix="/api/admin", tags=["Admin Actions"])


@router.get("/stats")
def stats(
    db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    # Simple count query for each database table
    # We count as pending if is_verified is either False or NULL
    pendingRes = db.query(models.Trust).filter(models.Trust.is_verified != True).count()

    # Count of trusts already approved
    verifiedRes = (
        db.query(models.Trust).filter(models.Trust.is_verified == True).count()
    )

    # Count of total donors (users table)
    donorsRes = db.query(models.User).count()

    # Count of total donations (food_form table)
    donationsRes = db.query(models.Donation).count()

    return {
        "total_pending_trusts": pendingRes,
        "verified_trusts": verifiedRes,
        "total_donors": donorsRes,
        "total_donations": donationsRes,
        "total_trusts": pendingRes + verifiedRes,
    }


@router.get("/pending_trusts")
def get_pending_trusts(
    db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    # Find all trusts that are NOT yet verified (includes False and NULL)
    return db.query(models.Trust).filter(models.Trust.is_verified != True).all()


@router.put("/verify_trust/{id}")
def verify_trust(
    id: int,
    action: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    trust = db.query(models.Trust).filter(models.Trust.id == id).first()
    if not trust:
        raise HTTPException(status_code=404, detail="Trust not found")

    if action == "approve":
        trust.is_verified = True
    else:
        db.delete(trust)

    db.commit()
    return {"message": f"Trust {action}ed successfully"}


@router.get("/all_donors")
def get_all_donors(
    db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    # Simple list of all registered users (donors)
    return db.query(models.User).all()
