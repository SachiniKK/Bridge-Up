const prisma = require('../lib/prisma');
const { getLevelForXP } = require('../config/levels');

/**
 * Award XP to a student
 */
async function awardXP(studentId, amount, reason, relatedTaskId = null, relatedEntityId = null) {
  if (amount <= 0) return { newXP: 0, newLevel: 1, leveledUp: false };

  return await prisma.$transaction(async (tx) => {
    const student = await tx.student.findUnique({ where: { id: studentId } });
    if (!student) throw new Error(`Student ${studentId} not found`);

    const oldLevel = student.level;
    const newXP = student.currentXP + amount;
    const levelInfo = getLevelForXP(newXP);

    await tx.xPTransaction.create({
      data: { studentId, amount, reason, relatedTaskId, relatedEntityId }
    });

    const updatedStudent = await tx.student.update({
      where: { id: studentId },
      data: { currentXP: newXP, level: levelInfo.level }
    });

    return {
      newXP: updatedStudent.currentXP,
      newLevel: updatedStudent.level,
      leveledUp: updatedStudent.level > oldLevel
    };
  });
}

/**
 * Award XP only if no prior transaction exists for the same reason + entity.
 * Returns { awarded: false } if already awarded.
 */
async function awardXPOnce(studentId, amount, reason, relatedEntityId) {
  const existing = await prisma.xPTransaction.findFirst({
    where: { studentId, reason, relatedEntityId }
  });
  if (existing) return { awarded: false, xpResult: null };

  const xpResult = await awardXP(studentId, amount, reason, null, relatedEntityId);
  return { awarded: true, xpResult };
}

/**
 * Apply missed day penalty to a student (-5 XP by default)
 */
async function applyMissedDayPenalty(studentId) {
  return await prisma.$transaction(async (tx) => {
    const student = await tx.student.findUnique({ where: { id: studentId } });
    if (!student) throw new Error(`Student ${studentId} not found`);

    const oldLevel = student.level;
    const newXP = Math.max(0, student.currentXP - require('../config/levels').MISSED_DAY_PENALTY);
    const amountLost = newXP - student.currentXP;

    if (amountLost === 0) {
      return { newXP: student.currentXP, newLevel: student.level, leveledUp: false };
    }

    const levelInfo = getLevelForXP(newXP);

    await tx.xPTransaction.create({
      data: { studentId, amount: amountLost, reason: 'missed_day_penalty' }
    });

    const updatedStudent = await tx.student.update({
      where: { id: studentId },
      data: { currentXP: newXP, level: levelInfo.level }
    });

    return {
      newXP: updatedStudent.currentXP,
      newLevel: updatedStudent.level,
      leveledUp: updatedStudent.level > oldLevel
    };
  });
}

async function enableStudyMode(studentId, daysFromNow) {
  const studyModeUntil = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
  return await prisma.student.update({
    where: { id: studentId },
    data: { studyModeUntil }
  });
}

async function disableStudyMode(studentId) {
  return await prisma.student.update({
    where: { id: studentId },
    data: { studyModeUntil: null }
  });
}

module.exports = {
  awardXP,
  awardXPOnce,
  applyMissedDayPenalty,
  enableStudyMode,
  disableStudyMode
};
