from pydantic import BaseModel, EmailStr
from typing import Dict,List,Literal,Optional
from datetime import datetime

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

class QuestionIn(BaseModel):
    text: str
    q_type: Literal["mcq", "truefalse", "short"]
    options: Optional[List[str]] = None
    correct_answer: str

class ExamCreate(BaseModel):
    title: str
    duration_minutes: int
    questions: List[QuestionIn] = []
    randomize_order: bool = False
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None

class ExamUpdate(BaseModel):
    title: Optional[str] = None
    duration_minutes: Optional[int] = None
    questions: Optional[List[QuestionIn]] = None
    randomize_order: Optional[bool] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    is_published: Optional[bool] = None

class QuestionOut(BaseModel):
    index: int
    text: str
    q_type: str
    options: Optional[List[str]] = None

class JoinExamResponse(BaseModel):
    submission_id: str
    questions: List[QuestionOut]
    deadline: Optional[str]

class SubmitRequest(BaseModel):
    answers: Dict[int, str]
    timings: Dict[int, int] = {}

class SubmitResponse(BaseModel):
    score: Optional[float]
    graded: bool

class QuestionStat(BaseModel):
    question_index: int
    text: str
    total_attempts: int
    correct: int
    pct_correct: float
    avg_time_seconds: Optional[float]