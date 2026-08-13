const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireEmployer } = require('../middleware/auth');

/**
 * POST /api/employer/signals
 * Add or update employer skill requirements.
 * Replaces old requirements if the same job role is submitted again.
 */
router.post('/signals', requireEmployer, async (req, res) => {
  try {
    const { jobRole, industry, skills } = req.body;
    const employerId = req.user.userId;

    if (!jobRole?.trim()) throw new Error('Job role is required');
    if (!industry?.trim()) throw new Error('Industry is required');
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      throw new Error('At least one skill requirement is required');
    }

    // Check existing signal for the same role and employer
    const existingSignal = await prisma.employerSkillSignal.findFirst({
      where: { employerId, jobRole: jobRole.trim() }
    });

    const result = await prisma.$transaction(async (tx) => {
      let signal;
      if (existingSignal) {
        // Update existing signal and clear previous requirements
        signal = await tx.employerSkillSignal.update({
          where: { id: existingSignal.id },
          data: { industry: industry.trim() }
        });
        await tx.employerSkillRequirement.deleteMany({
          where: { signalId: signal.id }
        });
      } else {
        // Create new signal
        signal = await tx.employerSkillSignal.create({
          data: {
            employerId,
            jobRole: jobRole.trim(),
            industry: industry.trim()
          }
        });
      }

      // Add new requirements
      const reqData = skills.map(s => ({
        signalId: signal.id,
        skillName: s.skillName.trim(),
        proficiency: s.proficiency || 'intermediate'
      }));

      await tx.employerSkillRequirement.createMany({
        data: reqData
      });

      return await tx.employerSkillSignal.findUnique({
        where: { id: signal.id },
        include: { skills: true }
      });
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/employer/signals
 * List all skill signals created by this employer.
 */
router.get('/signals', requireEmployer, async (req, res) => {
  try {
    const signals = await prisma.employerSkillSignal.findMany({
      where: { employerId: req.user.userId },
      include: { skills: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(signals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/employer/signals/:id
 * Delete an employer skill signal.
 */
router.delete('/signals/:id', requireEmployer, async (req, res) => {
  try {
    const { id } = req.params;
    const signal = await prisma.employerSkillSignal.findFirst({
      where: { id, employerId: req.user.userId }
    });
    if (!signal) throw new Error('Signal not found or unauthorized');

    await prisma.employerSkillSignal.delete({ where: { id } });
    res.json({ success: true, message: 'Signal deleted successfully.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
