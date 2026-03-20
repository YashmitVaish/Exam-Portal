from fastapi import APIRouter, HTTPException
from app.models import User
from app.schemas import RegisterRequest, LoginRequest, TokenResponse
from app.utils import hash_password, verify_password, create_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
async def register(data: RegisterRequest):
    print("PASSWORD:", data.password)
    print("PASSWORD LENGTH:", len(data.password.encode()))
    if await User.find_one(User.email == data.email):
        raise HTTPException(409, "Email already registered")

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        role=data.role
    )
    await user.insert()
    return {"access_token": create_token(user)}

@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    user = await User.find_one(User.email == data.email)
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    return {"access_token": create_token(user)}