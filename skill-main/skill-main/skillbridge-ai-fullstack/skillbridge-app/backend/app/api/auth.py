from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.auth import GoogleAuthRequest, SendOtpRequest, VerifyOtpRequest, TokenResponse
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/google", response_model=TokenResponse)
def google_auth(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    # NOTE: In production, verify payload.id_token against Google's tokeninfo
    # endpoint before trusting the email it contains.
    demo_email = "learner@example.com"
    user = auth_service.get_or_create_user_by_email(db, demo_email, name="Learner")
    token = auth_service.create_access_token(user.id)
    return {"user": user, "token": token}


@router.post("/send-otp")
def send_otp(payload: SendOtpRequest):
    auth_service.send_otp(payload.phone)
    return {"sent": True}


@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(payload: VerifyOtpRequest, db: Session = Depends(get_db)):
    if not auth_service.verify_otp(payload.phone, payload.otp):
        raise HTTPException(status_code=400, detail="Invalid OTP")
    user = auth_service.get_or_create_user_by_phone(db, payload.phone)
    token = auth_service.create_access_token(user.id)
    return {"user": user, "token": token}
