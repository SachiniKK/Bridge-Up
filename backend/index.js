const express = require('express');
const cors = require('cors');
require('dotenv').config();

const prisma = require('./src/lib/prisma');
const taskRoutes = require('./src/routes/tasks');
const xpRoutes = require('./src/routes/xp');
const internalRoutes = require('./src/routes/internal');
const { initDailyTaskScheduler } = require('./src/jobs/dailyTaskScheduler');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'BridgeUp backend is running 🚀' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount API routes
app.use('/api/students', taskRoutes);
app.use('/api/students', xpRoutes);
app.use('/api/internal', internalRoutes);

/**
 * Seed a test student for development/testing.
 * TODO: Remove this fallback when real authentication and user registration are implemented.
 */
async function seedTestStudent() {
  const TEST_STUDENT_ID = 'test-student-id';
  try {
    const existing = await prisma.student.findUnique({
      where: { id: TEST_STUDENT_ID }
    });
    if (!existing) {
      await prisma.student.create({
        data: {
          id: TEST_STUDENT_ID,
          email: 'test@bridgeup.dev',
          name: 'Test Student',
          weeklyHours: 5
        }
      });
      console.log(`[Seed] Created test student: ${TEST_STUDENT_ID}`);
    } else {
      console.log(`[Seed] Test student already exists: ${TEST_STUDENT_ID}`);
    }
  } catch (err) {
    console.error('[Seed] Error seeding test student:', err.message);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // Seed test student on startup
  await seedTestStudent();

  // Initialize the daily task scheduler (00:05 UTC)
  initDailyTaskScheduler();
});