// controllers/userController.js
const UserModel = require('../models/User');

exports.createUser = (req, res) => {
  const userData = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password // In a real app, you should hash this password
  };

  UserModel.createUser(userData)
    .then((result) => {
      res.status(201).json({
        success: true,
        id: result._id,
        message: "User registered successfully"
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        error: err.message
      });
    });
};
