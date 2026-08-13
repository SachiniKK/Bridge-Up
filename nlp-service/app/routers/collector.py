import os
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.job_posting import JobPosting
from app.seed_loader import load_seed_file, insert_jobs

router = APIRouter(tags=["Job Collector & Seed Loader"])

DEFAULT_SEED_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "seed_jobs.json")


@router.post("/seed/load")
def trigger_seed_load(
    file_path: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Triggers loading of job postings from local seed JSON file into the PostgreSQL database.
    Prevents re-inserting duplicates based on source_url.
    """
    target_path = file_path if file_path else DEFAULT_SEED_PATH

    try:
        records = load_seed_file(target_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read seed file: {str(e)}")

    summary = insert_jobs(records, db)

    # Fetch preview of recently fetched/seeded jobs
    preview_jobs = (
        db.query(JobPosting)
        .order_by(JobPosting.id.desc())
        .limit(3)
        .all()
    )

    return {
        "status": "success",
        "file_loaded": target_path,
        "summary": summary,
        "preview": [job.to_dict() for job in preview_jobs],
    }


@router.post("/collect/topjobs")
def trigger_topjobs_collection(
    pages: int = Query(default=5, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Endpoint for triggering collection. Uses seed loader architecture to populate jobs.
    """
    return trigger_seed_load(file_path=None, db=db)


@router.get("/collect/jobs")
def get_collected_jobs(
    limit: int = Query(default=100, ge=1, le=1000),
    skip: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Retrieves stored job postings from the database.
    """
    total_count = db.query(JobPosting).count()
    jobs = (
        db.query(JobPosting)
        .order_by(JobPosting.id.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {
        "total": total_count,
        "count": len(jobs),
        "skip": skip,
        "limit": limit,
        "jobs": [job.to_dict() for job in jobs],
    }
