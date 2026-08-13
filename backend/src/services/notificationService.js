const prisma = require('../lib/prisma');

/**
 * Get all notifications for a student
 */
async function getNotifications(studentId) {
  return await prisma.notification.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Create a new notification for a student
 */
async function createNotification(studentId, title, body, type) {
  return await prisma.notification.create({
    data: {
      studentId,
      title,
      body,
      type
    }
  });
}

/**
 * Mark a specific notification as read
 */
async function markAsRead(studentId, notificationId) {
  const notif = await prisma.notification.findUnique({
    where: { id: notificationId }
  });

  if (!notif) throw new Error('Notification not found');
  if (notif.studentId !== studentId) {
    throw new Error('Unauthorized');
  }

  return await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true }
  });
}

/**
 * Generate daily reminder notification (US-86)
 * Checks if the student has pending incomplete tasks for today and is not in Study Mode (exams)
 */
async function triggerDailyReminder(studentId) {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return null;

  // Check if study mode is active
  if (student.studyModeUntil && new Date(student.studyModeUntil) > new Date()) {
    console.log(`[Notification] Skipped daily reminder for student ${studentId} (Study Mode active)`);
    return null;
  }

  // Check if student has pending tasks for today
  const today = new Date();
  const todayDateStr = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
  
  const pendingTasks = await prisma.dailyTask.findMany({
    where: {
      studentId,
      taskDate: todayDateStr,
      status: 'pending'
    }
  });

  if (pendingTasks.length > 0) {
    return await createNotification(
      studentId,
      'Daily Task Reminder ⏰',
      'You still have pending daily tasks today! Complete them to keep your streak active.',
      'daily_reminder'
    );
  }

  return null;
}

module.exports = {
  getNotifications,
  createNotification,
  markAsRead,
  triggerDailyReminder
};
