const mongoose = require('mongoose');
const { FallbackPortfolio } = require('./dbWrapper');

const PortfolioItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
    default: 0,
  },
  averageBuyPrice: {
    type: Number,
    required: true,
    default: 0,
  },
});

PortfolioItemSchema.index({ user: 1, coinId: 1 }, { unique: true });

const MongoosePortfolioItem = mongoose.model('PortfolioItem', PortfolioItemSchema);

module.exports = {
  find: function(...args) {
    if (global.useFallbackDb) return FallbackPortfolio.find(...args);
    return MongoosePortfolioItem.find(...args);
  },
  findOne: function(...args) {
    if (global.useFallbackDb) return FallbackPortfolio.findOne(...args);
    return MongoosePortfolioItem.findOne(...args);
  },
  create: function(...args) {
    if (global.useFallbackDb) return FallbackPortfolio.create(...args);
    return MongoosePortfolioItem.create(...args);
  },
  deleteOne: function(...args) {
    if (global.useFallbackDb) return FallbackPortfolio.deleteOne(...args);
    return MongoosePortfolioItem.deleteOne(...args);
  }
};
