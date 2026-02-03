"""
Authentication dependencies for FastAPI.

Per constitution: Better Auth is the ONLY authentication system.
User identity MUST be derived from auth context (JWT sub claim).
No mock auth, no localStorage auth, no bypass paths.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

from auth.jwt import extract_user_id

# HTTP Bearer token security scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Extract and validate user_id from JWT token.

    CRITICAL: This is the ONLY valid source of user identity.
    Never read user_id from URL parameters, query strings, or request body.

    Args:
        credentials: Bearer token from Authorization header

    Returns:
        Authenticated user_id from JWT sub claim

    Raises:
        HTTPException 401: If token is missing, invalid, or expired
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    user_id = extract_user_id(token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_id


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    )
) -> Optional[str]:
    """
    Optionally extract user_id from JWT token.

    Used for endpoints that may work with or without authentication.

    Args:
        credentials: Optional Bearer token from Authorization header

    Returns:
        User_id if token valid, None otherwise
    """
    if not credentials:
        return None

    token = credentials.credentials
    return extract_user_id(token)
