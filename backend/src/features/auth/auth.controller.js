const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Attachment = require('../../models/Attachment');
const { connectToDatabase } = require('../../config/db');

const JWT_SECRET = process.env.JWT_SECRET;

const registerUser = async (req, res) => {
  try {
    await connectToDatabase();
    const { username, password, captcha } = req.body;
    if (!username || !password || !captcha) {
      return res.status(400).json({ error: 'Username, password, and CAPTCHA are required' });
    }
    const captchaToken = req.cookies.captcha_session;
    if (!captchaToken) {
      return res.status(400).json({ error: 'CAPTCHA session expired. Please refresh CAPTCHA.' });
    }
    let decodedCaptcha;
    try {
      decodedCaptcha = jwt.verify(captchaToken, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'CAPTCHA verification expired or invalid' });
    }
    if (captcha.toLowerCase() !== decodedCaptcha.text) {
      return res.status(400).json({ error: 'Invalid CAPTCHA code. Please try again.' });
    }
    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) {
      return res.status(409).json({ error: 'Username is already taken' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username: cleanUsername,
      password: hashedPassword
    });
    await newUser.save();
    res.clearCookie('captcha_session');
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error occurred' });
  }
};

const loginUser = async (req, res) => {
  try {
    await connectToDatabase();
    const { username, password, captcha } = req.body;
    if (!username || !password || !captcha) {
      return res.status(400).json({ error: 'Username, password, and CAPTCHA are required' });
    }
    const captchaToken = req.cookies.captcha_session;
    if (!captchaToken) {
      return res.status(400).json({ error: 'CAPTCHA session expired. Please refresh CAPTCHA.' });
    }
    let decodedCaptcha;
    try {
      decodedCaptcha = jwt.verify(captchaToken, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'CAPTCHA verification expired or invalid' });
    }
    if (captcha.toLowerCase() !== decodedCaptcha.text) {
      return res.status(400).json({ error: 'Invalid CAPTCHA code. Please try again.' });
    }
    const cleanUsername = username.trim().toLowerCase();
    const user = await User.findOne({ username: cleanUsername });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const token = jwt.sign(
      { userId: user._id.toString(), username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 1000
    });
    res.clearCookie('captcha_session');
    return res.json({
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        username: user.username,
        isSubmitted: user.profileDetails?.isSubmitted || false
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error occurred' });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie('session_token');
  return res.json({ message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
  try {
    await connectToDatabase();
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const attachmentInfo = await Attachment.findOne({ userId: req.user.userId }).select('filename mimeType size');
    return res.json({
      authenticated: true,
      user: {
        id: user._id.toString(),
        username: user.username,
        profileDetails: user.profileDetails
      },
      attachment: attachmentInfo ? {
        filename: attachmentInfo.filename,
        mimeType: attachmentInfo.mimeType,
        size: attachmentInfo.size
      } : null
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error occurred' });
  }
};

module.exports = { registerUser, loginUser, logoutUser, getMe };
