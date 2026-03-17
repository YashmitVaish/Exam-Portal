from beanie import Document
from pydantic import EmailStr
from typing import Literal

class User(Document):
    email: EmailStr
    hashed_password: str
    role: Literal["teacher", "student"]
 
    class Settings:
        name = "users"