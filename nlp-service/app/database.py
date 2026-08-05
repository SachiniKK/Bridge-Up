import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://bridgeup:bridgeup_dev@localhost:5432/bridgeup_db"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from app.models.job_posting import JobPosting  # noqa: ensures model is registered
    from app.models.extracted_skill import ExtractedSkill  # noqa: ensures model is registered
    Base.metadata.create_all(bind=engine)
