from sqlalchemy.orm import Session
from app.models.job_posting import JobPosting
from app.models.extracted_skill import ExtractedSkill
from app.nlp_pipeline.text_cleaner import clean_text
from app.nlp_pipeline.skill_extractor import extract_skills
from app.nlp_pipeline.role_extractor import extract_job_role
from app.nlp_pipeline.sector_classifier import classify_sector
from app.nlp_pipeline.experience_extractor import extract_experience

def run_pipeline_for_posting(job: JobPosting, db: Session) -> dict:
    # 1. Clean raw text
    cleaned = clean_text(job.raw_text)
    job.cleaned_text = cleaned

    # 2. Extract job role
    role = extract_job_role(job.title, cleaned)
    job.role = role

    # 3. Classify sector
    sector = classify_sector(job.company, cleaned)
    job.sector = sector

    # 4. Extract experience requirements
    exp = extract_experience(cleaned)
    job.min_experience_years = exp.get("min_years")
    job.max_experience_years = exp.get("max_years")
    job.experience_level = exp.get("level")

    # 5. Extract skills (confidence >= 0.80)
    skills = extract_skills(cleaned)
    skills_saved = 0

    for s in skills:
        skill_name = s["skill"]
        confidence = s["confidence"]

        # Upsert ExtractedSkill
        existing = db.query(ExtractedSkill).filter(
            ExtractedSkill.job_posting_id == job.id,
            ExtractedSkill.skill == skill_name
        ).first()

        if existing:
            if existing.confidence != confidence:
                existing.confidence = confidence
        else:
            new_skill = ExtractedSkill(
                job_posting_id=job.id,
                skill=skill_name,
                confidence=confidence
            )
            db.add(new_skill)
        
        skills_saved += 1

    db.commit()

    return {
        "job_posting_id": job.id,
        "skills_saved": skills_saved,
        "role": job.role,
        "sector": job.sector,
        "experience": {
            "min_years": job.min_experience_years,
            "max_years": job.max_experience_years,
            "level": job.experience_level
        }
    }

def run_pipeline_for_all(db: Session) -> dict:
    # Fetch job postings that are not marked as duplicates
    jobs = db.query(JobPosting).filter(JobPosting.is_duplicate == False).all()
    
    processed = 0
    skills_saved_total = 0

    for job in jobs:
        res = run_pipeline_for_posting(job, db)
        processed += 1
        skills_saved_total += res["skills_saved"]

    return {
        "processed": processed,
        "skills_saved_total": skills_saved_total
    }
