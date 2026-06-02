const mongoose = require('mongoose');
const { FallbackWallet } = require('./dbWrapper');

const WalletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    required: true,
    default: 100000,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const MongooseWallet = mongoose.model('Wallet', WalletSchema);

module.exports = {
  findOne: function(...args) {
    if (global.useFallbackDb) return FallbackWallet.findOne(...args);
    return MongooseWallet.findOne(...args);
  },
  create: function(...args) {
    if (global.useFallbackDb) return FallbackWallet.create(...args);
    return MongooseWallet.create(...args);
  }
};
