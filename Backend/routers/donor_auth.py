from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies import get_db
import models, schemas
from security_utils import hash_password, verify_password
from auth_jwt import create_access_token

# Router for Donor Login and Signup
router = APIRouter(prefix="/api/donor", tags=["Donor Auth"])

# Function to handle NEW donor registration
@router.post("/signup", response_model=schemas.UserRead)
def signup(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    print(f"LOG: New donor signup attempt for: {user_data.email}")
    
    try:
        # Check if the email is already in our database
        existing_user = db.query(models.User).filter(
            models.User.email == user_data.email
        ).first()

        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Create a new user object with the data from the frontend
        new_user = models.User(
            Firstname=user_data.Firstname,
            Lastname=user_data.Lastname,
            email=user_data.email,
            mobile_number=user_data.mobile_number,
            city=user_data.city,
            Pincode=user_data.Pincode,
            password=hash_password(user_data.password),
            photo=user_data.photo
        )

        # Add to database and save
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return new_user
    except Exception as e:
        print(f"CRITICAL: Error during signup: {e}")
        raise HTTPException(status_code=500, detail=f"Signup Error: {str(e)}")

# Function to handle donor LOGIN
@router.post("/login")
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    print(f"LOG: Donor login attempt for: {login_data.email}")

    try:
        # Find the user by their email
        user = db.query(models.User).filter(
            models.User.email == login_data.email
        ).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Verify encrypted password
        # Verify encrypted password
        if not verify_password(login_data.password, user.password):
            raise HTTPException(status_code=401, detail="Wrong password")

        # If everything is correct, send back the user details and a token
        access_token = create_access_token(data={"sub": str(user.id), "role": "donor"})
        
        return {
            "message": "Login successful",
            "access_token": access_token,
            "token_type": "bearer",
            "id": user.id,
            "role": "donor",
            "name": user.Firstname,
            "city": user.city
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"CRITICAL: Error during login: {e}")
        raise HTTPException(status_code=500, detail=f"Login Error: {str(e)}")