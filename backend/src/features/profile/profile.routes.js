const express = require('express');
const router = express.Router();
const multer = require('multer');
const { updateDetails, changePassword } = require('./profile.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/details', authenticateToken, upload.single('file'), updateDetails);
router.post('/change-password', authenticateToken, changePassword);

module.exports = router;
