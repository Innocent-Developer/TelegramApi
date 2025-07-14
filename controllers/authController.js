const crypto = require('crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

function checkTelegramAuth(data, botToken) {
  const { hash, ...rest } = data;
  const sorted = Object.keys(rest).sort().map(key => `${key}=${rest[key]}`).join('\n');
  const secret = crypto.createHash('sha256').update(botToken).digest();
  const computedHash = crypto.createHmac('sha256', secret).update(sorted).digest('hex');
  return computedHash === hash;
}

exports.telegramLogin = async (req, res) => {
  try {
    const data = req.body;
    const isValid = checkTelegramAuth(data, process.env.BOT_TOKEN);

    if (!isValid) return res.status(403).json({ msg: 'Invalid Telegram auth' });

    const telegramId = data.id.toString();

    let user = await User.findOne({ telegramId });
    if (!user) {
      user = new User({
        telegramId,
        username: data.username,
        firstName: data.first_name,
        lastName: data.last_name,
        photoUrl: data.photo_url,
        authDate: data.auth_date
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        photoUrl: user.photoUrl
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
