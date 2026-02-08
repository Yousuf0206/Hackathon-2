"""
Authentication API endpoints.
T025-T026: Register and login endpoints with JWT issuance.
T031: Input validation and error handling.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import Annotated
from pydantic.functional_validators import AfterValidator
from sqlmodel import Session, select
from uuid import UUID
import re

from database import get_session
from models.user import User
from auth.password import hash_password, verify_password
from auth.jwt import create_access_token


router = APIRouter()


class RegisterRequest(BaseModel):
    """Registration request payload."""
    login_name: str = Field(min_length=3, max_length=30)
    name: str
    father_name: str
    email: str | None = None
    phone: str | None = None
    biodata: str | None = None
    password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    """Login request payload."""
    login_name: str
    password: str


class UserResponse(BaseModel):
    """User response without password."""
    id: str
    login_name: str
    name: str
    email: str | None = None
    created_at: str


class AuthResponse(BaseModel):
    """Authentication response with user and token."""
    user: UserResponse
    token: str


def validate_email(email: str) -> bool:
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_login_name(login_name: str) -> bool:
    """Validate login_name format: alphanumeric + underscore, 3-30 chars."""
    pattern = r'^[a-zA-Z0-9_]{3,30}$'
    return re.match(pattern, login_name) is not None


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(
    request: RegisterRequest,
    session: Session = Depends(get_session)
):
    """
    Register a new user account.
    - Validates login_name format and uniqueness
    - Validates optional email format
    - Hashes password
    - Creates user with all fields
    - Generates JWT with user_id in sub claim
    - Returns 201 with user and token
    """
    # Validate login_name format
    if not validate_login_name(request.login_name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Login name must be 3-30 characters, alphanumeric and underscore only"
        )

    # Validate email format if provided
    if request.email and not validate_email(request.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )

    # Validate password length
    if len(request.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters"
        )

    # Check if login_name already exists
    existing_user = session.exec(
        select(User).where(User.login_name == request.login_name.lower())
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Login name already taken"
        )

    # Check if email already exists (if provided)
    if request.email:
        existing_email = session.exec(
            select(User).where(User.email == request.email)
        ).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )

    # Hash password
    password_hash = hash_password(request.password)

    # Create new user
    new_user = User(
        login_name=request.login_name.lower(),
        name=request.name,
        father_name=request.father_name,
        email=request.email,
        phone=request.phone,
        biodata=request.biodata,
        password_hash=password_hash
    )

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    # Generate JWT token
    token = create_access_token(str(new_user.id))

    # Return user and token
    return AuthResponse(
        user=UserResponse(
            id=str(new_user.id),
            login_name=new_user.login_name,
            name=new_user.name,
            email=new_user.email,
            created_at=new_user.created_at.isoformat()
        ),
        token=token
    )


@router.post("/login", response_model=AuthResponse)
def login(
    request: LoginRequest,
    session: Session = Depends(get_session)
):
    """
    Authenticate user and issue JWT token.
    - Looks up user by login_name
    - Verifies password hash
    - Generates JWT with user_id in sub claim
    - Returns 200 with user and token
    - 401 on invalid credentials without leaking user existence
    """
    # Find user by login_name
    user = session.exec(
        select(User).where(User.login_name == request.login_name.lower())
    ).first()

    # Generic error message to prevent user enumeration
    invalid_credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials"
    )

    if not user:
        raise invalid_credentials_error

    # Verify password
    if not verify_password(request.password, user.password_hash):
        raise invalid_credentials_error

    # Generate JWT token
    token = create_access_token(str(user.id))

    # Return user and token
    return AuthResponse(
        user=UserResponse(
            id=str(user.id),
            login_name=user.login_name,
            name=user.name,
            email=user.email,
            created_at=user.created_at.isoformat()
        ),
        token=token
    )
