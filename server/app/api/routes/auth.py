from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import httpx

from app.core.database import get_db
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)
from app.core.config import get_settings
from app.models import User
from app.schemas import UserRegister, UserLogin, Token, UserResponse, GoogleLoginRequest, UserOnboardingUpdate

settings = get_settings()

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new user."""

    # Check if email already exists
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    # Check if username already exists
    result = await db.execute(select(User).where(User.username == data.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This username is already taken.",
        )

    user = User(
        email=data.email,
        username=data.username,
        hashed_password=get_password_hash(data.password),
        display_name=data.display_name or data.username,
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user


@router.post("/login", response_model=Token)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login with email and password."""

    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get the current authenticated user's profile."""
    return current_user


@router.post("/google", response_model=Token)
async def google_login(data: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate or register a user using a Google ID token."""
    
    # 1. Verify token with Google's tokeninfo API
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": data.credential},
                timeout=10.0
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to reach Google token verification: {str(e)}"
            )
            
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google credential."
        )
        
    token_info = response.json()
    
    # 2. Check audience matches our client ID if configured
    google_client_id = settings.GOOGLE_CLIENT_ID
    if google_client_id and token_info.get("aud") != google_client_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google credential audience mismatch."
        )
        
    email = token_info.get("email")
    google_id = token_info.get("sub")
    name = token_info.get("name")
    picture = token_info.get("picture")
    
    if not email or not google_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google token missing essential user information."
        )
        
    # 3. Find user by google_id or email
    # Check google_id first
    result = await db.execute(select(User).where(User.google_id == google_id))
    user = result.scalar_one_or_none()
    
    if not user:
        # Check email next (user might have registered via password before)
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if user:
            # Link google_id and update avatar/display name if empty
            user.google_id = google_id
            if picture and not user.avatar_url:
                user.avatar_url = picture
            if name and not user.display_name:
                user.display_name = name
            await db.commit()
            await db.refresh(user)
        else:
            # Create new user
            # Generate a clean unique username based on email prefix
            base_username = email.split("@")[0]
            # Strip non-alphanumeric chars
            base_username = "".join(c for c in base_username if c.isalnum() or c in ("_", "-"))
            if not base_username:
                base_username = "user"
                
            username = base_username
            # Check for collision
            collision_result = await db.execute(select(User).where(User.username == username))
            counter = 1
            while collision_result.scalar_one_or_none():
                username = f"{base_username}_{counter}"
                collision_result = await db.execute(select(User).where(User.username == username))
                counter += 1
                
            user = User(
                email=email,
                username=username,
                google_id=google_id,
                display_name=name or username,
                avatar_url=picture,
                hashed_password=None # Google authenticated user
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            
    # 4. Generate access token
    access_token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=access_token)


@router.post("/onboarding", response_model=UserResponse)
async def update_onboarding(
    data: UserOnboardingUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Complete onboarding baseline calibration.
    """
    current_user.display_name = data.display_name
    current_user.age = data.age
    current_user.occupation = data.occupation
    current_user.onboarding_reason = data.onboarding_reason
    current_user.onboarding_completed = True
    
    await db.commit()
    await db.refresh(current_user)
    return current_user
