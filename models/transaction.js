const mongoose = require('mongoose')
const transactionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense'], // Good for data consistency
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  // This is the link back to your User collection
  user: {
    type: mongoose.Schema.Types.ObjectId, // This is the User's _id from MongoDB
    ref: 'User', // Tells Mongoose this links to the 'User' model
    required: true,
    index: true, // Speeds up queries for a user's transactions
  },
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;