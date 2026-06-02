const User = require('../models/User');
const Wallet = require('../models/Wallet');
const PortfolioItem = require('../models/PortfolioItem');
const { mockCryptos } = require('./marketController');

const maskUsername = (username) => {
  if (!username) return 'Anonymous';
  const nameStr = String(username);
  if (nameStr.length <= 2) {
    return nameStr[0] + '*';
  }
  if (nameStr.length <= 4) {
    return nameStr.substring(0, 2) + '**';
  }
  return nameStr.substring(0, 2) + '***' + nameStr.slice(-1);
};

// @desc    Get leaderboard rankings
// @route   GET /api/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({}, 'username email');
    const leaderboard = [];

    // Pre-create a map of coin prices for extremely fast lookups
    const priceMap = {};
    mockCryptos.forEach(coin => {
      priceMap[coin.id] = coin.current_price;
    });

    for (const user of users) {
      // Find wallet
      let wallet = await Wallet.findOne({ user: user._id });
      if (!wallet) {
        // Automatically create a wallet if missing
        wallet = await Wallet.create({ user: user._id, balance: 100000 });
      }

      // Find all portfolio items
      const holdings = await PortfolioItem.find({ user: user._id });

      // Calculate total assets value
      let totalAssetsValue = 0;
      holdings.forEach(item => {
        const currentPrice = priceMap[item.coinId] || item.averageBuyPrice;
        totalAssetsValue += item.amount * currentPrice;
      });

      const totalPortfolioValue = wallet.balance + totalAssetsValue;

      leaderboard.push({
        userId: user._id,
        username: maskUsername(user.username),
        cash: parseFloat(wallet.balance.toFixed(2)),
        assetsValue: parseFloat(totalAssetsValue.toFixed(2)),
        totalValue: parseFloat(totalPortfolioValue.toFixed(2)),
      });
    }

    // Sort leaderboard in descending order of total value
    leaderboard.sort((a, b) => b.totalValue - a.totalValue);

    // Add rank indices (1-based)
    const rankedLeaderboard = leaderboard.map((player, index) => ({
      rank: index + 1,
      ...player
    }));

    res.status(200).json({ success: true, data: rankedLeaderboard });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getLeaderboard
};
