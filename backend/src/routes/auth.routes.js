const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Auth endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
