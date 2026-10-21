import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET is missing in .env")
ALGORITHM = "HS256"
TOKEN_HOURS = 12

bearer = HTTPBearer(auto_error=False)


def hash_password(password):
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def check_password(password, hashed):
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


def make_token(user):
    payload = {
        "sub": user["_id"],
        "role": user["role"],
        "school_id": user.get("school_id"),
        "student_id": user.get("student_id"),
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)


def decode_token(token):
    """Returns a user dict, or None if the token is invalid or expired."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None
    return {
        "username": payload["sub"],
        "role": payload["role"],
        "school_id": payload.get("school_id"),
        "student_id": payload.get("student_id"),
    }


def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)):
    if creds is None:
        raise HTTPException(status_code=401, detail="Login required")
    user = decode_token(creds.credentials)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user