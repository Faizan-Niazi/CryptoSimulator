# 🪙 CryptoSimulator

A professional, high-fidelity **MERN stack virtual cryptocurrency paper-trading platform** designed to simulate real-time market trading with virtual currency. Starting with a sandbox balance of **$100,000 USD**, traders can search, analyze, and trade **399 real-world cryptocurrencies** in a premium, modern dashboard.

Built using **MongoDB, Express, React, Node.js (MERN)**, and styled with **Tailwind CSS**, this project also features a **double-layer database fallback** that runs seamlessly out-of-the-box using local JSON storage if MongoDB is unavailable.

---

## 🚀 Live Demo
Access the live application here: **[https://cryptosimulator.onrender.com](https://cryptosimulator.onrender.com)**

---

## ✨ Features & Functions

### 📊 1. Premium Visual Dashboard (UI/UX Redesign)
* **Left Navigation Sidebar**: Features a professional brand logo (`Coins` icon), clean active page indicator bars, and context-aware navigation.
* **Top Header & Search Sync**: Displays user credentials, real-time virtual cash balance, and a pill-shaped global search bar. Typing a coin name or symbol instantly synchronizes with URL parameters and filters the Market board.
* **Modern Grids & Panels**: Card layouts with soft periwinkle-gray drop shadows, clean borders, and premium typography pairing:
  * **Space Grotesk**: Modern display font for headings, hero sections, and ranking numbers.
  * **Inter**: Sleek sans-serif font for readouts, tables, and price logs.

### 📈 2. Interactive Dual-Line SVG Charting
* Custom-engineered SVG charts plot the selected cryptocurrency's historical price fluctuations over time.
* Renders a **dual-line chart**:
  * **Main Asset (Periwinkle)**: Plots the current coin's price path with a soft gradient area fill.
  * **Market Variance Index (Peach/Orange)**: Displays market index overlay fluctuations for trading context.
* Features interactive pulsing cursor nodes and clean hover states.

### 🛡️ 3. Security & Route Guards
* **Public Pages**: Guest users can view the **Home** (marketing landing), **Market** board, and **Leaderboard** to explore ranks and coin prices.
* **Protected Routes (`ProtectedRoute`)**: Access to the interactive **Trade Console** (`/trade`) is locked behind JWT authentication. Guest users attempting to trade are automatically redirected to Login.
* **Watchlist Security**: Adding coins to a personalized Watchlist is gated; non-logged-in users will be prompted to login when trying to favorite a coin.
* **Competitive Privacy**: Actual usernames on the backend leaderboard are masked for privacy. Logged-in users see their own ranking unmasked with a visual `(You)` indicator.
* **Guest Demo Mode**: Guest users visiting the leaderboard see simulated virtual rank users, keeping server load clean.

### 🗄️ 4. 399 Real Crypto Asset Database
* Features live price feeds crawled dynamically across 399 real cryptocurrencies (ranks 1–400) from the CoinGecko API.
* **Micro-Fluctuation Engine**: If CoinGecko rate-limits or goes offline, a custom backend engine takes over to simulate realistic micro-fluctuations, ensuring price charts never freeze.

### 💾 5. Double-Layer Database Resilience
* **Primary Database**: MongoDB / Mongoose for user profile hashing (`bcryptjs`), portfolio audits, and order logs.
* **Zero-Setup Local Fallback**: If MongoDB connection fails (e.g. during local sandbox tests), the backend automatically redirects all database read/write actions to a **local JSON database engine** (`backend/data/`). Trading, login, registration, and leaderboards work perfectly without any database setup!

---

## 🛠️ Tech Stack

* **Frontend**: React (SPA), Vite, Tailwind CSS, Lucide React, Axios.
* **Backend**: Node.js, Express.js (Express 5.x routing engine).
* **Database**: MongoDB (Mongoose) / Local JSON Datastore fallback.
* **Security**: JSON Web Tokens (JWT), BcryptJS.
* **Containerization**: Multi-stage production `Dockerfile`.

---

## ⚙️ Directory Structure

```text
CryptoSimulator/
├── backend/                  # Express REST API (MVC Pattern)
│   ├── config/               # Database and environment configurations
│   ├── controllers/          # Request handler functions (auth, trade, market, etc.)
│   ├── data/                 # JSON persistent datastore fallback files
│   ├── middleware/           # JWT verification & auth shields
│   ├── models/               # Mongoose DB schemas (User, Wallet, Transaction, etc.)
│   ├── routes/               # API endpoint route declarations
│   └── server.js             # Express application entrypoint
├── frontend/                 # React Vite Frontend SPA
│   ├── src/
│   │   ├── components/       # Reusable layout UI (Sidebar, Header, Chart)
│   │   ├── pages/            # Core views (Home, Market, Trade, Leaderboard, Auth)
│   │   ├── App.jsx           # Routing paths & Protected/Public guards
│   │   └── index.css         # Styling system & Tailwind configs
└── Dockerfile                # Production multi-stage Docker build
```

---

## 🚀 How to Run Locally

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)

### Step-by-Step Installation

1. **Clone the repository** and navigate to the project directory:
   ```bash
   cd CryptoSimulator
   ```

2. **Install all dependencies** for the root, backend, and frontend at once:
   ```bash
   npm run install-all
   ```

3. **Start local development servers**:
   ```bash
   npm run dev
   ```
   * This command concurrently boots the **Express API** on port `5000` and the **Vite React Dev Server** on port `5173` (accessible at `http://localhost:5173`).

---

## 🐳 Docker Production Deployment

To run the application locally or deploy to cloud hosts (like Render) using Docker:

1. **Build the Docker Image**:
   ```bash
   docker build -t cryptosimulator .
   ```

2. **Run the Docker Container**:
   ```bash
   docker run -p 5000:5000 --env PORT=5000 --env NODE_ENV=production --env SERVE_FRONTEND=true cryptosimulator
   ```
   * Open `http://localhost:5000` to view the production-built monorepo.
