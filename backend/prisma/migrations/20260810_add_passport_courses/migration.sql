-- Migration: add_passport_courses
-- Adds passport_courses table and links it to skill_passports

CREATE TABLE "passport_courses" (
    "id"           TEXT NOT NULL,
    "passport_id"  TEXT NOT NULL,
    "resource_id"  TEXT NOT NULL,
    "title"        TEXT NOT NULL,
    "type"         TEXT NOT NULL,
    "url"          TEXT NOT NULL,
    "skill_name"   TEXT NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passport_courses_pkey" PRIMARY KEY ("id")
);

-- Unique constraint: one record per passport per resource
CREATE UNIQUE INDEX "passport_courses_passport_id_resource_id_key"
    ON "passport_courses"("passport_id", "resource_id");

-- Foreign key: course belongs to a SkillPassport (cascades on delete)
ALTER TABLE "passport_courses"
    ADD CONSTRAINT "passport_courses_passport_id_fkey"
    FOREIGN KEY ("passport_id")
    REFERENCES "skill_passports"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
