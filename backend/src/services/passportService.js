const prisma = require('../lib/prisma');
const crypto = require('crypto');

/**
 * Get student's Skill Passport.
 * Calculates verified skills (both quiz passed and peer reviewed approved),
 * in-progress skills, and completed courses from finished roadmap resources.
 */
async function getPassport(studentId) {
  const student = await prisma.student.findUnique({
    where: { id: studentId }
  });
  if (!student) throw new Error('Student not found');

  // Find or auto-create passport settings (public link, token)
  let passport = await prisma.skillPassport.findUnique({
    where: { studentId },
    include: {
      courses: {
        orderBy: { completedAt: 'desc' }
      }
    }
  });
  if (!passport) {
    passport = await prisma.skillPassport.create({
      data: {
        studentId,
        isPublic: false,
        shareToken: crypto.randomBytes(16).toString('hex')
      },
      include: { courses: true }
    });
  }

  // Calculate quiz-passed skills (with null-safety on deep relations)
  const passedAttempts = await prisma.quizAttempt.findMany({
    where: { studentId, passed: true },
    include: {
      quiz: {
        include: {
          resource: {
            include: { step: true }
          }
        }
      }
    }
  });
  const quizPassedSkills = new Set(
    passedAttempts
      .filter(a => a.quiz?.resource?.step?.skillName)
      .map(a => a.quiz.resource.step.skillName)
  );

  // Calculate peer-approved skills
  const verifications = await prisma.skillVerification.findMany({
    where: { studentId, status: 'approved' }
  });
  const peerApprovedSkills = new Set(verifications.map(v => v.skillName));

  // Find all skills associated with the student's roadmap steps
  const roadmapSteps = await prisma.roadmapStep.findMany({
    where: { roadmap: { studentId } },
    orderBy: { order: 'asc' }
  });

  const verifiedSkills = [];
  const inProgressSkills = [];

  roadmapSteps.forEach(step => {
    const isQuizPassed = quizPassedSkills.has(step.skillName);
    const isPeerApproved = peerApprovedSkills.has(step.skillName);
    const isVerified = isQuizPassed && isPeerApproved;

    const skillData = {
      skillName: step.skillName,
      demandPercent: step.demandPercent,
      durationWeeks: step.durationWeeks,
      description: step.description,
      isQuizPassed,
      isPeerApproved,
      isVerified
    };

    if (isVerified) {
      verifiedSkills.push(skillData);
    } else {
      inProgressSkills.push(skillData);
    }
  });

  // Build completed courses list from passport_courses table
  const completedCourses = passport.courses.map(c => ({
    id: c.id,
    title: c.title,
    type: c.type,
    url: c.url,
    skillName: c.skillName,
    completedAt: c.completedAt
  }));

  return {
    student: {
      name: student.name,
      email: student.email,
      level: student.level,
      currentXP: student.currentXP
    },
    passport: {
      id: passport.id,
      isPublic: passport.isPublic,
      shareToken: passport.shareToken,
      createdAt: passport.createdAt
    },
    verifiedSkills,
    inProgressSkills,
    completedCourses
  };
}

/**
 * Toggle public status of the passport and return the link
 */
async function updateSharingSettings(studentId, isPublic) {
  let passport = await prisma.skillPassport.findUnique({ where: { studentId } });
  if (!passport) {
    passport = await prisma.skillPassport.create({
      data: {
        studentId,
        isPublic,
        shareToken: crypto.randomBytes(16).toString('hex')
      }
    });
  } else {
    passport = await prisma.skillPassport.update({
      where: { studentId },
      data: { isPublic }
    });
  }

  return passport;
}

/**
 * Fetch a shared passport by its token
 */
async function getSharedPassport(shareToken) {
  const passport = await prisma.skillPassport.findUnique({
    where: { shareToken },
    include: { student: true }
  });

  if (!passport || !passport.isPublic) {
    throw new Error('This Skill Passport is private or does not exist.');
  }

  return await getPassport(passport.studentId);
}

module.exports = {
  getPassport,
  updateSharingSettings,
  getSharedPassport
};
