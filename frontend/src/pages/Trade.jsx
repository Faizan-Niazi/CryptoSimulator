import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Coins, Wallet, History, AlertTriangle, ArrowUpRight, ArrowDownRight, TrendingUp, HelpCircle, CheckCircle2, ChevronRight, BarChart3, FileDown, Sparkles, Star, Target, Award, PieChart } from 'lucide-react';

const Trade = () => {
  const { user, API_URL, syncBalance } = useContext(AuthContext);
  const location = useLocation();
  const [portfolio, setPortfolio] = useState(null);
  const [coins, setCoins] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  // Set selected coin from query param if available
  const getInitialCoin = () => {
    const params = new URLSearchParams(location.search);
    return params.get('coin') || 'bitcoin';
  };
  
  const [selectedCoinId, setSelectedCoinId] = useState(getInitialCoin());
  const [tradeType, setTradeType] = useState('BUY');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [txFilter, setTxFilter] = useState('ALL'); // ALL, BUY, SELL
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    if (user) {
      fetchTradingData();
      
      // Load Watchlist
      const saved = localStorage.getItem('watchlist');
      if (saved) {
        try {
          setWatchlist(JSON.parse(saved));
        } catch (e) {
          setWatchlist([]);
        }
      }

      const interval = setInterval(fetchPricesOnly, 5000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const coinParam = params.get('coin');
    if (coinParam) {
      setSelectedCoinId(coinParam);
    }
  }, [location.search]);

  const fetchTradingData = async () => {
    try {
      const portRes = await axios.get(`${API_URL}/trade/portfolio`);
      if (portRes.data.success) {
        setPortfolio(portRes.data);
      }

      const priceRes = await axios.get(`${API_URL}/market/prices`);
      if (priceRes.data.success) {
        setCoins(priceRes.data.data);
      }

      const txRes = await axios.get(`${API_URL}/trade/transactions`);
      if (txRes.data.success) {
        setTransactions(txRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching trade dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPricesOnly = async () => {
    try {
      const priceRes = await axios.get(`${API_URL}/market/prices`);
      if (priceRes.data.success) {
        setCoins(priceRes.data.data);
      }
      
      const portRes = await axios.get(`${API_URL}/trade/portfolio`);
      if (portRes.data.success) {
        setPortfolio(portRes.data);
      }
    } catch (err) {
      console.error('Sync error', err);
    }
  };

  const selectedCoinData = coins.find(c => c.id === selectedCoinId) || coins[0] || { current_price: 0, symbol: '' };
  const currentPrice = selectedCoinData.current_price;
  const totalCostEstimate = amount ? parseFloat(amount) * currentPrice : 0;

  const handleTrade = async (e) => {
    e.preventDefault();
    setNotification(null);
    const tradeAmount = parseFloat(amount);

    if (isNaN(tradeAmount) || tradeAmount <= 0) {
      return setNotification({ success: false, msg: 'Please enter a valid amount greater than 0' });
    }

    setActionLoading(true);
    try {
      const endpoint = tradeType === 'BUY' ? 'buy' : 'sell';
      const res = await axios.post(`${API_URL}/trade/${endpoint}`, {
        coinId: selectedCoinId,
        amount: tradeAmount
      });

      if (res.data.success) {
        setNotification({ success: true, msg: res.data.message });
        setAmount('');
        await syncBalance();
        await fetchTradingData();
      }
    } catch (err) {
      setNotification({
        success: false,
        msg: err.response?.data?.error || 'Trade execution failed. Check holdings/balance.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetMax = () => {
    if (!portfolio || !currentPrice) return;
    
    if (tradeType === 'BUY') {
      const maxBuy = portfolio.balance / currentPrice;
      setAmount(parseFloat(maxBuy.toFixed(5)).toString());
    } else {
      const owned = portfolio.holdings.find(h => h.coinId === selectedCoinId);
      if (owned) {
        setAmount(owned.amount.toString());
      } else {
        setAmount('0');
      }
    }
  };

  // Client-side CSV Exporter Utility
  const exportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Date', 'Type', 'Asset', 'Amount', 'Price', 'Total USD'];
    const rows = transactions.map(tx => [
      new Date(tx.timestamp).toLocaleString(),
      tx.type,
      tx.symbol.toUpperCase(),
      tx.amount,
      `$${tx.price}`,
      `$${tx.totalUsd}`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${user.username}_trade_ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransactions = transactions.filter(tx => {
    if (txFilter === 'ALL') return true;
    return tx.type === txFilter;
  });

  const watchlistedCoins = coins.filter(c => watchlist.includes(c.id));

  // Gamified achievements checkers based on current metrics
  const getAchievements = () => {
    const list = [];
    const netWorth = portfolio?.totalPortfolioValue || 100000;
    const tradesCount = transactions.length;
    const holdingsCount = portfolio?.holdings?.length || 0;

    // Badge 1: Rookie
    list.push({
      title: 'Rookie Trader',
      desc: 'Placed your first mock order',
      unlocked: tradesCount > 0,
      icon: <Target className="h-6 w-6 text-indigo-500" />
    });
    // Badge 2: Profit Maker
    list.push({
      title: 'Growth Master',
      desc: 'Increased net worth past $110K',
      unlocked: netWorth > 110000,
      icon: <TrendingUp className="h-6 w-6 text-emerald-500" />
    });
    // Badge 3: Whale Status
    list.push({
      title: 'Crypto Whale',
      desc: 'Simulated portfolio value past $200K',
      unlocked: netWorth > 200000,
      icon: <Award className="h-6 w-6 text-amber-500" />
    });
    // Badge 4: Diversification Pro
    list.push({
      title: 'Diversification Pro',
      desc: 'Holding 3+ different assets',
      unlocked: holdingsCount >= 3,
      icon: <PieChart className="h-6 w-6 text-purple-500" />
    });

    return list;
  };

  // Custom SVG allocation donut chart calculations
  const renderDonutChart = () => {
    if (!portfolio) return null;
    
    const cash = portfolio.balance;
    const assets = portfolio.totalAssetsValue;
    const total = portfolio.totalPortfolioValue || 1;
    
    const cashPct = (cash / total) * 100;
    const assetsPct = (assets / total) * 100;

    // SVG parameters
    const size = 120;
    const strokeWidth = 14;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    
    // SVG stroke dash offset calculations
    const cashDashOffset = circumference - (cashPct / 100) * circumference;
    const assetsDashOffset = circumference - (assetsPct / 100) * circumference;

    return (
      <div className="flex items-center gap-6">
        <div className="relative w-[120px] h-[120px] shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background base path */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />
            {/* Cash segment (periwinkle color) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#423ba7"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={cashDashOffset}
              strokeLinecap="round"
            />
            {/* Assets segment (orange/peach color overlay) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#f97316"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={assetsDashOffset}
              strokeLinecap="round"
              transform={`rotate(${(cashPct / 100) * 360} ${size / 2} ${size / 2})`}
            />
          </svg>
          {/* Central label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cash</span>
            <span className="text-sm font-black text-slate-800">{Math.round(cashPct)}%</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#423ba7] rounded-full shrink-0" />
            <span className="text-slate-500 font-medium">USD Cash:</span>
            <span className="font-extrabold text-slate-700">{Math.round(cashPct)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#f97316] rounded-full shrink-0" />
            <span className="text-slate-500 font-medium">Crypto Assets:</span>
            <span className="font-extrabold text-slate-700">{Math.round(assetsPct)}%</span>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white rounded-[2rem] border border-slate-200/50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative z-10">
          <Coins className="h-14 w-14 text-indigo-500 mx-auto mb-6 animate-pulse" />
          <h2 className="text-3xl font-extrabold text-slate-800 mb-4">Start Paper Trading</h2>
          <p className="text-slate-500 mb-8 text-sm leading-relaxed">
            Create an account or login to access your simulated $100,000 portfolio, place mock orders, and test custom trading algorithms.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/register"
              className="bg-[#423ba7] hover:bg-[#342e8a] text-white font-bold py-3.5 rounded-full shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            >
              Register Free Account
            </Link>
            <Link
              to="/login"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-full transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {loading ? (
        <div className="text-center py-20 text-indigo-600 animate-pulse font-bold">
          Synchronizing trade portfolios...
        </div>
      ) : (
        <>
          {/* Top Metrics Cards Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-[2rem] border border-slate-200/50 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Net Portfolio Value</span>
                <h3 className="text-2xl font-black text-slate-800 mt-1">
                  ${portfolio?.totalPortfolioValue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="bg-[#423ba7]/10 p-3 rounded-2xl text-[#423ba7] border border-[#423ba7]/10">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>

            {/* Asset Allocation Donut Chart Card */}
            <div className="bg-white rounded-[2rem] border border-slate-200/50 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] lg:col-span-2 flex items-center justify-between overflow-hidden">
              <div className="flex flex-col text-left justify-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Portfolio Allocation</span>
                <p className="text-xs text-slate-400 mt-1 max-w-[180px] sm:max-w-xs leading-normal hidden sm:block">
                  Diversify your assets. Keep available USD balance balanced with digital cryptocurrency assets.
                </p>
              </div>
              {renderDonutChart()}
            </div>
          </div>

          {/* Quick watchlist select bar */}
          {watchlistedCoins.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/50 p-4 shadow-sm flex items-center gap-3 overflow-x-auto text-xs">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" /> Watchlist:
              </span>
              {watchlistedCoins.map(coin => (
                <button
                  key={coin.id}
                  onClick={() => setSelectedCoinId(coin.id)}
                  className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-2 transition-all ${
                    selectedCoinId === coin.id
                      ? 'bg-[#423ba7]/5 border-[#423ba7]/20 text-[#423ba7] shadow-sm'
                      : 'bg-slate-50/50 border-slate-100 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <img src={coin.image} alt={coin.name} className="h-4 w-4 object-contain" />
                  {coin.name} (${coin.current_price?.toLocaleString()})
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Trade Terminal Card */}
            <div className="bg-white rounded-[2rem] border border-slate-200/50 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-between h-fit">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3 mb-6">Trading Terminal</h3>

                {notification && (
                  <div className={`p-4 rounded-2xl text-xs border mb-6 flex items-start gap-2.5 ${
                    notification.success
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                  }`}>
                    {notification.success ? <CheckCircle2 className="h-4.5 w-4.5 shrink-0" /> : <AlertTriangle className="h-4.5 w-4.5 shrink-0" />}
                    <span>{notification.msg}</span>
                  </div>
                )}

                {/* Tabs BUY/SELL */}
                <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/40 mb-6 text-xs font-bold">
                  <button
                    onClick={() => { setTradeType('BUY'); setNotification(null); }}
                    className={`flex-1 py-2.5 rounded-lg transition-all ${
                      tradeType === 'BUY' ? 'bg-[#423ba7] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Buy Asset
                  </button>
                  <button
                    onClick={() => { setTradeType('SELL'); setNotification(null); }}
                    className={`flex-1 py-2.5 rounded-lg transition-all ${
                      tradeType === 'SELL' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Sell Asset
                  </button>
                </div>

                <form onSubmit={handleTrade} className="space-y-5">
                  {/* Select Coin */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Asset to Trade
                    </label>
                    <select
                      value={selectedCoinId}
                      onChange={(e) => { setSelectedCoinId(e.target.value); setNotification(null); }}
                      className="w-full bg-slate-50/50 border border-slate-200/60 rounded-xl py-3 px-4 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                    >
                      {coins.map(coin => (
                        <option key={coin.id} value={coin.id}>
                          {coin.name} ({coin.symbol.toUpperCase()}) — ${coin.current_price?.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Input Amount */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Amount ({selectedCoinData.symbol?.toUpperCase()})
                      </label>
                      <button
                        type="button"
                        onClick={handleSetMax}
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold"
                      >
                        Set Max
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-slate-50/50 border border-slate-200/60 rounded-xl py-3 px-4 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 pr-16"
                      />
                      <span className="absolute right-4 top-3 text-[10px] text-slate-400 font-bold uppercase">
                        {selectedCoinData.symbol}
                      </span>
                    </div>
                  </div>

                  {/* Cost Summary Box */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between text-slate-400 font-medium">
                      <span>Rate:</span>
                      <span className="font-bold text-slate-700">
                        1 {selectedCoinData.symbol?.toUpperCase()} = ${currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400 font-medium">
                      <span>Total Value:</span>
                      <span className="font-extrabold text-slate-800 text-sm">
                        ${totalCostEstimate?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className={`w-full py-3.5 rounded-xl font-bold transition-all duration-300 hover:scale-102 active:scale-98 shadow-lg text-white text-sm ${
                      tradeType === 'BUY'
                        ? 'bg-[#423ba7] hover:bg-[#342e8a] shadow-indigo-500/10'
                        : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/10'
                    }`}
                  >
                    Execute Order
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Holdings & Transactions Cards */}
            <div className="lg:col-span-2 space-y-8">
              {/* Active Holdings Card */}
              <div className="bg-white rounded-[2rem] border border-slate-200/50 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                <h3 className="text-base font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-2">Active Holdings</h3>
                
                {portfolio?.holdings?.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm font-semibold">
                    No active holdings found. Complete an order to start.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold">
                          <th className="py-3 px-2">Asset</th>
                          <th className="py-3 px-2">Holdings</th>
                          <th className="py-3 px-2">Cost Basis</th>
                          <th className="py-3 px-2">Current Value</th>
                          <th className="py-3 px-2 text-right">Profit / Loss</th>
                        </tr>
                      </thead>
                      <tbody>
                        {portfolio?.holdings?.map(item => (
                          <tr key={item._id} className="border-b border-slate-100/50 hover:bg-slate-50/50">
                            <td className="py-4 px-2 flex items-center gap-2.5">
                              {item.image && <img src={item.image} alt={item.name} className="h-6 w-6 object-contain" />}
                              <div>
                                <span className="font-extrabold text-slate-700 block">{item.name}</span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{item.symbol}</span>
                              </div>
                            </td>
                            <td className="py-4 px-2 font-bold text-slate-700">
                              {item.amount?.toLocaleString(undefined, { maximumFractionDigits: 5 })}
                            </td>
                            <td className="py-4 px-2 text-slate-500 font-semibold">
                              ${item.averageBuyPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-4 px-2 font-extrabold text-slate-700">
                              ${item.currentValue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className={`py-4 px-2 text-right font-black ${
                              item.profitLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'
                            }`}>
                              <span className="flex items-center justify-end gap-0.5 text-xs">
                                {item.profitLoss >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                                {item.profitLoss >= 0 ? '+' : ''}${item.profitLoss?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                              <span className="text-[9px] block opacity-80">{item.profitLossPercentage >= 0 ? '+' : ''}{item.profitLossPercentage?.toFixed(2)}%</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Achievements Badges Card */}
              <div className="bg-white rounded-[2rem] border border-slate-200/50 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-base font-extrabold text-slate-800">Simulator Milestones</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {getAchievements().map((badge, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
                        badge.unlocked
                          ? 'bg-[#423ba7]/5 border-[#423ba7]/20 shadow-sm'
                          : 'bg-slate-50/20 border-slate-100 opacity-55'
                      }`}
                    >
                      <div className="mb-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100/50 shadow-sm shrink-0">
                        {badge.icon}
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-[11px] leading-tight">{badge.title}</h4>
                      <span className="text-[9px] text-slate-400 leading-normal mt-1 block">{badge.desc}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full mt-2 block ${
                        badge.unlocked ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-200/50 text-slate-400'
                      }`}>
                        {badge.unlocked ? 'UNLOCKED' : 'LOCKED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transactions Logs Card with Filter & CSV Export */}
              <div className="bg-white rounded-[2rem] border border-slate-200/50 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-indigo-500" />
                    <h3 className="text-base font-extrabold text-slate-800">Transaction Logs</h3>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Filter selector */}
                    <select
                      value={txFilter}
                      onChange={(e) => setTxFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-1.5 text-[10px] font-bold text-slate-600 focus:outline-none"
                    >
                      <option value="ALL">All orders</option>
                      <option value="BUY">Buys only</option>
                      <option value="SELL">Sells only</option>
                    </select>

                    {/* CSV Export Button */}
                    <button
                      onClick={exportCSV}
                      disabled={transactions.length === 0}
                      className="bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      Export CSV
                    </button>
                  </div>
                </div>

                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm font-semibold">
                    No transactions recorded.
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
                    {filteredTransactions.map(tx => (
                      <div key={tx._id} className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs transition-all hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            tx.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                          }`}>
                            {tx.type}
                          </span>
                          <div>
                            <span className="font-extrabold text-slate-700 block">{tx.amount} {tx.symbol}</span>
                            <span className="text-[10px] text-slate-400">{new Date(tx.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-[#423ba7] block">${tx.totalUsd?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          <span className="text-[10px] text-slate-400">@{tx.price?.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Trade;
