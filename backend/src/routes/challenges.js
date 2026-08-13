const express = require('express');
const router = express.Router();
const challengeService = require('../services/challengeService');
const { requireAuth } = require('../middleware/auth');

router.get('/:studentId/challenges/current', requireAuth, async (req, res) => {
  try {
    const challenge = await challengeService.getCurrentChallenge();
    if (!challenge) return res.json({ challenge: null });

    const submission = await challengeService.getStudentSubmission(
      req.params.studentId, challenge.id
    );

    res.json({ challenge, submission });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:studentId/challenges/:challengeId/submit', requireAuth, async (req, res) => {
  try {
    const { responseText, responseLink } = req.body;
    const result = await challengeService.submitChallenge(
      req.params.studentId, req.params.challengeId, responseText, responseLink
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
