const express = require('express');
const router = express.Router();
const taskService = require('../services/taskService');

/**
 * Middleware to check internal API key header
 */
function checkApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const expectedApiKey = process.env.INTERNAL_API_KEY || 'internal-secret-key';
  
  if (!apiKey || apiKey !== expectedApiKey) {
    return res.status(401).json({ error: "Unauthorized internal access." });
  }
  next();
}

/**
 * POST /api/internal/tasks/regenerate-tomorrow
 * Expire yesterday's tasks and pre-generate tomorrow's tasks for all active students.
 */
router.post('/tasks/regenerate-tomorrow', checkApiKey, async (req, res) => {
  try {
    const result = await taskService.regenerateTomorrowsTasks();
    res.json(result);
  } catch (error) {
    console.error("Error in POST /internal/tasks/regenerate-tomorrow:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
