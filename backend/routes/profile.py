import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from database import get_db
from limiter import limiter
from models import ProfileUpdateOTP, User
from schemas import (
    ChangePasswordRequest,
    SendEmailOTPRequest,
    UpdateEmailRequest,
    UpdateProfileRequest,
)
from utils import (
    generate_otp,
    get_password_hash,
    make_tz_aware,
    send_email_change_otp,
    verify_password,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.put("/api/update-profile")
@limiter.limit("10/minute")
async def update_profile(request: Request, body: UpdateProfileRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == body.userId).first()
    if not user:
        raise HTTPException(404, detail="User not found")

    # Uniqueness checks (excluding current user)
    if body.email != user.email and db.query(User).filter(User.email == body.email, User.id != body.userId).first():
        raise HTTPException(400, detail="Email already in use")
    if body.username != user.username and db.query(User).filter(User.username == body.username, User.id != body.userId).first():
        raise HTTPException(400, detail="Username already taken")
    if body.phone and body.phone != user.phone and db.query(User).filter(User.phone == body.phone, User.id != body.userId).first():
        raise HTTPException(400, detail="Phone already registered")

    user.firstName = body.firstName
    user.lastName = body.lastName
    user.username = body.username
    user.email = body.email
    user.phone = body.phone
    user.gender = body.gender
    db.commit()
    db.refresh(user)
    return {
        "success": True,
        "user": {
            "id": user.id,
            "firstName": user.firstName,
            "lastName": user.lastName,
            "username": user.username,
            "email": user.email,
            "phone": user.phone,
            "gender": user.gender,
        },
    }


@router.post("/api/change-password")
@limiter.limit("5/minute")
async def change_password(request: Request, body: ChangePasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == body.userId).first()
    if not user:
        raise HTTPException(404, detail="User not found")
    if not verify_password(body.currentPassword, user.hashed_password):
        raise HTTPException(400, detail="Current password incorrect")
    if verify_password(body.newPassword, user.hashed_password):
        raise HTTPException(400, detail="New password must differ from current")
    user.hashed_password = get_password_hash(body.newPassword)
    db.commit()
    return {"success": True, "message": "Password changed"}


@router.post("/api/send-email-change-otp")
@limiter.limit("3/minute")
async def send_email_change_otp_endpoint(request: Request, body: SendEmailOTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == body.userId).first()
    if not user:
        raise HTTPException(404, detail="User not found")
    if db.query(User).filter(User.email == body.newEmail, User.id != body.userId).first():
        raise HTTPException(400, detail="Email already in use")

    otp = generate_otp()
    db.query(ProfileUpdateOTP).filter(ProfileUpdateOTP.user_id == body.userId).delete()
    db.add(ProfileUpdateOTP(
        user_id=body.userId,
        otp=otp,
        new_email=body.newEmail,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=5),
    ))
    db.commit()
    send_email_change_otp(body.newEmail, otp, f"{user.firstName} {user.lastName}")
    return {"success": True, "message": f"OTP sent to {body.newEmail}"}


@router.put("/api/update-email")
@limiter.limit("10/minute")
async def update_email(request: Request, body: UpdateEmailRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == body.userId).first()
    if not user:
        raise HTTPException(404, detail="User not found")
    rec = db.query(ProfileUpdateOTP).filter(ProfileUpdateOTP.user_id == body.userId).first()
    if not rec:
        raise HTTPException(400, detail="OTP not found or expired")
    if datetime.now(timezone.utc) > make_tz_aware(rec.expires_at):
        db.delete(rec)
        db.commit()
        raise HTTPException(400, detail="OTP expired")
    if rec.otp != body.otp:
        raise HTTPException(400, detail="Invalid OTP")
    if rec.new_email != body.newEmail:
        raise HTTPException(400, detail="Email mismatch")

    user.email = body.newEmail
    db.delete(rec)
    db.commit()
    db.refresh(user)
    return {
        "success": True,
        "user": {
            "id": user.id,
            "email": user.email,
            "firstName": user.firstName,
            "lastName": user.lastName,
            "username": user.username,
            "phone": user.phone,
            "gender": user.gender,
        },
    }
