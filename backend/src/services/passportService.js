const prisma = require('../lib/prisma');
const crypto = require('crypto');

/**
 * Get student's Skill Passport.
 * Calculates verified skills (both quiz passed and peer reviewed approved)
 * and in-progress skills.
 */
async function getPassport(studentId) {
  const student = await prisma.student.findUnique({
    where: { id: studentId }
  });
  if (!student) throw new Error('Student not found');

  // Find passport settings (public link, token)
  let passport = await prisma.skillPassport.findUnique({
    where: { studentId }
  });
  if (!passport) {
    passport = await prisma.skillPassport.create({
      data: {
        studentId,
        isPublic: false,
        shareToken: crypto.randomBytes(16).toString('hex')
      }
    });
  }

  // Calculate quiz-passed skills
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
  const quizPassedSkills = new Set(passedAttempts.map(a => a.quiz.resource.step.skillName));

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

  return {
    student: {
      name: student.name,
      email: student.email,
      level: student.level,
      currentXP: student.currentXP
    },
    passport,
    verifiedSkills,
    inProgressSkills
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
