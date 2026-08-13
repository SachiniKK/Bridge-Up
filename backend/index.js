const express = require('express');
const cors = require('cors');
require('dotenv').config();

const prisma = require('./src/lib/prisma');
const taskRoutes = require('./src/routes/tasks');
const xpRoutes = require('./src/routes/xp');
const communityRoutes = require('./src/routes/communities');
const challengeRoutes = require('./src/routes/challenges');
const eventRoutes = require('./src/routes/events');
const internalRoutes = require('./src/routes/internal');
const { initDailyTaskScheduler } = require('./src/jobs/dailyTaskScheduler');
const { seedCommunitiesAndChallenges } = require('./src/seed/seedData');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./src/routes/auth.routes');
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'BridgeUp backend is running 🚀' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount API routes
const employerRoutes = require('./src/routes/employer');
app.use('/api/employer', employerRoutes);

app.use('/api/students', taskRoutes);
app.use('/api/students', xpRoutes);
app.use('/api/students', communityRoutes);
app.use('/api/students', challengeRoutes);
app.use('/api/students', eventRoutes);
const roadmapRoutes = require('./src/routes/roadmap');
app.use('/api/students', roadmapRoutes);
const careerRoutes = require('./src/routes/career');
app.use('/api/students', careerRoutes);
const quizRoutes = require('./src/routes/quizzes');
app.use('/api/students', quizRoutes);
const verificationRoutes = require('./src/routes/verifications');
app.use('/api/students', verificationRoutes);
const passportRoutes = require('./src/routes/passport');
app.use('/api/students', passportRoutes);
const notificationRoutes = require('./src/routes/notifications');
app.use('/api/students', notificationRoutes);
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

  await seedTestStudent();
  await seedCommunitiesAndChallenges();
  initDailyTaskScheduler();
});