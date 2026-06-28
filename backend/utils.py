import logging
import random
import smtplib
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from passlib.context import CryptContext
from config import EMAIL_HOST_USER, EMAIL_HOST_PASSWORD

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Password Hashing
# ---------------------------------------------------------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


# ---------------------------------------------------------------------------
# Timezone Helper
# ---------------------------------------------------------------------------
def make_tz_aware(dt: Optional[datetime]) -> Optional[datetime]:
    """Attach UTC tzinfo to a naive datetime (SQLite compat)."""
    if dt is not None and dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


# ---------------------------------------------------------------------------
# Email Helpers
# ---------------------------------------------------------------------------
def _send_email(to: str, subject: str, html_body: str) -> bool:
    """Internal helper – sends one HTML email. Returns True on success."""
    if not EMAIL_HOST_USER or not EMAIL_HOST_PASSWORD:
        logger.warning("Email credentials not set; skipping send to %s", to)
        return False
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = EMAIL_HOST_USER
    msg["To"] = to
    msg.attach(MIMEText(html_body, "html"))
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as srv:
            srv.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
            srv.sendmail(EMAIL_HOST_USER, to, msg.as_string())
        return True
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", to, exc)
        return False


def send_otp_email(to: str, otp: str) -> bool:
    html = f"""
    <html><body>
      <div style="font-family:Arial,sans-serif;text-align:center;color:#333">
        <h2>Welcome to Query Genie!</h2>
        <p>Your one-time verification code is:</p>
        <p style="font-size:24px;font-weight:bold;letter-spacing:2px;color:#007BFF">{otp}</p>
        <p>Expires in 5 minutes.</p>
      </div>
    </body></html>"""
    return _send_email(to, "Your Verification Code", html)


def send_password_reset_email(to: str, otp: str) -> bool:
    html = f"""
    <html><body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:20px">
      <div style="max-width:500px;margin:auto;background:#fff;border-radius:8px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:30px;text-align:center">
          <h1 style="color:#fff;margin:0">Password Reset</h1>
        </div>
        <div style="padding:30px;text-align:center">
          <p>Your reset code:</p>
          <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#667eea">{otp}</p>
          <p style="font-size:13px;color:#666">Expires in <strong>10 minutes</strong>.</p>
        </div>
      </div>
    </body></html>"""
    return _send_email(to, "Password Reset Code – Query Genie", html)


def send_email_change_otp(to: str, otp: str, user_name: str) -> bool:
    html = f"""
    <html><body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:20px">
      <div style="max-width:500px;margin:auto;background:#fff;border-radius:8px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:30px;text-align:center">
          <h1 style="color:#fff;margin:0">Verify New Email</h1>
        </div>
        <div style="padding:30px">
          <p>Hi <strong>{user_name}</strong>,</p>
          <p>Use this code to verify your new email address:</p>
          <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#667eea;text-align:center">{otp}</p>
          <p style="font-size:13px;color:#666">Expires in <strong>5 minutes</strong>.</p>
        </div>
      </div>
    </body></html>"""
    return _send_email(to, "Verify Your New Email – Query Genie", html)


# ---------------------------------------------------------------------------
# OTP Utility
# ---------------------------------------------------------------------------
def generate_otp() -> str:
    return str(random.randint(100000, 999999))
