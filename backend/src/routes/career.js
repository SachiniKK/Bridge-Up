const express = require('express');
const router = express.Router();
const careerService = require('../services/careerService');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/students/:studentId/career/predict
 * Retrieve student's career path prediction details.
 */
router.get('/:studentId/career/predict', requireAuth, async (req, res) => {
  try {
    const result = await careerService.predictCareerPath(req.params.studentId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/students/:studentId/trends
 * Retrieve active trending and declining skill analytics.
 */
router.get('/:studentId/trends', requireAuth, async (req, res) => {
  try {
    const result = await careerService.getSkillTrends();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
