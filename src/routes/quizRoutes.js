// routes/quizRoutes.js
const express = require('express');
const router = express.Router();
const QuizController = require('../controllers/quizController');

// Route to submit quiz answers and calculate score
router.post('/submit', QuizController.submitQuiz);

module.exports = router;
