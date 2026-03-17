from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.models import Exam, Submission, User
from app.schemas import QuestionStat
from app.utils import require_teacher

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/{exam_id}", response_model=List[QuestionStat])
async def question_analytics(exam_id: str, teacher: User = Depends(require_teacher)):
    exam = await Exam.get(exam_id)
    if not exam or exam.created_by != str(teacher.id):
        raise HTTPException(404)

    submissions = await Submission.find(
        Submission.exam_id == exam_id,
        Submission.graded == True
    ).to_list()

    n = len(exam.questions)
    totals  = [0] * n
    correct = [0] * n
    times: dict[int, list[int]] = {i: [] for i in range(n)}

    for sub in submissions:
        for shuffled_idx, answer in sub.answers.items():
            original_idx = sub.question_order[int(shuffled_idx)]
            q = exam.questions[original_idx]
            totals[original_idx] += 1
            if q.q_type in ("mcq", "truefalse"):
                if answer.strip().lower() == q.correct_answer.strip().lower():
                    correct[original_idx] += 1

        for shuffled_idx, secs in sub.answer_timings.items():
            original_idx = sub.question_order[int(shuffled_idx)]
            times[original_idx].append(secs)

    return [
        QuestionStat(
            question_index=i,
            text=exam.questions[i].text,
            total_attempts=totals[i],
            correct=correct[i],
            pct_correct=round(correct[i] / totals[i] * 100, 1) if totals[i] else 0.0,
            avg_time_seconds=round(sum(times[i]) / len(times[i]), 1) if times[i] else None
        )
        for i in range(n)
    ]