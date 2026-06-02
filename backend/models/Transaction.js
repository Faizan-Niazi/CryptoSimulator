const mongoose = require('mongoose');
const { FallbackTransaction } = require('./dbWrapper');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['BUY', 'SELL'],
  },
  coinId: {
    type: String,
    required: true,
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  totalUsd: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const MongooseTransaction = mongoose.model('Transaction', TransactionSchema);

module.exports = {
  create: function(...args) {
    if (global.useFallbackDb) return FallbackTransaction.create(...args);
    return MongooseTransaction.create(...args);
  },
  find: function(...args) {
    if (global.useFallbackDb) return FallbackTransaction.find(...args);
    return MongooseTransaction.find(...args);
  }
};
