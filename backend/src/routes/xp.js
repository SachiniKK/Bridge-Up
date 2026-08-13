const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const xpService = require('../services/xpService');
const { getLevelForXP } = require('../config/levels');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/students/:studentId/xp
 * Retrieve XP, level, and streak details for a student
 */
router.get('/:studentId/xp', requireAuth, async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.studentId }
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const levelInfo = getLevelForXP(student.currentXP);
    const now = new Date();
    const studyModeActive = student.studyModeUntil ? new Date(student.studyModeUntil) > now : false;

    res.json({
      name: student.name,
      currentXP: student.currentXP,
      level: levelInfo.level,
      levelName: levelInfo.name,
      progressPercent: levelInfo.progressPercent,
      nextThreshold: levelInfo.nextThreshold,
      streakCount: student.streakCount,
      studyModeActive
    });
  } catch (error) {
    console.error("Error in GET /xp:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/students/:studentId/xp/award
 * Award XP to a student for completing tasks or learning activities
 */
router.post('/:studentId/xp/award', requireAuth, async (req, res) => {
  try {
    const { amount, reason, relatedEntityId } = req.body;
    const numAmount = parseInt(amount, 10);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ error: 'Valid positive XP amount is required' });
    }
    const result = await xpService.awardXP(
      req.params.studentId,
      numAmount,
      reason || 'task_completed',
      null,
      relatedEntityId || null
    );
    res.json(result);
  } catch (error) {
    console.error('Error in POST /xp/award:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/students/:studentId/xp/history
 * Fetch paginated XP transactions history for a student
 */
router.get('/:studentId/xp/history', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.xPTransaction.findMany({
        where: { studentId: req.params.studentId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.xPTransaction.count({
        where: { studentId: req.params.studentId }
      })
    ]);

    res.json({
      data: transactions,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error in GET /xp/history:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/students/:studentId/study-mode/enable
 * Enable study mode to protect streak
 */
router.post('/:studentId/study-mode/enable', requireAuth, async (req, res) => {
  try {
    const days = parseInt(req.body.days, 10) || 7;
    const student = await xpService.enableStudyMode(req.params.studentId, days);
    res.json(student);
  } catch (error) {
    console.error("Error in POST /study-mode/enable:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/students/:studentId/study-mode/disable
 * Disable study mode
 */
router.post('/:studentId/study-mode/disable', requireAuth, async (req, res) => {
  try {
    const student = await xpService.disableStudyMode(req.params.studentId);
    res.json(student);
  } catch (error) {
    console.error("Error in POST /study-mode/disable:", error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
