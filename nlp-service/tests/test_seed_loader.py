import os
import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.job_posting import JobPosting
from app.seed_loader import validate_record, insert_jobs, load_seed_file

class TestSeedLoader(unittest.TestCase):

    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=self.engine)
        TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self.db_session = TestingSessionLocal()

    def tearDown(self):
        self.db_session.close()

    def test_validate_record_valid(self):
        sample = {
            "source_url": "test-url-1",
            "title": "Software Engineer",
            "company": "Tech Corp",
            "raw_text": "Looking for React developer.",
            "source_site": "manual_seed",
        }
        self.assertTrue(validate_record(sample))

    def test_validate_record_missing_title(self):
        sample = {
            "source_url": "test-url-2",
            "raw_text": "Some job description",
        }
        self.assertFalse(validate_record(sample))

    def test_insert_jobs_and_duplicate_prevention(self):
        records = [
            {
                "source_url": "job-001",
                "title": "Frontend Engineer",
                "company": "Company A",
                "raw_text": "React experience required",
            },
            {
                "source_url": "job-002",
                "title": "Backend Engineer",
                "company": "Company B",
                "raw_text": "Python FastAPI required",
            },
        ]

        # First load
        res1 = insert_jobs(records, self.db_session)
        self.assertEqual(res1["inserted"], 2)
        self.assertEqual(res1["skipped_duplicates"], 0)
        self.assertEqual(res1["errors"], 0)

        self.assertEqual(self.db_session.query(JobPosting).count(), 2)

        # Second load with same records (Duplicate test)
        res2 = insert_jobs(records, self.db_session)
        self.assertEqual(res2["inserted"], 0)
        self.assertEqual(res2["skipped_duplicates"], 2)
        self.assertEqual(res2["errors"], 0)

        self.assertEqual(self.db_session.query(JobPosting).count(), 2)
