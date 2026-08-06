const express = require('express');
const router = express.Router();
const taskService = require('../services/taskService');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/students/:studentId/tasks/today
 * Retrieve or generate today's tasks
 */
router.get('/:studentId/tasks/today', requireAuth, async (req, res) => {
  try {
    const tasks = await taskService.getTodaysTasks(req.params.studentId);
    res.json(tasks);
  } catch (error) {
    console.error("Error in GET /tasks/today:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/students/:studentId/tasks/:taskId/complete
 * Mark a task as completed and award XP
 */
router.post('/:studentId/tasks/:taskId/complete', requireAuth, async (req, res) => {
  try {
    const result = await taskService.completeTask(req.params.studentId, req.params.taskId);
    res.json(result);
  } catch (error) {
    console.error("Error in POST /tasks/:taskId/complete:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/students/:studentId/tasks/:taskId/skip
 * Skip a task
 */
router.post('/:studentId/tasks/:taskId/skip', requireAuth, async (req, res) => {
  try {
    const task = await taskService.skipTask(req.params.studentId, req.params.taskId);
    res.json(task);
  } catch (error) {
    console.error("Error in POST /tasks/:taskId/skip:", error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
