const express = require('express');
const router = express.Router();
const { telegramLogin } = require('../controllers/authController');

router.post('/auth/telegram', telegramLogin);

module.exports = router;
