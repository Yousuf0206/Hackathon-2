"""
FastAPI dependencies.
T017: get_current_user dependency to extract user_id from JWT sub claim.
"""
from fastapi import Depends, HTTPException, status, Header
from typing import Annotated, Optional
from .auth.jwt import extract_user_id


async def get_current_user(
    authorization: Annotated[Optional[str], Header()] = None
) -> str:
    """
    Dependency to extract authenticated user ID from JWT.

    Args:
        authorization: Authorization header with Bearer token

    Returns:
        User ID extracted from JWT sub claim

    Raises:
        HTTPException 401: If token is missing, invalid, or expired

    CRITICAL: This is the ONLY valid source of user identity.
    All protected endpoints MUST use this dependency.
    Never read user_id from URL parameters, query strings, or request body.

    Usage:
        @router.get("/api/todos")
        def get_todos(user_id: str = Depends(get_current_user)):
            ...
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )

    token = parts[1]
    user_id = extract_user_id(token)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    return user_id
