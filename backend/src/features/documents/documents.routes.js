const express = require('express');
const router = express.Router();
const { generatePdf, generateDocx } = require('./documents.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');

router.get('/pdf', authenticateToken, generatePdf);
router.get('/docx', authenticateToken, generateDocx);

module.exports = router;
