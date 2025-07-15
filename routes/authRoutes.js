const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const BOT_TOKEN = process.env.BOT_TOKEN;
const JWT_SECRET = process.env.JWT_SECRET;

function verifyTelegramAuth(data) {
  const { hash, ...fields } = data;
  const secret = crypto.createHash('sha256').update(BOT_TOKEN).digest();
  const sorted = Object.keys(fields)
    .sort()
    .map((key) => `${key}=${fields[key]}`)
    .join('\n');

  const hmac = crypto.createHmac('sha256', secret).update(sorted).digest('hex');
  return hmac === hash;
}

router.post('/telegram', async (req, res) => {
  const data = req.body;

  if (!verifyTelegramAuth(data)) {
    return res.status(401).json({ error: 'Invalid Telegram data' });
  }

  const { id, username, first_name, photo_url } = data;
  let user = await User.findOne({ telegramId: id });

  if (!user) {
    user = await User.create({
      telegramId: id,
      username,
      firstName: first_name,
      photoUrl: photo_url
    });
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

  res.json({ token, user });
});

module.exports = router;
