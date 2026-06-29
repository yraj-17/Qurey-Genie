import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from database import get_db
from limiter import limiter
from models import OTP, PasswordResetOTP, User
from schemas import (
    ForgotPasswordRequest,
    OtpRequest,
    ResetPasswordRequest,
    UserCreate,
    UserLogin,
    VerifyResetOTPRequest,
)
from utils import (
    generate_otp,
    get_password_hash,
    make_tz_aware,
    send_otp_email,
    send_password_reset_email,
    verify_password,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/api/send-otp")
@limiter.limit("3/minute")
async def send_signup_otp(request: Request, body: OtpRequest, db: Session = Depends(get_db)):
    otp = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    db.query(OTP).filter(OTP.email == body.email).delete()
    db.add(OTP(email=body.email, otp=otp, expires_at=expires_at))
    db.commit()
    sent = send_otp_email(body.email, otp)
    logger.info("OTP for %s: %s", body.email, otp)
    return {"success": True, "message": "OTP sent" if sent else "OTP generated (email unavailable)"}


@router.post("/api/signup", status_code=201)
@limiter.limit("5/hour")
async def signup(request: Request, body: UserCreate, db: Session = Depends(get_db)):
    stored = db.query(OTP).filter(OTP.email == body.email).first()
    if not stored:
        raise HTTPException(400, detail="OTP not requested or expired")
    if datetime.now(timezone.utc) > make_tz_aware(stored.expires_at):
        db.delete(stored)
        db.commit()
        raise HTTPException(400, detail="OTP expired")
    if stored.otp != body.otp:
        raise HTTPException(400, detail="Invalid OTP")
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(400, detail="Email already registered")
    if body.phone and db.query(User).filter(User.phone == body.phone).first():
        raise HTTPException(400, detail="Phone already registered")
    if db.query(User).filter(User.username == body.username).first():
        raise HTTPException(400, detail="Username already taken")

    db.add(User(
        email=body.email,
        phone=body.phone,
        firstName=body.firstName,
        lastName=body.lastName,
        gender=body.gender,
        username=body.username,
        hashed_password=get_password_hash(body.password),
    ))
    db.delete(stored)
    db.commit()
    return {"success": True, "message": "User created"}


@router.post("/api/login")
@limiter.limit("10/minute")
async def login(request: Request, body: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.email == body.identifier) | (User.username == body.identifier)
    ).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(401, detail="Incorrect credentials")
    return {
        "success": True,
        "user": {
            "id": user.id,
            "email": user.email,
            "phone": user.phone,
            "firstName": user.firstName,
            "lastName": user.lastName,
            "username": user.username,
            "gender": user.gender,
        },
    }


@router.post("/api/forgot-password")
@limiter.limit("3/minute")
async def forgot_password(request: Request, body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    # Always return the same message to prevent user enumeration
    if not user:
        return {"success": True, "message": "If that email exists, a reset code has been sent."}

    otp = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    db.query(PasswordResetOTP).filter(PasswordResetOTP.email == body.email).delete()
    db.add(PasswordResetOTP(email=body.email, otp=otp, expires_at=expires_at))
    db.commit()
    send_password_reset_email(body.email, otp)
    logger.info("Password reset OTP for %s: %s", body.email, otp)
    return {"success": True, "message": "Reset code sent (if account exists)"}


@router.post("/api/verify-reset-otp")
@limiter.limit("5/minute")
async def verify_reset_otp(request: Request, body: VerifyResetOTPRequest, db: Session = Depends(get_db)):
    stored = db.query(PasswordResetOTP).filter(PasswordResetOTP.email == body.email).first()
    if not stored:
        raise HTTPException(400, detail="Reset code not found or expired")
    if datetime.now(timezone.utc) > make_tz_aware(stored.expires_at):
        db.delete(stored)
        db.commit()
        raise HTTPException(400, detail="Reset code expired")
    if stored.otp != body.otp:
        raise HTTPException(400, detail="Invalid reset code")
    return {"success": True, "message": "Reset code verified"}


@router.post("/api/reset-password")
@limiter.limit("5/minute")
async def reset_password(request: Request, body: ResetPasswordRequest, db: Session = Depends(get_db)):
    stored = db.query(PasswordResetOTP).filter(PasswordResetOTP.email == body.email).first()
    if not stored:
        raise HTTPException(400, detail="Reset code not found or expired")
    if datetime.now(timezone.utc) > make_tz_aware(stored.expires_at):
        db.delete(stored)
        db.commit()
        raise HTTPException(400, detail="Reset code expired")
    if stored.otp != body.otp:
        raise HTTPException(400, detail="Invalid reset code")

    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        raise HTTPException(404, detail="User not found")

    user.hashed_password = get_password_hash(body.new_password)
    db.delete(stored)
    db.commit()
    return {"success": True, "message": "Password reset successfully"}


@router.post("/api/resend-reset-otp")
@limiter.limit("3/minute")
async def resend_reset_otp(request: Request, body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        return {"success": True, "message": "If that email exists, a new code has been sent."}

    existing = db.query(PasswordResetOTP).filter(PasswordResetOTP.email == body.email).first()
    if existing:
        age = datetime.now(timezone.utc) - make_tz_aware(existing.created_at)
        if age < timedelta(minutes=1):
            wait = 60 - int(age.total_seconds())
            return {"success": False, "message": f"Wait {wait}s before requesting a new code"}

    otp = generate_otp()
    db.query(PasswordResetOTP).filter(PasswordResetOTP.email == body.email).delete()
    db.add(PasswordResetOTP(email=body.email, otp=otp, expires_at=datetime.now(timezone.utc) + timedelta(minutes=10)))
    db.commit()
    send_password_reset_email(body.email, otp)
    return {"success": True, "message": "New reset code sent"}
