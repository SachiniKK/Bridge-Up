-- CreateTable
CREATE TABLE "learning_roadmaps" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "target_role" TEXT NOT NULL,
    "total_weeks" INTEGER NOT NULL DEFAULT 12,
    "potential_xp" INTEGER NOT NULL DEFAULT 1000,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_roadmaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_steps" (
    "id" TEXT NOT NULL,
    "roadmap_id" TEXT NOT NULL,
    "skill_name" TEXT NOT NULL,
    "demand_percent" INTEGER NOT NULL,
    "duration_weeks" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'locked',
    "order" INTEGER NOT NULL,
    "description" TEXT,
    "weeksDetails" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roadmap_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_resources" (
    "id" TEXT NOT NULL,
    "step_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "duration_mins" INTEGER NOT NULL DEFAULT 30,
    "xp_reward" INTEGER NOT NULL DEFAULT 50,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "justification" TEXT,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "roadmap_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_verifications" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "skill_name" TEXT NOT NULL,
    "response_text" TEXT,
    "response_link" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peer_reviews" (
    "id" TEXT NOT NULL,
    "verification_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "peer_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employer_skill_signals" (
    "id" TEXT NOT NULL,
    "employer_id" INTEGER NOT NULL,
    "job_role" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employer_skill_signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employer_skill_requirements" (
    "id" TEXT NOT NULL,
    "signal_id" TEXT NOT NULL,
    "skill_name" TEXT NOT NULL,
    "proficiency" TEXT NOT NULL,

    CONSTRAINT "employer_skill_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_passports" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "share_token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_passports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "learning_roadmaps_student_id_key" ON "learning_roadmaps"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "skill_verifications_student_id_skill_name_key" ON "skill_verifications"("student_id", "skill_name");

-- CreateIndex
CREATE UNIQUE INDEX "peer_reviews_verification_id_reviewer_id_key" ON "peer_reviews"("verification_id", "reviewer_id");

-- CreateIndex
CREATE UNIQUE INDEX "employer_skill_requirements_signal_id_skill_name_key" ON "employer_skill_requirements"("signal_id", "skill_name");

-- CreateIndex
CREATE UNIQUE INDEX "skill_passports_student_id_key" ON "skill_passports"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "skill_passports_share_token_key" ON "skill_passports"("share_token");

-- AddForeignKey
ALTER TABLE "learning_roadmaps" ADD CONSTRAINT "learning_roadmaps_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_steps" ADD CONSTRAINT "roadmap_steps_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "learning_roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_resources" ADD CONSTRAINT "roadmap_resources_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "roadmap_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "roadmap_resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_verifications" ADD CONSTRAINT "skill_verifications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peer_reviews" ADD CONSTRAINT "peer_reviews_verification_id_fkey" FOREIGN KEY ("verification_id") REFERENCES "skill_verifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peer_reviews" ADD CONSTRAINT "peer_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employer_skill_signals" ADD CONSTRAINT "employer_skill_signals_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employer_skill_requirements" ADD CONSTRAINT "employer_skill_requirements_signal_id_fkey" FOREIGN KEY ("signal_id") REFERENCES "employer_skill_signals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_passports" ADD CONSTRAINT "skill_passports_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
