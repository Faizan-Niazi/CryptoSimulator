const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Lightweight health-check endpoint (used by Docker HEALTHCHECK & Render)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Define API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/market', require('./routes/marketRoutes'));
app.use('/api/trade', require('./routes/tradeRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));

// Serve Frontend Static Assets in Production
if (process.env.NODE_ENV === 'production' || process.env.SERVE_FRONTEND === 'true') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  
  app.use(express.static(frontendPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendPath, 'index.html'));
  });
} else {
  // Simple welcome route for local backend development
  app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the CryptoSimulator API!' });
  });
}

// Global error handler middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
