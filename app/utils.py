from fastapi import Header, HTTPException
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from app.models import User
from dotenv import load_dotenv
import os

load_dotenv()

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM  = "HS256"
TOKEN_TTL  = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

def hash_password(plain: str) -> str:
    return pwd_ctx.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)

def create_token(user: User) -> str:
    payload = {
        "sub": str(user.id),
        "role": user.role,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=TOKEN_TTL)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(401, "Invalid or expired token")

async def get_current_user(authorization: str = Header(...)) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Authorization header must be 'Bearer <token>'")
    token = authorization.removeprefix("Bearer ")
    payload = decode_token(token)
    user = await User.get(payload["sub"])
    if not user:
        raise HTTPException(401, "User not found")
    return user

async def require_teacher(authorization: str = Header(...)) -> User:
    user = await get_current_user(authorization)
    if user.role != "teacher":
        raise HTTPException(403, "Teachers only")
    return user

async def require_student(authorization: str = Header(...)) -> User:
    user = await get_current_user(authorization)
    if user.role != "student":
        raise HTTPException(403, "Students only")
    return user