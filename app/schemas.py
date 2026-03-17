from pydantic import BaseModel, EmailStr
from typing import Literal
 
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: Literal["teacher", "student"]

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"