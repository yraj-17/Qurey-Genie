import os
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()

GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
EMAIL_HOST_USER: str = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD: str = os.getenv("EMAIL_HOST_PASSWORD", "")


def validate_environment() -> None:
    """Raise on missing critical env vars; warn on optional ones."""
    if not GROQ_API_KEY:
        raise RuntimeError("Missing critical env var: GROQ_API_KEY")
    if not EMAIL_HOST_USER or not EMAIL_HOST_PASSWORD:
        logger.warning("Email credentials missing – OTP emails disabled")
    logger.info("Environment variables validated")
