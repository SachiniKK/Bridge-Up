const express = require('express');
const router = express.Router();
const passportService = require('../services/passportService');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/students/:studentId/passport
 * Retrieve student's verified and in-progress skills achievements.
 */
router.get('/:studentId/passport', requireAuth, async (req, res) => {
  try {
    const passport = await passportService.getPassport(req.params.studentId);
    res.json(passport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/students/:studentId/passport/sharing
 * Toggle the passport's public visibility.
 */
router.put('/:studentId/passport/sharing', requireAuth, async (req, res) => {
  try {
    const { isPublic } = req.body;
    if (isPublic === undefined) throw new Error('isPublic boolean is required.');

    const settings = await passportService.updateSharingSettings(
      req.params.studentId,
      isPublic
    );
    res.json(settings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/students/passport/share/:token
 * Public read-only access to view a shared Skill Passport.
 * Note: No requireAuth middleware is applied here to allow public sharing.
 */
router.get('/passport/share/:token', async (req, res) => {
  try {
    const passport = await passportService.getSharedPassport(req.params.token);
    res.json(passport);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;
