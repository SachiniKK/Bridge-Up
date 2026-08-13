const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/students/:studentId/notifications
 * Retrieve student's list of alerts and notifications.
 */
router.get('/:studentId/notifications', requireAuth, async (req, res) => {
  try {
    const list = await notificationService.getNotifications(req.params.studentId);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/students/:studentId/notifications/:id/read
 * Mark a notification as read.
 */
router.post('/:studentId/notifications/:id/read', requireAuth, async (req, res) => {
  try {
    const result = await notificationService.markAsRead(
      req.params.studentId,
      req.params.id
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/students/:studentId/notifications/trigger-reminder
 * Force-trigger a daily task reminder evaluation (for testing US-86).
 */
router.post('/:studentId/notifications/trigger-reminder', requireAuth, async (req, res) => {
  try {
    const reminder = await notificationService.triggerDailyReminder(req.params.studentId);
    res.json({ success: true, reminder });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
