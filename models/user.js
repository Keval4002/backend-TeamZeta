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
    type: String,
    default: undefined,  // Don't set to null, use undefined
    sparse: true,        // Sparse index allows multiple undefined/null values
    validate: {
      validator: function(v) {
        // Only validate if phone_number is provided
        return !v || (typeof v === 'string' && v.length > 0);
      },
      message: 'Phone number must be a non-empty string if provided'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);