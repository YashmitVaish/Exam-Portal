from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta, timezone
from typing import List
import random

from app.models import Exam, Submission, User
from app.schemas import JoinExamResponse, QuestionOut, SubmitRequest, SubmitResponse
from app.utils import require_student, require_teacher

router = APIRouter(prefix="/submissions", tags=["submissions"])


def _check_window(exam: Exam):
    now = datetime.now(timezone.utc)

    def to_aware(dt):
        if dt is None:
            return None
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt

    start = to_aware(exam.start_at)
    end   = to_aware(exam.end_at)

    if start and now < start:
        raise HTTPException(403, f"Exam opens at {start.isoformat()}")
    if end and now > end:
        raise HTTPException(403, "Exam window has closed")


def _compute_score(exam: Exam, submission: Submission) -> float:
    order = submission.question_order
    correct = total = 0
    for shuffled_idx, answer in submission.answers.items():
        original_idx = order[int(shuffled_idx)]
        q = exam.questions[original_idx]
        if q.q_type in ("mcq", "truefalse"):
            total += 1
            if answer.strip().lower() == q.correct_answer.strip().lower():
                correct += 1
    return round((correct / total) * 100, 2) if total else 0.0


@router.post("/join/{exam_id}", response_model=JoinExamResponse)
async def join_exam(exam_id: str, student: User = Depends(require_student)):
    exam = await Exam.get(exam_id)
    if not exam or not exam.is_published:
        raise HTTPException(404)

    _check_window(exam)

    existing = await Submission.find_one({"exam_id": exam_id, "student_id": str(student.id)})

    if existing:
        raise HTTPException(409, "Already joined this exam")
    order = list(range(len(exam.questions)))
    if exam.randomize_order:
        random.shuffle(order)

    now = datetime.now(timezone.utc)
    sub = Submission(
        exam_id=exam_id,
        student_id=str(student.id),
        question_order=order,
        started_at=now
    )
    await sub.insert()

    if exam.end_at:
        deadline = exam.end_at
    else:
        deadline = now + timedelta(minutes=exam.duration_minutes)
    questions_out: List[QuestionOut] = [
        QuestionOut(
            index=shuffled_idx,
            text=exam.questions[original_idx].text,
            q_type=exam.questions[original_idx].q_type,
            options=exam.questions[original_idx].options,
        )
        for shuffled_idx, original_idx in enumerate(order)
    ]

    return JoinExamResponse(
        submission_id=str(sub.id),
        questions=questions_out,
        deadline=deadline.isoformat()
    )


@router.post("/{submission_id}/submit", response_model=SubmitResponse)
async def submit_exam(
    submission_id: str,
    body: SubmitRequest,
    student: User = Depends(require_student)
):
    sub = await Submission.get(submission_id)
    if not sub or sub.student_id != str(student.id):
        raise HTTPException(404)
    if sub.submitted_at:
        raise HTTPException(409, "Already submitted")

    exam = await Exam.get(sub.exam_id)

    _check_window(exam)
    started = sub.started_at
    if started and started.tzinfo is None:
        started = started.replace(tzinfo=timezone.utc)

    end_at = exam.end_at
    if end_at and end_at.tzinfo is None:
        end_at = end_at.replace(tzinfo=timezone.utc)

    deadline = end_at if end_at else (started + timedelta(minutes=exam.duration_minutes))
    if datetime.now(timezone.utc) > deadline:
        raise HTTPException(403, "Time is up")

    sub.answers = {int(k): v for k, v in body.answers.items()}
    sub.answer_timings = {int(k): v for k, v in body.timings.items()}
    sub.submitted_at = datetime.now(timezone.utc)
    sub.score = _compute_score(exam, sub)
    sub.graded = True
    await sub.save()

    return SubmitResponse(score=sub.score, graded=True)


@router.get("/results/{exam_id}")
async def exam_results(exam_id: str, teacher: User = Depends(require_teacher)):
    exam = await Exam.get(exam_id)
    if not exam or exam.created_by != str(teacher.id):
        raise HTTPException(404)

    subs = await Submission.find({"exam_id": exam_id, "graded": True}).to_list()

    return [
        {
            "student_id": s.student_id,
            "score": s.score,
            "submitted_at": s.submitted_at.isoformat() if s.submitted_at else None
        }
        for s in subs
    ]