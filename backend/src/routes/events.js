const express = require('express');
const router = express.Router();
const eventService = require('../services/eventService');
const { requireAuth, requireEmployer } = require('../middleware/auth');

router.post('/events', requireEmployer, async (req, res) => {
  try {
    const event = await eventService.createEvent(req.user.userId, req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:studentId/events', requireAuth, async (req, res) => {
  try {
    const { skill } = req.query;
    const events = await eventService.listUpcomingEvents(skill || null, req.params.studentId);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:studentId/events/skills', requireAuth, async (req, res) => {
  try {
    const skills = await eventService.getAvailableSkills();
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:studentId/events/registered', requireAuth, async (req, res) => {
  try {
    const events = await eventService.getRegisteredEvents(req.params.studentId);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:studentId/events/:eventId/register', requireAuth, async (req, res) => {
  try {
    const result = await eventService.registerForEvent(req.params.studentId, req.params.eventId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:studentId/events/:eventId/register', requireAuth, async (req, res) => {
  try {
    const result = await eventService.unregisterFromEvent(req.params.studentId, req.params.eventId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
