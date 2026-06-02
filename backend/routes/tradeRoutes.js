const express = require('express');
const router = express.Router();
const {
  getPortfolio,
  buyCrypto,
  sellCrypto,
  getTransactions,
} = require('../controllers/tradeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // protect all trade routes

router.get('/portfolio', getPortfolio);
router.post('/buy', buyCrypto);
router.post('/sell', sellCrypto);
router.get('/transactions', getTransactions);

module.exports = router;
