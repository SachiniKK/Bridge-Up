const prisma = require('../lib/prisma');
const xpService = require('./xpService');
const streakService = require('./streakService');

/**
 * Helper to generate tasks for a specific student on a specific UTC Date
 */
async function generateTasksForDate(studentId, dateUTC) {
  const student = await prisma.student.findUnique({
    where: { id: studentId }
  });

  if (!student) throw new Error(`Student ${studentId} not found`);

  // Check if tasks already exist for this date
  const existing = await prisma.dailyTask.findMany({
    where: {
      studentId,
      taskDate: dateUTC
    }
  });

  if (existing.length > 0) {
    return existing;
  }

  // Determine size: weeklyHours / 7
  const count = Math.max(1, Math.round(student.weeklyHours / 7));

  // Query extracted_skills using parameterized raw SQL template syntax
  let skills = [];
  try {
    skills = await prisma.$queryRaw`SELECT DISTINCT skill FROM extracted_skills LIMIT 20`;
  } catch (err) {
    console.error("Error fetching extracted skills via raw query:", err);
  }

  const defaultSkills = ["React", "Node.js", "Prisma", "PostgreSQL", "CSS", "Tailwind CSS"];
  const skillTags = skills.length > 0 ? skills.map(s => s.skill) : defaultSkills;

  const tasksData = [];
  for (let i = 0; i < count; i++) {
    const skillTag = skillTags[i % skillTags.length];
    
    const templates = [
      {
        title: `Complete a practice exercise on ${skillTag}`,
        description: `Implement a small component or write a function using ${skillTag} and test its behavior.`
      },
      {
        title: `Review core concepts of ${skillTag}`,
        description: `Read documentation or watch a 15-minute tutorial video highlighting advanced use cases of ${skillTag}.`
      },
      {
        title: `Debug and optimize ${skillTag} code`,
        description: `Analyze performance or clean up structure of an existing ${skillTag} implementation.`
      }
    ];

    const template = templates[i % templates.length];
    tasksData.push({
      studentId,
      title: template.title,
      description: template.description,
      skillTag,
      xpValue: 10 + (i * 5),
      taskDate: dateUTC,
      status: "pending"
    });
  }

  // Create tasks in DB
  await prisma.dailyTask.createMany({
    data: tasksData
  });

  return await prisma.dailyTask.findMany({
    where: {
      studentId,
      taskDate: dateUTC
    }
  });
}

/**
 * Fetch today's tasks. Generates them first if none exist yet.
 */
async function getTodaysTasks(studentId) {
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

  let tasks = await prisma.dailyTask.findMany({
    where: {
      studentId,
      taskDate: todayUTC
    }
  });

  if (tasks.length === 0) {
    tasks = await generateTasksForDate(studentId, todayUTC);
  }

  return tasks;
}

/**
 * Complete a daily task and award XP.
 *
 * NOTE: Do NOT wrap this in a prisma.$transaction(). xpService.awardXP() and
 * streakService.updateStreakOnTaskCompletion() each open their own internal
 * Prisma transactions. Nesting them inside an outer transaction causes the
 * inner transactions to silently do nothing (Prisma interactive tx limitation),
 * meaning XP would never actually be credited. Sequential awaits are correct here.
 */
async function completeTask(studentId, taskId) {
  // 1. Fetch and validate the task
  const task = await prisma.dailyTask.findUnique({
    where: { id: taskId }
  });

  if (!task) throw new Error(`Task ${taskId} not found`);
  if (task.studentId !== studentId) throw new Error(`Task does not belong to student`);
  if (task.status !== "pending") throw new Error(`Task is already completed, skipped, or expired`);

  // 2. Mark task completed
  const updatedTask = await prisma.dailyTask.update({
    where: { id: taskId },
    data: {
      status: "completed",
      completedAt: new Date()
    }
  });

  // 3. Award XP — has its own internal transaction, must NOT be nested
  const xpResult = await xpService.awardXP(studentId, task.xpValue, "task_completed", taskId);

  // 4. Update streak count — also has its own internal transaction
  const newStreak = await streakService.updateStreakOnTaskCompletion(studentId);

  return {
    task: updatedTask,
    xpResult,
    newStreak
  };
}

/**
 * Skip a daily task
 */
async function skipTask(studentId, taskId) {
  const task = await prisma.dailyTask.findUnique({
    where: { id: taskId }
  });

  if (!task) throw new Error(`Task ${taskId} not found`);
  if (task.studentId !== studentId) throw new Error(`Task does not belong to student`);
  if (task.status !== "pending") throw new Error(`Task is already completed, skipped, or expired`);

  return await prisma.dailyTask.update({
    where: { id: taskId },
    data: {
      status: "skipped"
    }
  });
}

/**
 * Expire yesterday's incomplete tasks and penalize if not in study mode
 */
async function expireYesterdaysIncompleteTasks() {
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const yesterdayUTC = new Date(todayUTC.getTime() - 24 * 60 * 60 * 1000);

  // 1. Mark all pending tasks older than today as expired
  const expiredTasksCount = await prisma.dailyTask.updateMany({
    where: {
      taskDate: {
        lt: todayUTC
      },
      status: "pending"
    },
    data: {
      status: "expired"
    }
  });

  // 2. Penalize students who missed yesterday's tasks (had expired status)
  const yesterdayExpiredTasks = await prisma.dailyTask.findMany({
    where: {
      taskDate: yesterdayUTC,
      status: "expired"
    },
    select: {
      studentId: true
    }
  });

  const studentIdsToPenalize = [...new Set(yesterdayExpiredTasks.map(t => t.studentId))];
  const penaltyResults = [];

  for (const studentId of studentIdsToPenalize) {
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (student) {
      const isStudyModeActive = student.studyModeUntil && new Date(student.studyModeUntil) > now;
      if (!isStudyModeActive) {
        const res = await xpService.applyMissedDayPenalty(studentId);
        penaltyResults.push({ studentId, penaltyApplied: true, res });
      } else {
        penaltyResults.push({ studentId, penaltyApplied: false, reason: "study_mode_active" });
      }
    }
  }

  return {
    expiredCount: expiredTasksCount.count,
    penalizedStudents: penaltyResults
  };
}

/**
 * Run midnight cron sequence: expire yesterday's and generate tomorrow's
 */
async function regenerateTomorrowsTasks() {
  // 1. Expire yesterday's first
  const expireResult = await expireYesterdaysIncompleteTasks();

  // 2. Generate tomorrow's tasks
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const tomorrowUTC = new Date(todayUTC.getTime() + 24 * 60 * 60 * 1000);

  const students = await prisma.student.findMany();
  const generated = [];

  for (const student of students) {
    const tasks = await generateTasksForDate(student.id, tomorrowUTC);
    generated.push({ studentId: student.id, count: tasks.length });
  }

  return {
    expireResult,
    generated
  };
}

module.exports = {
  generateTodaysTasks: getTodaysTasks, // Map generateTodaysTasks to getTodaysTasks for endpoint convenience
  getTodaysTasks,
  completeTask,
  skipTask,
  expireYesterdaysIncompleteTasks,
  regenerateTomorrowsTasks,
  generateTasksForDate
};
