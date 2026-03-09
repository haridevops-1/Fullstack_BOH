from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
import auth_utils

router = APIRouter(prefix="/api/admin", tags=["Admin Auth"])

# Create a model for the incoming login data
class AdminLogin(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(login_data: AdminLogin):
    print(f"LOG: Admin login attempt for: {login_data.email}")
    
    # We use hardcoded credentials for the Super Admin
    if login_data.email == "admin.bridgeofhope@gmail.com" and login_data.password == "admin123":
        print("LOG: Admin login successful!")
        
        # Create a JWT token for admin
        access_token = auth_utils.create_access_token(data={"id": 1, "role": "admin"})

        return {
            "message": "Admin Login Successful",
            "access_token": access_token,
            "token_type": "bearer",
            "id": 1,
            "role": "admin",
            "name": "Super Admin"
        }

    print("LOG: Admin login failed - invalid credentials.")
    raise HTTPException(status_code=401, detail="Invalid admin credentials")