from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.seed_loader import load_seed_file, insert_jobs
from app.models.job_posting import JobPosting

router = APIRouter()

@router.post("/seed/load")
def trigger_seed_load(db: Session = Depends(get_db)):
    records = load_seed_file()
    result = insert_jobs(records, db)
    return result

@router.get("/collect/jobs")
def get_collected_jobs(db: Session = Depends(get_db)):
    jobs = db.query(JobPosting).all()
    return {
        "count": len(jobs),
        "jobs": [
            {
                "id": job.id,
                "title": job.title,
                "company": job.company,
                "source_site": job.source_site,
                "source_url": job.source_url,
            }
            for job in jobs
        ],
    }
