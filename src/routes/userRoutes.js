// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

// Route to save user details
router.post('/register', UserController.createUser);

module.exports = router;

