import json
import os
from sqlalchemy.orm import Session
from app.models.job_posting import JobPosting

SEED_FILE_PATH = os.path.join(os.path.dirname(__file__), "data", "seed_jobs.json")

def load_seed_file(filepath: str = SEED_FILE_PATH):
    """Read the seed JSON file and return a list of raw records."""
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

def validate_record(record: dict) -> bool:
    """Check that required fields exist and are non-empty."""
    required_fields = ["title", "raw_text", "source_url"]
    return all(record.get(field) for field in required_fields)

def insert_jobs(records: list, db: Session) -> dict:
    """Insert valid, non-duplicate job records into the database."""
    inserted, skipped_duplicates, errors = 0, 0, 0

    for record in records:
        try:
            if not validate_record(record):
                errors += 1
                continue

            existing = db.query(JobPosting).filter(
                JobPosting.source_url == record["source_url"]
            ).first()

            if existing:
                skipped_duplicates += 1
                continue

            job = JobPosting(
                source_url=record["source_url"],
                title=record.get("title"),
                company=record.get("company"),
                raw_text=record.get("raw_text"),
                description=record.get("raw_text"),  # compatibility field
                source_site=record.get("source_site", "manual_seed"),
            )
            db.add(job)
            inserted += 1

        except Exception:
            errors += 1

    db.commit()
    return {
        "inserted": inserted,
        "skipped_duplicates": skipped_duplicates,
        "errors": errors,
    }
