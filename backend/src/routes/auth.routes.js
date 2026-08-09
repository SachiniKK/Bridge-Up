const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');

// Auth endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/admin/login', authController.adminLogin);
router.post('/suggest-roles', authController.suggestRoles);

// Profile and onboarding endpoints
router.put('/students/:studentId/profile', requireAuth, authController.updateProfile);
router.put('/students/:studentId/onboarding', requireAuth, authController.updateOnboarding);

module.exports = router;
