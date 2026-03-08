// routes/tests.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');

const TestResult = require('../models/TestResult');
const User = require('../models/User');
const { classifyPerformance } = require('../utils/benchmarks');

// ==== Multer (video upload) ====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.mp4';
    cb(null, unique + ext);
  },
});
const upload = multer({ storage });

// ==== ANALYZE TEST ====
router.post(
  '/analyze/:userId/:testType',
  upload.single('video'),
  async (req, res) => {
    try {
      const { userId, testType } = req.params;

      if (!req.file) {
        return res.status(400).json({ error: 'No video file uploaded' });
      }

      const videoPath = req.file.path;
      console.log('Video uploaded:', videoPath, 'TestType:', testType);

      const pythonPath =
        'C:\\Users\\morek\\AppData\\Local\\Programs\\Python\\Python310\\python.exe';

      const python = spawn(pythonPath, [
        path.join('ai', 'runner.py'),
        testType,
        videoPath,
      ]);

      let stdoutData = '';
      let stderrData = '';

      python.stdout.on('data', (d) => (stdoutData += d.toString()));
      python.stderr.on('data', (d) => (stderrData += d.toString()));

      python.on('error', (err) => {
        console.error('PYTHON SPAWN ERROR:', err);
      });

      python.on('close', async (code) => {
        console.log('Python exited with code:', code);
        if (stderrData) console.error('PYTHON STDERR:', stderrData);

        if (!stdoutData.trim()) {
          return res
            .status(500)
            .json({ error: 'No output from AI model', stderr: stderrData });
        }

        try {
          const lines = stdoutData
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.length > 0);
          const lastLine = lines[lines.length - 1];

          const aiOutput = JSON.parse(lastLine);
          console.log('AI JSON output:', aiOutput);

          // ===== Convert AI output -> benchmark metric =====
          let score = 0; // metric
          if (testType === 'sprint') {
            // time in seconds
            score = Number(aiOutput.time_taken_s || aiOutput.time || aiOutput.score || 0);
          } else if (testType === 'squats') {
            // reps
            score = Number(aiOutput.reps || aiOutput.score || 0);
          } else if (testType === 'jump') {
            // height in cm
            score = Number(aiOutput.jump_height_cm || aiOutput.score || 0);
          }

          // ===== Get user age & gender =====
          let category = 'Unknown';
          try {
            const user = await User.findById(userId);
            if (user && user.age && user.gender) {
              category = classifyPerformance(testType, user.age, user.gender, score);
            }
          } catch (e) {
            console.error('User lookup error:', e);
          }

          // ===== Save result =====
          const testResult = await TestResult.create({
            userId,
            testType,
            score,
            category,
            videoPath,
            aiData: aiOutput,
          });

          return res.status(200).json({ success: true, result: testResult });
        } catch (err) {
          console.error('Error parsing AI output:', err, 'RAW:', stdoutData);
          return res
            .status(500)
            .json({ error: 'Failed to parse AI output', details: err.message });
        }
      });
    } catch (err) {
      console.error('Analyze route error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ==== HISTORY ====
router.get('/history/:userId', async (req, res) => {
  try {
    const tests = await TestResult.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json(tests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// ==== SINGLE TEST DETAILS ====
router.get('/:testId', async (req, res) => {
  try {
    const test = await TestResult.findById(req.params.testId);
    if (!test) return res.status(404).json({ error: 'Test not found' });
    res.json(test);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch test detail' });
  }
});

module.exports = router;
