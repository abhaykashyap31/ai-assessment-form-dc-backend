// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

exports.createUser = (userData) => {
  const user = new User(userData);
  return user.save();
};

exports.findById = (id) => {
  return User.findById(id).then((result) => {
    if (!result) return null;
    result = result.toJSON();
    delete result.password; // Don't return password
    delete result.__v;
    return result;
  });
};

module.exports = User;
