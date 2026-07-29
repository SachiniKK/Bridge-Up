from sqlalchemy import Column, Integer, String, Text, DateTime
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
