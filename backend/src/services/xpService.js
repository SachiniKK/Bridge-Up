const prisma = require('../lib/prisma');
const { getLevelForXP, MISSED_DAY_PENALTY } = require('../config/levels');

/**
 * Award XP to a student
 */
async function awardXP(studentId, amount, reason, relatedTaskId = null) {
  if (amount <= 0) return { newXP: 0, newLevel: 1, leveledUp: false };

  return await prisma.$transaction(async (tx) => {
    // 1. Fetch current student
    const student = await tx.student.findUnique({
      where: { id: studentId }
    });

    if (!student) throw new Error(`Student ${studentId} not found`);

    const oldLevel = student.level;
    const newXP = student.currentXP + amount;
    const levelInfo = getLevelForXP(newXP);

    // 2. Insert XP transaction
    await tx.xPTransaction.create({
      data: {
        studentId,
        amount,
        reason,
        relatedTaskId
      }
    });

    // 3. Update student
    const updatedStudent = await tx.student.update({
      where: { id: studentId },
      data: {
        currentXP: newXP,
        level: levelInfo.level
      }
    });

    return {
      newXP: updatedStudent.currentXP,
      newLevel: updatedStudent.level,
      leveledUp: updatedStudent.level > oldLevel
    };
  });
}

/**
 * Apply missed day penalty to a student (-5 XP by default)
 */
async function applyMissedDayPenalty(studentId) {
  return await prisma.$transaction(async (tx) => {
    const student = await tx.student.findUnique({
      where: { id: studentId }
    });

    if (!student) throw new Error(`Student ${studentId} not found`);

    const oldLevel = student.level;
    // Calculate new XP (floor at 0)
    const newXP = Math.max(0, student.currentXP - MISSED_DAY_PENALTY);
    const amountLost = newXP - student.currentXP;

    if (amountLost === 0) {
      return {
        newXP: student.currentXP,
        newLevel: student.level,
        leveledUp: false
      };
    }

    const levelInfo = getLevelForXP(newXP);

    // Insert negative transaction
    await tx.xPTransaction.create({
      data: {
        studentId,
        amount: amountLost,
        reason: 'missed_day_penalty'
      }
    });

    const updatedStudent = await tx.student.update({
      where: { id: studentId },
      data: {
        currentXP: newXP,
        level: levelInfo.level
      }
    });

    return {
      newXP: updatedStudent.currentXP,
      newLevel: updatedStudent.level,
      leveledUp: updatedStudent.level > oldLevel
    };
  });
}

/**
 * Enable study mode for a student for a number of days
 */
async function enableStudyMode(studentId, daysFromNow) {
  const now = new Date();
  const studyModeUntil = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);

  return await prisma.student.update({
    where: { id: studentId },
    data: {
      studyModeUntil
    }
  });
}

/**
 * Disable study mode for a student
 */
async function disableStudyMode(studentId) {
  return await prisma.student.update({
    where: { id: studentId },
    data: {
      studyModeUntil: null
    }
  });
}

module.exports = {
  awardXP,
  applyMissedDayPenalty,
  enableStudyMode,
  disableStudyMode
};
