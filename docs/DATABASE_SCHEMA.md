# BridgeUp — Database Schema Documentation

## Connection Details

| Service    | Host (Docker) | Port | Database      | User      |
|------------|---------------|------|---------------|-----------|
| PostgreSQL | `postgres`    | 5432 | `bridgeup_db` | `bridgeup` |

Connection string: `postgresql://bridgeup:bridgeup_dev@postgres:5432/bridgeup_db`

---

## Table Ownership Rules

> **CRITICAL**: Violating these rules causes schema conflicts, migration failures, and data corruption.
> Both services connect to the **same PostgreSQL database** but own different tables.
> Cross-service reads must use raw SQL — never ORM model definitions that could trigger migrations.

### Backend (Prisma) — Owner

| Table              | Prisma Model    | Description                              |
|--------------------|-----------------|------------------------------------------|
| `students`         | `Student`       | Student profiles, XP, streaks, study mode |
| `daily_tasks`      | `DailyTask`     | Generated daily learning tasks per student |
| `xp_transactions`  | `XPTransaction` | Immutable XP change log                  |

- Managed via `backend/prisma/schema.prisma` and `prisma migrate`
- Only the backend service may CREATE, ALTER, or DROP these tables
- nlp-service must NOT read or write to these tables

### NLP Service (SQLAlchemy) — Owner

| Table              | SQLAlchemy Model  | Description                           |
|--------------------|-------------------|---------------------------------------|
| `job_postings`     | `JobPosting`      | Scraped/seeded job posting data       |
| `extracted_skills` | `ExtractedSkill`  | Skills extracted from job postings    |

- Managed via `nlp-service/app/models/` and SQLAlchemy `Base.metadata.create_all()`
- Only the nlp-service may CREATE, ALTER, or DROP these tables
- **These tables must NEVER appear as Prisma models in `schema.prisma`**
- **No Prisma migration may attempt to create, alter, or drop these tables**
- If backend code needs to read this data, use `prisma.$queryRaw` with **parameterized tagged-template syntax**:

```javascript
// ✅ CORRECT — parameterized tagged template
const skills = await prisma.$queryRaw`
  SELECT skill FROM extracted_skills WHERE job_posting_id = ${jobId}
`;

// ❌ WRONG — string concatenation (SQL injection risk)
const skills = await prisma.$queryRaw(
  `SELECT skill FROM extracted_skills WHERE job_posting_id = ${jobId}`
);
```

---

## Table Schemas

### `students` (Backend/Prisma)

| Column             | Type          | Nullable | Default           | Notes                            |
|--------------------|---------------|----------|-------------------|----------------------------------|
| `id`               | TEXT          | NOT NULL | —                 | Primary key (UUID or explicit)   |
| `email`            | TEXT          | NOT NULL | —                 | Unique                           |
| `name`             | TEXT          | NOT NULL | —                 |                                  |
| `current_xp`       | INTEGER       | NOT NULL | 0                 | Total accumulated XP             |
| `level`            | INTEGER       | NOT NULL | 1                 | Current level (1–6)              |
| `streak_count`     | INTEGER       | NOT NULL | 0                 | Consecutive active days          |
| `last_active_date` | TIMESTAMP(3)  | YES      | —                 | Last day a task was completed    |
| `study_mode_until` | TIMESTAMP(3)  | YES      | —                 | Streak protection expiry         |
| `weekly_hours`     | INTEGER       | NOT NULL | 5                 | Hours/week for task generation   |
| `created_at`       | TIMESTAMP(3)  | NOT NULL | CURRENT_TIMESTAMP |                                  |

### `daily_tasks` (Backend/Prisma)

| Column         | Type          | Nullable | Default           | Notes                              |
|----------------|---------------|----------|-------------------|------------------------------------|
| `id`           | TEXT          | NOT NULL | —                 | Primary key (UUID)                 |
| `student_id`   | TEXT          | NOT NULL | —                 | FK → students.id                   |
| `title`        | TEXT          | NOT NULL | —                 |                                    |
| `description`  | TEXT          | YES      | —                 |                                    |
| `skill_tag`    | TEXT          | YES      | —                 | Skill name from taxonomy           |
| `xp_value`     | INTEGER       | NOT NULL | 10                | XP awarded on completion           |
| `task_date`    | DATE          | NOT NULL | —                 | UTC day boundary                   |
| `status`       | TEXT          | NOT NULL | `'pending'`       | pending / completed / skipped / expired |
| `completed_at` | TIMESTAMP(3)  | YES      | —                 |                                    |
| `created_at`   | TIMESTAMP(3)  | NOT NULL | CURRENT_TIMESTAMP |                                    |

**Unique constraint**: `(student_id, task_date, title)` — prevents duplicate task generation for the same day.

### `xp_transactions` (Backend/Prisma)

