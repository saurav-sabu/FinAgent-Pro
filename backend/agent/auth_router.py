from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel, EmailStr, Field, field_validator

from backend.database import get_db
from backend.models import User
from backend.utils.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    ALGORITHM,
    SECRET_KEY,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user
)
from jose import jwt, JWTError
from backend.utils.logger import logger
from datetime import datetime, timedelta

# Simple in-memory rate limiting for auth endpoints
# Stores {ip_address: [timestamp1, timestamp2, ...]}
login_attempts = {}

async def rate_limit_auth(request_ip: str):
    import os
    if os.getenv("TEST_MODE") == "true":
        return
        
    now = datetime.now()
    # Clean up old attempts (older than 1 minute)
    cutoff = now - timedelta(minutes=1)
    
    if request_ip not in login_attempts:
        login_attempts[request_ip] = []
    
    login_attempts[request_ip] = [t for t in login_attempts[request_ip] if t > cutoff]
    
    if len(login_attempts[request_ip]) >= 20: 
        logger.warning(f"Rate limit exceeded for IP: {request_ip}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again in a minute."
        )
    
    login_attempts[request_ip].append(now)

from fastapi import Request

router = APIRouter(prefix="/auth", tags=["Authentication"])

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(
        ...,
        min_length=8,
        description="Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number."
    )
    name: str

    @field_validator('password')
    @classmethod
    def validate_password_complexity(cls, v: str) -> str:
        import re
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        return v

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: str

    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserResponse

class RefreshTokenRequest(BaseModel):
    refresh_token: str


@router.post("/register", response_model=UserResponse)
async def register(request: Request, user: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Register a new user in the system.
    """
    await rate_limit_auth(request.client.host)
    logger.info(f"Attempting to register user: {user.email}")
    
    result = await db.execute(select(User).where(User.email == user.email))
    existing_user = result.scalars().first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
        
    hashed_password = await get_password_hash(user.password)
    
    new_user = User(
        email=user.email,
        hashed_password=hashed_password,
        name=user.name
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    logger.info(f"Successfully registered user: {user.email}")
    return new_user


@router.post("/login", response_model=Token)
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    """
    OAuth2 compatible token login, getting an access token for future requests.
    """
    await rate_limit_auth(request.client.host)
    logger.info(f"Login attempt for user: {form_data.username}")
    
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    
    if not user or not await verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    logger.info(f"Successful login for user: {user.email}")
    
    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(body: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """
    Get a new access token using a refresh token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(body.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        if email is None or token_type != "refresh":
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    
    if user is None:
        raise credentials_exception
        
    access_token = create_access_token(data={"sub": user.email})
    new_refresh_token = create_refresh_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get current logged in user details.
    """
    return current_user
