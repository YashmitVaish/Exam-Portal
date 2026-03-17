from fastapi import APIRouter, HTTPException, Depends
from app.models import Exam, User
from app.schemas import ExamCreate, ExamUpdate
from app.utils import require_teacher, get_current_user

router = APIRouter(prefix="/exams", tags=["exams"])

@router.post("/", status_code=201)
async def create_exam(data: ExamCreate, teacher: User = Depends(require_teacher)):
    exam = Exam(created_by=str(teacher.id), **data.model_dump())
    await exam.insert()
    return {"id": str(exam.id)}

@router.get("/")
async def list_my_exams(teacher: User = Depends(require_teacher)):
    exams = await Exam.find(Exam.created_by == str(teacher.id)).to_list()
    return [{"id": str(e.id), "title": e.title, "is_published": e.is_published} for e in exams]

@router.get("/{exam_id}")
async def get_exam(exam_id: str, user: User = Depends(get_current_user)):
    exam = await Exam.get(exam_id)
    if not exam:
        raise HTTPException(404)
    if user.role == "student" and not exam.is_published:
        raise HTTPException(404)
    return exam.model_dump()

@router.patch("/{exam_id}")
async def update_exam(exam_id: str, data: ExamUpdate, teacher: User = Depends(require_teacher)):
    exam = await Exam.get(exam_id)
    if not exam or exam.created_by != str(teacher.id):
        raise HTTPException(404)
    updates = data.model_dump(exclude_none=True)
    for k, v in updates.items():
        setattr(exam, k, v)
    await exam.save()
    return {"updated": True}

@router.post("/{exam_id}/publish")
async def publish_exam(exam_id: str, teacher: User = Depends(require_teacher)):
    exam = await Exam.get(exam_id)
    if not exam or exam.created_by != str(teacher.id):
        raise HTTPException(404)
    if not exam.questions:
        raise HTTPException(400, "Cannot publish an exam with no questions")
    exam.is_published = True
    await exam.save()
    return {"published": True}


@router.delete("/{exam_id}", status_code=204)
async def delete_exam(exam_id: str, teacher: User = Depends(require_teacher)):
    exam = await Exam.get(exam_id)
    if not exam or exam.created_by != str(teacher.id):
        raise HTTPException(404)
    await exam.delete()