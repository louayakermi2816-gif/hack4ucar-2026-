"""
auth.py — Authentication endpoints (register, login, me).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.models.base import get_db
from app.models.models import User
from app.services.auth import (
    hash_password, verify_password,
    create_access_token, get_current_user, require_role,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str
    institution_id: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    institution_id: str | None


class PublicRegisterRequest(RegisterRequest):
    secret_code: str | None = None

@router.post("/public-register", response_model=UserResponse)
def public_register(
    body: PublicRegisterRequest,
    db: Session = Depends(get_db),
):
    if body.role not in ("student", "researcher", "dean", "admin"):
        raise HTTPException(400, "Invalid role. President role cannot be created via public registration.")

    # Secret Code Logic for Hackathon
    if body.role == "admin" and body.secret_code != "HACK_ADMIN_2025":
        raise HTTPException(403, "Invalid authorization code for Admin role.")
    if body.role == "dean" and body.secret_code != "HACK_DEAN_2025":
        raise HTTPException(403, "Invalid authorization code for Dean role.")

    exists = db.query(User).filter(User.email == body.email).first()
    if exists:
        raise HTTPException(409, "Email already registered")

    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        full_name=body.full_name,
        role=body.role,
        institution_id=body.institution_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return UserResponse(
        id=str(user.id), email=user.email,
        full_name=user.full_name, role=user.role,
        institution_id=str(user.institution_id) if user.institution_id else None,
    )

@router.post("/register", response_model=UserResponse)
def register(
    body: RegisterRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
):
    if body.role not in ("president", "dean", "admin", "researcher", "student"):
        raise HTTPException(400, "Invalid role")

    exists = db.query(User).filter(User.email == body.email).first()
    if exists:
        raise HTTPException(409, "Email already registered")

    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        full_name=body.full_name,
        role=body.role,
        institution_id=body.institution_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return UserResponse(
        id=str(user.id), email=user.email,
        full_name=user.full_name, role=user.role,
        institution_id=str(user.institution_id) if user.institution_id else None,
    )


@router.post("/login", response_model=TokenResponse)
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Wrong email or password")

    token = create_access_token({
        "sub": user.email,
        "role": user.role,
        "institution_id": str(user.institution_id) if user.institution_id else None,
    })
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)):
    return UserResponse(
        id=str(user.id), email=user.email,
        full_name=user.full_name, role=user.role,
        institution_id=str(user.institution_id) if user.institution_id else None,
    )

class InstitutionUpdate(BaseModel):
    institution_id: str

@router.put("/me/institution", response_model=UserResponse)
def update_institution(
    body: InstitutionUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Allow Deans to switch their current active faculty session preference."""
    if user.role != "dean":
        raise HTTPException(status_code=403, detail="Only deans can switch institutions")
    
    # Verify institution exists
    from app.models.models import Institution
    inst = db.query(Institution).filter(Institution.id == body.institution_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")
        
    user.institution_id = inst.id
    db.commit()
    db.refresh(user)
    
    return UserResponse(
        id=str(user.id), email=user.email,
        full_name=user.full_name, role=user.role,
        institution_id=str(user.institution_id) if user.institution_id else None,
    )
