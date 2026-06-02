const Wallet = require('../models/Wallet');
const PortfolioItem = require('../models/PortfolioItem');
const Transaction = require('../models/Transaction');
const { mockCryptos } = require('./marketController');

// Helper to get current price of a coin
const getCurrentCoinPrice = (coinId) => {
  const coin = mockCryptos.find(c => c.id === coinId);
  return coin ? coin : null;
};

// @desc    Get user's portfolio and cash balance
// @route   GET /api/trade/portfolio
// @access  Private
const getPortfolio = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user._id, balance: 100000 });
    }

    const holdings = await PortfolioItem.find({ user: req.user._id });

    // Enrich holdings with current price and profit/loss calculations
    const enrichedHoldings = holdings.map(item => {
      const coinData = getCurrentCoinPrice(item.coinId);
      const currentPrice = coinData ? coinData.current_price : item.averageBuyPrice;
      const currentValue = item.amount * currentPrice;
      const costBasis = item.amount * item.averageBuyPrice;
      const profitLoss = currentValue - costBasis;
      const profitLossPercentage = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;

      return {
        _id: item._id,
        coinId: item.coinId,
        symbol: item.symbol,
        name: item.name,
        amount: item.amount,
        averageBuyPrice: item.averageBuyPrice,
        currentPrice,
        currentValue: parseFloat(currentValue.toFixed(2)),
        profitLoss: parseFloat(profitLoss.toFixed(2)),
        profitLossPercentage: parseFloat(profitLossPercentage.toFixed(2)),
        image: coinData ? coinData.image : ''
      };
    });

    // Calculate total portfolio value (cash + assets value)
    const totalAssetsValue = enrichedHoldings.reduce((sum, item) => sum + item.currentValue, 0);
    const totalPortfolioValue = wallet.balance + totalAssetsValue;

    res.status(200).json({
      success: true,
      balance: wallet.balance,
      totalAssetsValue: parseFloat(totalAssetsValue.toFixed(2)),
      totalPortfolioValue: parseFloat(totalPortfolioValue.toFixed(2)),
      holdings: enrichedHoldings,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Buy cryptocurrency
// @route   POST /api/trade/buy
// @access  Private
const buyCrypto = async (req, res) => {
  try {
    const { coinId, amount } = req.body;
    const buyAmount = parseFloat(amount);

    if (!coinId || isNaN(buyAmount) || buyAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid coin ID or buy amount' });
    }

    const coinData = getCurrentCoinPrice(coinId);
    if (!coinData) {
      return res.status(404).json({ success: false, error: `Cryptocurrency ${coinId} not found` });
    }

    const currentPrice = coinData.current_price;
    const totalCost = buyAmount * currentPrice;

    // Get user wallet
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user._id, balance: 100000 });
    }

    if (wallet.balance < totalCost) {
      return res.status(400).json({ success: false, error: 'Insufficient funds. Please reduce order size.' });
    }

    // Deduct cash from wallet
    wallet.balance -= totalCost;
    await wallet.save();

    // Update holdings
    let holding = await PortfolioItem.findOne({ user: req.user._id, coinId });
    if (holding) {
      const oldAmount = holding.amount;
      const oldAvgPrice = holding.averageBuyPrice;
      const newAmount = oldAmount + buyAmount;
      
      // Calculate new weighted average buy price
      holding.averageBuyPrice = ((oldAmount * oldAvgPrice) + (buyAmount * currentPrice)) / newAmount;
      holding.amount = newAmount;
      await holding.save();
    } else {
      holding = await PortfolioItem.create({
        user: req.user._id,
        coinId,
        symbol: coinData.symbol,
        name: coinData.name,
        amount: buyAmount,
        averageBuyPrice: currentPrice,
      });
    }

    // Record transaction
    const transaction = await Transaction.create({
      user: req.user._id,
      type: 'BUY',
      coinId,
      symbol: coinData.symbol,
      name: coinData.name,
      amount: buyAmount,
      price: currentPrice,
      totalUsd: totalCost,
    });

    res.status(200).json({
      success: true,
      message: `Successfully bought ${buyAmount} ${coinData.symbol.toUpperCase()}`,
      transaction,
      balance: wallet.balance,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Sell cryptocurrency
// @route   POST /api/trade/sell
// @access  Private
const sellCrypto = async (req, res) => {
  try {
    const { coinId, amount } = req.body;
    const sellAmount = parseFloat(amount);

    if (!coinId || isNaN(sellAmount) || sellAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid coin ID or sell amount' });
    }

    const coinData = getCurrentCoinPrice(coinId);
    if (!coinData) {
      return res.status(404).json({ success: false, error: `Cryptocurrency ${coinId} not found` });
    }

    const currentPrice = coinData.current_price;
    const totalCredit = sellAmount * currentPrice;

    // Check if user actually owns this holding
    const holding = await PortfolioItem.findOne({ user: req.user._id, coinId });
    if (!holding || holding.amount < sellAmount) {
      return res.status(400).json({ success: false, error: 'Insufficient crypto holdings to execute sale.' });
    }

    // Get user wallet
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user._id, balance: 100000 });
    }

    // Add cash to wallet
    wallet.balance += totalCredit;
    await wallet.save();

    // Update or delete holding
    if (holding.amount === sellAmount) {
      await PortfolioItem.deleteOne({ _id: holding._id });
    } else {
      holding.amount -= sellAmount;
      await holding.save();
    }

    // Record transaction
    const transaction = await Transaction.create({
      user: req.user._id,
      type: 'SELL',
      coinId,
      symbol: coinData.symbol,
      name: coinData.name,
      amount: sellAmount,
      price: currentPrice,
      totalUsd: totalCredit,
    });

    res.status(200).json({
      success: true,
      message: `Successfully sold ${sellAmount} ${coinData.symbol.toUpperCase()}`,
      transaction,
      balance: wallet.balance,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get user transaction history
// @route   GET /api/trade/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ timestamp: -1 });
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getPortfolio,
  buyCrypto,
  sellCrypto,
  getTransactions,
};
