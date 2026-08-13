/*
  Warnings:

  - You are about to drop the `JobPosting` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `age` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentYear` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `degree` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `university` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "aboutMe" TEXT,
ADD COLUMN     "age" INTEGER NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "currentYear" TEXT NOT NULL,
ADD COLUMN     "degree" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "selectedRoles" TEXT[],
ADD COLUMN     "university" TEXT NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'student';

-- DropTable
DROP TABLE "JobPosting";
