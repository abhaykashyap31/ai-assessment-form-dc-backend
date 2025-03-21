// controllers/quizController.js
const SubmissionModel = require('../models/Submission');
const QuizModel = require('../models/Quiz');

exports.submitQuiz = async (req, res) => {
  try {
    const { userId, quizId, answers } = req.body;
    
    // Get the quiz questions with correct answers from database
    const quiz = await QuizModel.findById(quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }
    
    // Calculate score
    let score = 0;
    const questions = quiz.questions;
    const results = [];
    
    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        score += 1;
      }
      
      results.push({
        questionId: question._id,
        userAnswer,
        isCorrect
      });
    });
    
    // Calculate percentage
    const totalQuestions = questions.length;
    const percentage = (score / totalQuestions) * 100;
    
    // Save submission to database
    const submission = {
      userId,
      quizId,
      answers,
      score,
      totalQuestions,
      percentage,
      results,
      submittedAt: Date.now()
    };
    
    const savedSubmission = await SubmissionModel.createSubmission(submission);
    
    res.status(201).json({
      success: true,
      id: savedSubmission._id,
      score,
      totalQuestions,
      percentage,
      message: "Quiz submitted successfully"
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
