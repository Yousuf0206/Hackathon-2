"""
JWT utilities for token creation and verification.
T015: JWT creation with sub claim, 24h expiry, HS256 algorithm.
"""
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from ..config import settings


ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24


def create_access_token(user_id: str) -> str:
    """
    Create a JWT access token with user_id in sub claim.

    Args:
        user_id: User ID to encode in token

    Returns:
        Encoded JWT token string

    Token Structure:
        - sub: user_id (sole source of user identity)
        - exp: expiration timestamp (24h from creation)
        - iat: issued at timestamp
    """
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode = {
        "sub": str(user_id),
        "exp": expire,
        "iat": datetime.utcnow()
    }
    encoded_jwt = jwt.encode(
        to_encode,
        settings.better_auth_secret,
        algorithm=ALGORITHM
    )
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    """
    Verify JWT token signature and expiration.

    Args:
        token: JWT token string to verify

    Returns:
        Decoded payload dict if valid, None if invalid

    Validation:
        - Verifies signature with BETTER_AUTH_SECRET
        - Checks expiration (<24h)
        - Returns None on any validation failure
    """
    try:
        payload = jwt.decode(
            token,
            settings.better_auth_secret,
            algorithms=[ALGORITHM]
        )
        return payload
    except JWTError:
        return None


def extract_user_id(token: str) -> Optional[str]:
    """
    Extract user_id from JWT token's sub claim.

    Args:
        token: JWT token string

    Returns:
        User ID string if token valid and sub claim exists, None otherwise

    CRITICAL: This is the ONLY valid source of user identity.
    Never read user_id from URL parameters, query strings, or request body.
    """
    payload = verify_token(token)
    if payload is None:
        return None

    user_id = payload.get("sub")
    return user_id if user_id else None
