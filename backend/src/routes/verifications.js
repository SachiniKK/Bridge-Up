const express = require('express');
const router = express.Router();
const peerService = require('../services/peerService');
const { requireAuth } = require('../middleware/auth');

/**
 * POST /api/students/:studentId/verifications
 * Submit a skill verification claim with evidence.
 */
router.post('/:studentId/verifications', requireAuth, async (req, res) => {
  try {
    const { skillName, responseText, responseLink } = req.body;
    if (!skillName) throw new Error('Skill name is required');

    const result = await peerService.submitVerification(
      req.params.studentId,
      skillName,
      responseText,
      responseLink
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/students/:studentId/verifications/pending
 * Retrieve pending skill verifications of peers.
 */
router.get('/:studentId/verifications/pending', requireAuth, async (req, res) => {
  try {
    const pending = await peerService.getPendingVerifications(req.params.studentId);
    res.json(pending);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/students/:studentId/verifications/:id/review
 * Submit a peer review approval or rejection.
 */
router.post('/:studentId/verifications/:id/review', requireAuth, async (req, res) => {
  try {
    const { approved, comment } = req.body;
    if (approved === undefined) throw new Error('Approval vote (true/false) is required');

    const result = await peerService.reviewVerification(
      req.params.studentId,
      req.params.id,
      approved,
      comment
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/students/:studentId/verifications/my
 * Retrieve all verifications submitted by the authenticated student.
 */
router.get('/:studentId/verifications/my', requireAuth, async (req, res) => {
  try {
    const list = await peerService.getStudentVerifications(req.params.studentId);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
