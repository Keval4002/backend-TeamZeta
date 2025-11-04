const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware')
const {getTransactions,createTransactions, deleteTransaction} = require('../controllers/transaction');

router.route('/').get(authMiddleware,getTransactions).post(authMiddleware,createTransactions);
router.route('/:id').delete(authMiddleware,deleteTransaction);

module.exports= router;