| Column            | Type          | Nullable | Default           | Notes                              |
|-------------------|---------------|----------|-------------------|------------------------------------|
| `id`              | TEXT          | NOT NULL | —                 | Primary key (UUID)                 |
| `student_id`      | TEXT          | NOT NULL | —                 | FK → students.id                   |
| `amount`          | INTEGER       | NOT NULL | —                 | Positive = earned, negative = penalty |
| `reason`          | TEXT          | NOT NULL | —                 | `task_completed` / `missed_day_penalty` |
| `related_task_id` | TEXT          | YES      | —                 | Task that triggered this transaction |
| `created_at`      | TIMESTAMP(3)  | NOT NULL | CURRENT_TIMESTAMP |                                    |

### `job_postings` (NLP Service/SQLAlchemy)

| Column                 | Type     | Nullable | Default        | Notes                    |
|------------------------|----------|----------|----------------|--------------------------|
| `id`                   | INTEGER  | NOT NULL | SERIAL         | Primary key              |
| `source_url`           | VARCHAR  | NOT NULL | —              | Unique                   |
| `title`                | VARCHAR  | YES      | —              |                          |
| `company`              | VARCHAR  | YES      | —              |                          |
| `raw_text`             | TEXT     | YES      | —              | Original posting text    |
| `description`          | TEXT     | YES      | —              |                          |
| `source_site`          | VARCHAR  | YES      | `'manual_seed'`|                          |
| `fetched_at`           | TIMESTAMP| YES      | `now()`        |                          |
| `cleaned_text`         | TEXT     | YES      | —              | After NLP text cleaning  |
| `is_duplicate`         | BOOLEAN  | NOT NULL | `FALSE`        | Near-duplicate flag      |
| `role`                 | VARCHAR  | YES      | —              | Extracted job role       |
| `sector`               | VARCHAR  | YES      | —              | Classified sector        |
| `min_experience_years` | INTEGER  | YES      | —              |                          |
| `max_experience_years` | INTEGER  | YES      | —              |                          |
| `experience_level`     | VARCHAR  | YES      | —              | entry / mid / senior     |

### `extracted_skills` (NLP Service/SQLAlchemy)

| Column           | Type     | Nullable | Default | Notes                              |
|------------------|----------|----------|---------|------------------------------------|
| `id`             | INTEGER  | NOT NULL | SERIAL  | Primary key                        |
| `job_posting_id` | INTEGER  | NOT NULL | —       | FK → job_postings.id (CASCADE)     |
| `skill`          | VARCHAR  | NOT NULL | —       | Skill name from taxonomy           |
| `confidence`     | FLOAT    | NOT NULL | —       | 0.80–1.00                          |
| `created_at`     | TIMESTAMP| NOT NULL | `now()` |                                    |

**Unique constraint**: `(job_posting_id, skill)`

---

## Orphaned / Legacy Tables

> [!WARNING]
> **Flagged for future cleanup** — These tables are harmless but unused.

### `"JobPosting"` (Prisma initial migration — ORPHANED)

Created by the initial Prisma migration (`20260724201732_initial`). This is a **separate table**
from the nlp-service's `job_postings` table (note: different casing and different column structure).

| Column        | Type    |
|---------------|---------|
| `id`          | SERIAL PK |
| `title`       | TEXT    |
| `company`     | TEXT    |
| `description` | TEXT    |

**Status**: Orphaned. No code references this table. The corresponding Prisma model was removed
from `schema.prisma` to prevent confusion with the nlp-service's `job_postings` table. A previous
session incorrectly added this table as a Prisma model, which violated the table ownership rules.

**Action**: Do not drop without coordinating a migration cleanup across all environments.

### `"User"` and `"Skill"` (Prisma initial migration)

Created by the initial migration. Models remain in `schema.prisma` for migration history
consistency but are not actively used by any service code. May be repurposed for future
authentication and role management features.

---

## Day Boundary Convention

All date/day logic uses **UTC midnight**, computed via:

```javascript
const now = new Date();
const todayUTC = new Date(
  Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)
);
```

This is used consistently in:
- `taskService.js` — task generation and expiry
- `streakService.js` — streak calculation
- `dailyTaskScheduler.js` — cron runs at 00:05 UTC

**Never** use server local time or client local time for task/day boundaries.

---

## XP Level System

| Level | Name           | XP Threshold |
|-------|----------------|-------------|
| 1     | Starter        | 0           |
| 2     | Learner        | 200         |
| 3     | Builder        | 600         |
| 4     | Achiever       | 1,500       |
| 5     | Specialist     | 3,000       |
| 6     | Industry-Ready | 6,000       |

**Missed day penalty**: −5 XP (applies only if student has expired pending tasks AND is NOT in study mode).

**Study mode**: When active (`study_mode_until > now()`), blocks both the XP penalty and the streak reset.
