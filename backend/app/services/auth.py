"""
auth.py — Password hashing + JWT token management.

How it works:
1. User registers → password gets hashed with bcrypt → stored in DB
2. User logs in → password checked against hash → JWT token returned
3. Every request → JWT token verified → user identity extracted
"""
import os
from datetime import datetime, timezone, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.models.base import get_db
from app.models.models import User

# ── Config ────────────────────────────────────────────────────────────────

# SECRET_KEY signs the JWT tokens — if someone knows this, they can forge tokens
# In production, set this as an environment variable
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "hack4ucar-super-secret-key-change-in-production")

# Algorithm used to sign the token (HS256 = HMAC with SHA-256)
ALGORITHM = "HS256"

# Token expires after 8 hours — user must log in again after that
ACCESS_TOKEN_EXPIRE_HOURS = 8

# ── Password Hashing ─────────────────────────────────────────────────────

# CryptContext handles bcrypt hashing automatically
# bcrypt adds a random "salt" so even identical passwords produce different hashes
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Convert plain text password to bcrypt hash."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check if a plain password matches the stored hash."""
    return pwd_context.verify(plain_password, hashed_password)


# ── JWT Token ─────────────────────────────────────────────────────────────

# OAuth2PasswordBearer tells FastAPI where to find the token
# The frontend sends it in the header: Authorization: Bearer <token>
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT token with the given data.
    
    Example payload:
    {
        "sub": "admin@ucar.tn",       # subject (who the token is for)
        "role": "admin",               # their role
        "institution_id": null,        # their institution (for deans)
        "exp": 1714500000              # expiration timestamp
    }
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Decode and verify a JWT token. Raises exception if invalid/expired."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ── FastAPI Dependency ────────────────────────────────────────────────────

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency — extracts the current user from the JWT token.
    
    Usage in any route:
        @router.get("/something")
        def my_route(user: User = Depends(get_current_user)):
            print(user.email, user.role)
    """
    payload = decode_access_token(token)
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    return user


# ── Role Checker ──────────────────────────────────────────────────────────

def require_role(*allowed_roles: str):
    """
    Factory that creates a dependency to restrict access by role.
    
    Usage:
        @router.post("/upload", dependencies=[Depends(require_role("admin"))])
        def upload_file(...):
            ...
        
        @router.get("/overview", dependencies=[Depends(require_role("president", "admin"))])
        def overview(...):
            ...
    """
    def role_checker(user: User = Depends(get_current_user)):
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {', '.join(allowed_roles)}. Your role: {user.role}",
            )
        return user
    return role_checker
