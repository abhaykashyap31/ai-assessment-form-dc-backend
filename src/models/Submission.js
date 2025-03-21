// models/Submission.js
const mongoose = require('mongoose');

// Schema for individual answer
const answerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  }
});

// Main submission schema
const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [answerSchema],
  totalScore: {
    type: Number,
    required: true
  },
  maxPossibleScore: {
    type: Number,
    default: 125 // Assuming 25 questions with max 5 points each
  },
  percentageScore: {
    type: Number,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

const Submission = mongoose.model('Submission', submissionSchema);

// Create a new submission
exports.createSubmission = (submissionData) => {
  const submission = new Submission(submissionData);
  return submission.save();
};

// Find submissions by user ID
exports.findByUserId = (userId) => {
  return Submission.find({ userId });
};

// Find a specific submission by ID
exports.findById = (id) => {
  return Submission.findById(id);
};

// Get all submissions (with pagination)
exports.getAll = (limit = 10, skip = 0) => {
  return Submission.find()
    .sort({ submittedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'name email');
};

module.exports = Submission;
