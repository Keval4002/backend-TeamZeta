const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
  },
  phone_number: {
    type: String,   // <-- CHANGED from Number to String
    unique: true,
    sparse: true    // <-- ADDED sparse index
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);