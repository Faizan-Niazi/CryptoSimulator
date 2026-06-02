const express = require('express');
const router = express.Router();
const { getCryptos, getCryptoHistory, getNews } = require('../controllers/marketController');

router.get('/prices', getCryptos);
router.get('/history/:coinId', getCryptoHistory);
router.get('/news', getNews);

module.exports = router;
