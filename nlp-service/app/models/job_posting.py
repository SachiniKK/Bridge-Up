from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from datetime import datetime, timezone
from app.database import Base

class JobPosting(Base):
    __tablename__ = "job_postings"

    id = Column(Integer, primary_key=True, index=True)
    source_url = Column(String, unique=True, index=True)
    title = Column(String)
    company = Column(String)
    raw_text = Column(Text)
    description = Column(Text)
    source_site = Column(String, default="manual_seed")
    fetched_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    cleaned_text = Column(Text, nullable=True)
    is_duplicate = Column(Boolean, default=False, nullable=False)
    role = Column(String, nullable=True)
    sector = Column(String, nullable=True)
    min_experience_years = Column(Integer, nullable=True)
    max_experience_years = Column(Integer, nullable=True)
    experience_level = Column(String, nullable=True)
