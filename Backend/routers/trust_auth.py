from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies import get_db
import models, schemas
from cloudinary_utils import upload_image
from security_utils import hash_password, verify_password

router = APIRouter(prefix="/api/trust", tags=["Trust Auth"])

@router.post("/signup", response_model=schemas.TrustRead)
def signup(trust_data: schemas.TrustCreate, db: Session = Depends(get_db)):
    print(f"LOG: New trust signup attempt: {trust_data.trust_name} ({trust_data.email_id})")

    try:
        existing_trust = db.query(models.Trust).filter(
            models.Trust.email_id == trust_data.email_id
        ).first()

        if existing_trust:
            print(f"LOG: Trust signup REJECTED - Email {trust_data.email_id} already exists.")
            raise HTTPException(status_code=400, detail="Trust email already registered")

        new_trust = models.Trust(
            trust_name=trust_data.trust_name,
            trust_address=trust_data.trust_address,
            mobile_number=trust_data.mobile_number,
            email_id=trust_data.email_id,
            password=hash_password(trust_data.password),
            username=trust_data.username,
            city=trust_data.city,
            pincode=trust_data.pincode,
            license_number=trust_data.license_number,
            trust_photo=upload_image(trust_data.trust_photo),
            is_verified=False
        )

        db.add(new_trust)
        db.commit()
        db.refresh(new_trust)

        print(f"LOG: Trust signup SUCCESS for {trust_data.trust_name}")
        return new_trust
    except Exception as e:
        print(f"CRITICAL: Error during trust signup: {e}")
        raise HTTPException(status_code=500, detail=f"Signup Error: {str(e)}")

@router.post("/login")
def login(login_data: schemas.TrustLogin, db: Session = Depends(get_db)):
    print(f"LOG: Trust login attempt for: {login_data.email_id}")

    try:
        trust = db.query(models.Trust).filter(
            models.Trust.email_id == login_data.email_id
        ).first()

        if not trust:
            print(f"LOG: Trust login FAILED - {login_data.email_id} not found.")
            raise HTTPException(status_code=404, detail="Trust not found")

        # Verify encrypted password
        if not verify_password(login_data.password, trust.password):
            print(f"LOG: Trust login FAILED - Wrong password for {login_data.email_id}")
            raise HTTPException(status_code=401, detail="Wrong password")

        if not trust.is_verified:
            print(f"LOG: Trust login FAILED - {login_data.email_id} IS NOT VERIFIED.")
            raise HTTPException(status_code=403, detail="Your trust account is pending admin approval and cannot login yet.")

        print(f"LOG: Trust login SUCCESS for {login_data.email_id}")
        return {
            "message": "Login successful",
            "id": trust.id,
            "role": "trust",
            "name": trust.trust_name
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"CRITICAL: Error during login: {e}")
        raise HTTPException(status_code=500, detail=f"Login Error: {str(e)}")