const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET);
    res.redirect(`/?token=${token}`);
  }
);

// Microsoft OAuth
router.get('/microsoft', passport.authenticate('microsoft'));

router.get('/microsoft/callback',
  passport.authenticate('microsoft', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET);
    res.redirect(`/?token=${token}`);
  }
);

// Local login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(400).json({ message: 'User not found' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Test account creation
router.post('/test-account', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(process.env.TEST_PASSWORD, 10);
    const user = new User({
      email: process.env.TEST_EMAIL,
      password: hashedPassword,
      role: 'admin'
    });
    await user.save();
    res.json({ message: 'Test account created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;