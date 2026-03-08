// models/TestResult.js
const mongoose = require('mongoose');

const TestResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // "sprint", "squats", "jump"
  testType: { type: String, required: true },

  // For sprint: time in seconds
  // For squats: reps in 1 minute
  // For jump: height in cm
  score: { type: Number, default: 0 },

  // Elite / Good / Average / Below Average / Unknown
  category: { type: String, default: 'Unknown' },

  videoPath: { type: String },
  aiData: { type: mongoose.Schema.Types.Mixed },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TestResult', TestResultSchema);
