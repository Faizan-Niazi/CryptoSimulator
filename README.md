# 🚀 CryptoSimulator — Premium Virtual Trading Platform

CryptoSimulator is a high-performance, virtual cryptocurrency trading application built with **ASP.NET Core** and **Blazor**. It allows users to practice trading strategies in a risk-free environment using real-time market data.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![.NET](https://img.shields.io/badge/.NET-8.0-blueviolet.svg)
![Blazor](https://img.shields.io/badge/Blazor-InteractiveServer-orange.svg)

---

## ✨ Key Features

*   **📊 Unified Dashboard:** Track your total net worth, available cash, and portfolio performance at a glance.
*   **📈 Real-time Market Data:** Live price updates powered by the **CoinGecko API**.
*   **🕯️ Advanced Charting:** Integrated **TradingView** candlestick charts for technical analysis.
*   **⭐ Watchlist:** Star your favorite coins to keep a close eye on their price movements.
*   **💼 Portfolio Management:** Detailed breakdown of your holdings, including average buy price, current market value, and profit/loss (PnL) calculations.
*   **📜 Transaction History:** A complete log of all your Buy and Sell activities.
*   **🏆 Leaderboard:** Compete with other users and see who ranks highest in total net worth.
*   **⚙️ Account Management:** Premium profile settings, email management, and a secure password update system.
*   **🔄 Account Reset:** Start fresh anytime with a $10,000 virtual balance.

---

## 🛠️ Technology Stack

*   **Backend:** ASP.NET Core 8
*   **Frontend:** Blazor (Interactive Server Render Mode)
*   **Styling:** Bootstrap 5 + Custom Glassmorphism CSS
*   **Database:** SQLite with Entity Framework Core
*   **External APIs:** CoinGecko (Price Data), TradingView (Widget)
*   **Security:** ASP.NET Core Identity

---

## 🚀 Getting Started

### Prerequisites
*   [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
*   Visual Studio 2022 or VS Code

### Installation & Run

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Faizan-Niazi/CryptoSimulator.git
    cd CryptoSimulator
    ```

2.  **Restore dependencies:**
    ```bash
    dotnet restore
    ```

3.  **Update Database:**
    The project uses SQLite. Run the following command to apply migrations and create the local database:
    ```bash
    dotnet ef database update
    ```

4.  **Run the application:**
    ```bash
    dotnet run --project CryptoSimulator
    ```
    The app will be available at `http://localhost:5123` (or the port specified in `launchSettings.json`).

---

## 🛡️ Security & Reliability

*   **Database Transactions:** All trades are wrapped in atomic transactions to prevent data inconsistency.
*   **API Throttling:** Implemented global semaphores to handle CoinGecko rate limits gracefully.
*   **Caching:** Uses `IMemoryCache` to reduce external API dependency and improve loading speeds.

---

## 📄 License

This project is licensed under the MIT License.

---

**Developed with ❤️ by [Faizan Niazi](https://github.com/Faizan-Niazi)**
