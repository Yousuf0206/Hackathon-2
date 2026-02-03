#!/usr/bin/env python
"""Test script to check if basic imports work."""
try:
    from uuid import UUID, uuid4
    print("UUID import successful")

    from sqlmodel import SQLModel, Field
    print("SQLModel import successful")

    from sqlalchemy import Column
    print("SQLAlchemy Column import successful")

    # Try to define a simple model without UUID field to see if that works
    class TestUser(SQLModel, table=True):
        email: str = Field(primary_key=True)
        password_hash: str

    print("Simple model definition successful")
    print("Basic imports work - the issue is specifically with UUID type in Pydantic v2")

except Exception as e:
    print(f"Error during imports: {e}")
    import traceback
    traceback.print_exc()