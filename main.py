from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.db import init_db
from app import auth_router,exam_router,submission_router,analytics_router
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="Exam Portal", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router.router)
app.include_router(exam_router.router)
app.include_router(submission_router.router)
app.include_router(analytics_router.router)