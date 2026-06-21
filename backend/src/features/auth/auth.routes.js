const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getMe } = require('./auth.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', authenticateToken, getMe);

module.exports = router;
