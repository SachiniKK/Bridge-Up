from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.job_posting import JobPosting
from app.models.extracted_skill import ExtractedSkill
from app.nlp_pipeline.pipeline_runner import run_pipeline_for_posting, run_pipeline_for_all
from app.nlp_pipeline.deduplicator import find_near_duplicates, mark_duplicates

router = APIRouter(prefix="/pipeline", tags=["Pipeline"])

@router.post("/run", status_code=status.HTTP_200_OK)
def run_pipeline(db: Session = Depends(get_db)):
    summary = run_pipeline_for_all(db)
    return summary

@router.post("/run/{job_id}", status_code=status.HTTP_200_OK)
def run_pipeline_single(job_id: int, db: Session = Depends(get_db)):
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job posting with ID {job_id} not found"
        )
    summary = run_pipeline_for_posting(job, db)
    return summary

@router.get("/skills", status_code=status.HTTP_200_OK)
def get_extracted_skills(db: Session = Depends(get_db)):
    # Join with JobPosting to enrich skills with role, sector, and experience_level
    results = db.query(ExtractedSkill, JobPosting).join(
        JobPosting, ExtractedSkill.job_posting_id == JobPosting.id
    ).all()
    
    return [
        {
            "id": skill.id,
            "job_posting_id": skill.job_posting_id,
            "skill": skill.skill,
            "confidence": skill.confidence,
            "role": posting.role,
            "sector": posting.sector,
            "experience_level": posting.experience_level
        }
        for skill, posting in results
    ]

@router.post("/dedupe", status_code=status.HTTP_200_OK)
def deduplicate_jobs(db: Session = Depends(get_db)):
    pairs = find_near_duplicates(db)
    marked_count = mark_duplicates(pairs, db)
    return {"marked_duplicates": marked_count}

from pydantic import BaseModel
from app.nlp_pipeline.role_suggester import suggest_roles

class SuggestRolesRequest(BaseModel):
    text: str

@router.post("/suggest-roles", status_code=status.HTTP_200_OK)
def suggest_roles_endpoint(payload: SuggestRolesRequest):
    return {"suggestions": suggest_roles(payload.text)}

