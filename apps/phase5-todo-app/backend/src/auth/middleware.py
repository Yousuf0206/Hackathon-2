"""
JWT authentication middleware.
T016: Middleware to extract and verify JWT from Authorization header.
"""
from fastapi import Request, HTTPException, status
from typing import Optional
from auth.jwt import extract_user_id


async def verify_jwt_middleware(request: Request) -> Optional[str]:
    """
    Middleware to verify JWT from Authorization header.

    Args:
        request: FastAPI request object

    Returns:
        User ID if token is valid

    Raises:
        HTTPException 401: If token is missing, invalid, or expired

    Header Format:
        Authorization: Bearer <jwt_token>
    """
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )

    parts = auth_header.split()
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
