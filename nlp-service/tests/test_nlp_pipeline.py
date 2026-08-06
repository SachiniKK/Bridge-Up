import unittest
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.job_posting import JobPosting
from app.models.extracted_skill import ExtractedSkill
from app.nlp_pipeline.text_cleaner import clean_text
from app.nlp_pipeline.skill_extractor import extract_skills
from app.nlp_pipeline.role_extractor import extract_job_role
from app.nlp_pipeline.sector_classifier import classify_sector
from app.nlp_pipeline.experience_extractor import extract_experience
from app.nlp_pipeline.deduplicator import find_near_duplicates, mark_duplicates
from app.nlp_pipeline.pipeline_runner import run_pipeline_for_posting, run_pipeline_for_all

class TestNLPPipeline(unittest.TestCase):

    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=self.engine)
        TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self.db = TestingSessionLocal()

    def tearDown(self):
        self.db.close()

    def test_text_cleaner(self):
        raw_html = "<p>Join us! We are a great company. <strong>Apply now</strong>. Send your CV to careers@company.com or call +94112345678.</p>"
        cleaned = clean_text(raw_html)
        # Should not contain HTML tags, email, phone, or "Apply now"
        self.assertNotIn("<p>", cleaned)
        self.assertNotIn("<strong>", cleaned)
        self.assertNotIn("careers@company.com", cleaned)
        self.assertNotIn("Apply now", cleaned)
        self.assertIn("Join us! We are a great company.", cleaned)

    def test_skill_extractor(self):
        text = "We are looking for a software engineer with expertise in ReactJS, Python, and SQL."
        skills = extract_skills(text)
        skill_names = [s["skill"] for s in skills]
        
        self.assertIn("React", skill_names)
        self.assertIn("Python", skill_names)
        self.assertIn("SQL", skill_names)
        
        # React should have alias confidence (0.85) since it matched ReactJS
        react_match = next(s for s in skills if s["skill"] == "React")
        self.assertEqual(react_match["confidence"], 0.85)

        # Boosted match
        boosted_text = "We love ReactJS. Again, ReactJS is awesome."
        boosted_skills = extract_skills(boosted_text)
        boosted_react = next(s for s in boosted_skills if s["skill"] == "React")
        self.assertEqual(boosted_react["confidence"], 0.90)  # 0.85 + 0.05

    def test_role_extractor(self):
        role_cleaned = extract_job_role("Senior Software Engineer - Colombo", "Some description")
        self.assertEqual(role_cleaned, "Software Engineer")

        # Noun chunk fallback
        role_fallback = extract_job_role("", "We are seeking a Backend Developer to join our team.")
        self.assertEqual(role_fallback, "Backend Developer")

    def test_sector_classifier(self):
        sector = classify_sector("Example Bank Plc", "We handle loan accounts and audits.")
        self.assertEqual(sector, "Banking & Finance")

        unclassified = classify_sector("Unknown Corp", "Something completely unrelated.")
        self.assertEqual(unclassified, "Unclassified")

    def test_experience_extractor(self):
        # Range
        exp1 = extract_experience("Requires 3 to 5 years of experience in coding.")
        self.assertEqual(exp1["min_years"], 3)
        self.assertEqual(exp1["max_years"], 5)
        self.assertEqual(exp1["level"], "mid")

        # Qualitative
        exp2 = extract_experience("This is a fresh graduate position, no experience required.")
        self.assertEqual(exp2["min_years"], 0)
        self.assertEqual(exp2["level"], "entry")

        # None
        exp3 = extract_experience("Just some description.")
        self.assertIsNone(exp3["min_years"])
        self.assertIsNone(exp3["level"])

    def test_deduplicator_and_runner(self):
        # Insert postings
        post1 = JobPosting(
            source_url="job-1",
            title="Software Engineer - Colombo",
            company="Tech Corp",
            raw_text="Looking for a Frontend Engineer with experience in ReactJS, JavaScript, and Tailwind CSS.",
            fetched_at=datetime(2026, 8, 1, tzinfo=timezone.utc)
        )
        post2 = JobPosting(
            source_url="job-2",
            title="Software Engineer - Colombo",
            company="Tech Corp",
            raw_text="Looking for a Frontend Engineer with experience in ReactJS, JavaScript, and Tailwind CSS.",
            fetched_at=datetime(2026, 8, 2, tzinfo=timezone.utc) # Newer
        )
        self.db.add(post1)
        self.db.add(post2)
        self.db.commit()

        # Find near duplicates
        pairs = find_near_duplicates(self.db)
        self.assertEqual(len(pairs), 1)
        self.assertIn((post1.id, post2.id), pairs)

        # Mark duplicates
        marked = mark_duplicates(pairs, self.db)
        self.assertEqual(marked, 1)
        
        # Verify database state
        self.db.refresh(post1)
        self.db.refresh(post2)
        self.assertFalse(post1.is_duplicate)
        self.assertTrue(post2.is_duplicate)

        # Run pipeline runner
        summary = run_pipeline_for_all(self.db)
        # Should only process post1 since post2 is duplicate
        self.assertEqual(summary["processed"], 1)
        self.assertGreater(summary["skills_saved_total"], 0)

        # Check job post 1 attributes
        self.db.refresh(post1)
        self.assertEqual(post1.role, "Software Engineer")
        self.assertEqual(post1.sector, "IT & Software")
        self.assertIn("React", post1.cleaned_text)

        # Check ExtractedSkill rows
        skills_in_db = self.db.query(ExtractedSkill).filter_by(job_posting_id=post1.id).all()
        self.assertGreater(len(skills_in_db), 0)
        for s in skills_in_db:
            self.assertGreaterEqual(s.confidence, 0.80)
            self.assertEqual(s.job_posting_id, post1.id)
            self.assertIsNotNone(s.skill)
