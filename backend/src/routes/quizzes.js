const express = require('express');
const router = express.Router();
const quizService = require('../services/quizService');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/students/:studentId/roadmap/resources/:resourceId/quiz
 * Retrieve or start a quiz for a completed resource.
 */
router.get('/:studentId/roadmap/resources/:resourceId/quiz', requireAuth, async (req, res) => {
  try {
    const quiz = await quizService.startQuiz(req.params.studentId, req.params.resourceId);
    res.json(quiz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/students/:studentId/quizzes/:quizId/submit
 * Submit quiz answers and score the attempt.
 */
router.post('/:studentId/quizzes/:quizId/submit', requireAuth, async (req, res) => {
  try {
    const { answers } = req.body;
    const result = await quizService.submitQuiz(req.params.studentId, req.params.quizId, answers);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/students/:studentId/quizzes/attempts
 * List all quiz attempts history.
 */
router.get('/:studentId/quizzes/attempts', requireAuth, async (req, res) => {
  try {
    const history = await quizService.getQuizHistory(req.params.studentId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
