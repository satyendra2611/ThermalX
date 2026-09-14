import random
from datetime import datetime, timedelta

import httpx
from jose import jwt
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.user import User

settings = get_settings()

# In-memory OTP store — suitable for hackathon MVP/demo.
_otp_store: dict[str, str] = {}


def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    return jwt.encode(
        {
            "sub": user_id,
            "exp": expire,
        },
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def decode_token(token: str) -> str | None:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        return payload.get("sub")

    except Exception:
        return None


def send_otp(phone: str) -> None:
    """Generate, store and send OTP."""

    phone = phone.strip()

    # Always generate a real 6-digit OTP
    otp = str(random.randint(100000, 999999))

    # Store OTP temporarily
    _otp_store[phone] = otp

    print("\n====================================")
    print("[SkillBridge OTP GENERATED]")
    print(f"Phone: {phone}")
    print(f"OTP: {otp}")
    print("====================================\n")

    # If TextBee is not configured, use terminal OTP
    if not settings.TEXTBEE_API_KEY or not settings.TEXTBEE_DEVICE_ID:
        print(
            "[SkillBridge SMS] TextBee not configured. "
            "Use the OTP shown above for demo."
        )
        return

    try:
        url = (
            "https://api.textbee.dev/api/v1/gateway/devices/"
            f"{settings.TEXTBEE_DEVICE_ID}/send-sms"
        )

        response = httpx.post(
            url,
            headers={
                "x-api-key": settings.TEXTBEE_API_KEY,
                "Content-Type": "application/json",
            },
            json={
                "recipients": [phone],
                "message": (
                    f"Your SkillBridge AI verification code is {otp}. "
                    "Do not share this code with anyone."
                ),
            },
            timeout=30.0,
        )

        print(
            f"[SkillBridge SMS] TextBee Status: "
            f"{response.status_code}"
        )

        print(
            f"[SkillBridge SMS] TextBee Response: "
            f"{response.text}"
        )

        response.raise_for_status()

        print("[SkillBridge SMS] OTP sent successfully!")

    except Exception as error:
        print(
            f"[SkillBridge SMS ERROR] Could not send SMS: {error}"
        )

        print(
            "[SkillBridge OTP FALLBACK] "
            f"Use this OTP for demo: {otp}"
        )


def verify_otp(phone: str, otp: str) -> bool:
    phone = phone.strip()
    otp = otp.strip()

    expected = _otp_store.get(phone)

    print(
        f"[SkillBridge Verify] "
        f"Phone: {phone} | "
        f"Entered OTP: {otp} | "
        f"Expected OTP: {expected}"
    )

    if expected is not None and expected == otp:
        # Remove OTP after successful verification
        del _otp_store[phone]
        return True

    return False


def get_or_create_user_by_phone(
    db: Session,
    phone: str,
) -> User:
    phone = phone.strip()

    user = db.query(User).filter(
        User.phone == phone
    ).first()

    if user:
        return user

    user = User(
        phone=phone,
        auth_provider="mobile",
        name="New Learner",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def get_or_create_user_by_email(
    db: Session,
    email: str,
    name: str | None = None,
) -> User:
    email = email.strip().lower()

    user = db.query(User).filter(
        User.email == email
    ).first()

    if user:
        return user

    user = User(
        email=email,
        name=name or "New Learner",
        auth_provider="google",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user