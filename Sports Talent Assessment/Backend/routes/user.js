// routes/user.js
const express = require('express');
const router = express.Router();

const User = require('../models/User');
const TestResult = require('../models/TestResult');

router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const tests = await TestResult.find({ userId: user._id }).sort({ createdAt: -1 });

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        totalTests: tests.length,
      },
      tests,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

module.exports = router;
