from beanie import Document
from pydantic import BaseModel, EmailStr
from typing import Dict, List, Literal, Optional
from datetime import datetime

class User(Document):
    email: EmailStr
    hashed_password: str
    role: Literal["teacher", "student"]
    class Settings:
        name = "users"

class Question(BaseModel):
    text: str
    q_type: Literal["mcq", "truefalse", "short"]
    options: Optional[List[str]] = None
    correct_answer: str

class Exam(Document):
    title: str
    created_by: str
    duration_minutes: int
    questions: List[Question] = []
    is_published: bool = False
    randomize_order: bool = False
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    class Settings:
        name = "exams"


class Submission(Document):
    exam_id: str
    student_id: str
    answers: Dict[int, str] = {}
    question_order: List[int] = []
    answer_timings: Dict[int, int] = {}
    score: Optional[float] = None
    graded: bool = False
    started_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None
    class Settings:
        name = "submissions"