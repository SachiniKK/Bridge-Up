const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Register endpoint
router.post('/register', authController.register);

module.exports = router;
