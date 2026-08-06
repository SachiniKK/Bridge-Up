-- AlterTable: link students to users
ALTER TABLE "students" ADD COLUMN "user_id" INTEGER;
CREATE UNIQUE INDEX "students_user_id_key" ON "students"("user_id");
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: add related_entity_id to xp_transactions
ALTER TABLE "xp_transactions" ADD COLUMN "related_entity_id" TEXT;

-- AlterTable: add companyName to User
ALTER TABLE "User" ADD COLUMN "companyName" TEXT;

-- CreateTable: communities
CREATE TABLE "communities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "skill_tag" TEXT NOT NULL,
    "member_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "communities_pkey" PRIMARY KEY ("id")
);

-- CreateTable: community_memberships
CREATE TABLE "community_memberships" (
    "id" TEXT NOT NULL,
    "community_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "community_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable: discussions
CREATE TABLE "discussions" (
    "id" TEXT NOT NULL,
    "community_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "discussions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: discussion_comments
CREATE TABLE "discussion_comments" (
    "id" TEXT NOT NULL,
    "discussion_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "discussion_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable: discussion_likes
CREATE TABLE "discussion_likes" (
    "id" TEXT NOT NULL,
    "discussion_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "discussion_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable: weekly_challenges
CREATE TABLE "weekly_challenges" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "skill_tag" TEXT NOT NULL,
    "xp_reward" INTEGER NOT NULL DEFAULT 50,
    "start_date" DATE NOT NULL,
    "deadline" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "weekly_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable: challenge_submissions
CREATE TABLE "challenge_submissions" (
    "id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "response_text" TEXT,
    "response_link" TEXT,
    "status" TEXT NOT NULL DEFAULT 'accepted',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "challenge_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: events
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "employer_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "location" TEXT,
    "link" TEXT,
    "event_date" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER,
    "registration_count" INTEGER NOT NULL DEFAULT 0,
    "skills" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable: event_registrations
CREATE TABLE "event_registrations" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "community_memberships_community_id_student_id_key" ON "community_memberships"("community_id", "student_id");
CREATE UNIQUE INDEX "discussion_likes_discussion_id_student_id_key" ON "discussion_likes"("discussion_id", "student_id");
CREATE UNIQUE INDEX "challenge_submissions_challenge_id_student_id_key" ON "challenge_submissions"("challenge_id", "student_id");
CREATE UNIQUE INDEX "event_registrations_event_id_student_id_key" ON "event_registrations"("event_id", "student_id");

-- AddForeignKey
ALTER TABLE "community_memberships" ADD CONSTRAINT "community_memberships_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "community_memberships" ADD CONSTRAINT "community_memberships_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "discussion_comments" ADD CONSTRAINT "discussion_comments_discussion_id_fkey" FOREIGN KEY ("discussion_id") REFERENCES "discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "discussion_comments" ADD CONSTRAINT "discussion_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "discussion_likes" ADD CONSTRAINT "discussion_likes_discussion_id_fkey" FOREIGN KEY ("discussion_id") REFERENCES "discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "discussion_likes" ADD CONSTRAINT "discussion_likes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "challenge_submissions" ADD CONSTRAINT "challenge_submissions_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "weekly_challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "challenge_submissions" ADD CONSTRAINT "challenge_submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "events_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
