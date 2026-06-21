const express = require('express');
const router = express.Router();
const { getCaptcha } = require('./captcha.controller');

router.get('/', getCaptcha);

module.exports = router;
