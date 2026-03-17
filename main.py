from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.db import init_db
from app import auth_router,exam_router,submission_router,analytics_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="Exam Portal", lifespan=lifespan)

app.include_router(auth_router.router)
app.include_router(exam_router.router)
app.include_router(submission_router.router)
app.include_router(analytics_router.router)