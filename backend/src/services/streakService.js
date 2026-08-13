const prisma = require('../lib/prisma');

/**
 * Update streak on task completion using UTC midnight day boundary
 */
async function updateStreakOnTaskCompletion(studentId) {
  return await prisma.$transaction(async (tx) => {
    const student = await tx.student.findUnique({
      where: { id: studentId }
    });

    if (!student) throw new Error(`Student ${studentId} not found`);

    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const yesterdayUTC = new Date(todayUTC.getTime() - 24 * 60 * 60 * 1000);

    let newStreak = student.streakCount;
    let isStudyModeActive = false;

    if (student.studyModeUntil) {
      isStudyModeActive = new Date(student.studyModeUntil) > now;
    }

    if (student.lastActiveDate) {
      const lastActive = new Date(student.lastActiveDate);
      const lastActiveUTC = new Date(Date.UTC(lastActive.getUTCFullYear(), lastActive.getUTCMonth(), lastActive.getUTCDate(), 0, 0, 0, 0));

      if (lastActiveUTC.getTime() === todayUTC.getTime()) {
        // Already active today, streak count doesn't change
      } else if (lastActiveUTC.getTime() === yesterdayUTC.getTime()) {
        // Active yesterday, increment streak
        newStreak += 1;
      } else {
        // Active older than yesterday
        if (!isStudyModeActive) {
          newStreak = 1; // reset streak
        }
        // If study mode is active, streak count is protected (keep current value)
      }
    } else {
      // First activity
      newStreak = 1;
    }

    const updated = await tx.student.update({
      where: { id: studentId },
      data: {
        streakCount: newStreak,
        lastActiveDate: todayUTC
      }
    });

    return updated.streakCount;
  });
}

module.exports = {
  updateStreakOnTaskCompletion
};
