import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Coins, TrendingUp, Award, ArrowRight, ShieldCheck, PieChart, Activity, DollarSign, Calendar, Star, FileSpreadsheet, Newspaper, Bell, Sparkles, Users } from 'lucide-react';

const Home = () => {
  const { user, API_URL } = useContext(AuthContext);
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await axios.get(`${API_URL}/market/news`);
      if (res.data.success) {
        setNews(res.data.data);
      }
    } catch (err) {
      console.error('Error loading news feed', err);
    } finally {
      setNewsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-10">
      {/* Hero Banner Section */}
      <section className="bg-gradient-to-r from-[#423ba7] via-[#5c54c7] to-[#7f76eb] text-white p-10 md:p-12 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="absolute right-0 top-0 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-80 h-80 rounded-full bg-indigo-400/20 blur-2xl" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/30 px-4 py-2 rounded-full text-xs font-black text-amber-300 mb-6 shadow-sm">
            <Coins className="h-4 w-4" />
            100% Free Simulated Paper Trading
          </div>
          <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-4">
            Master Crypto Trading <br />
            <span className="text-amber-300">With Zero Risk</span>
          </h2>
          <p className="text-indigo-100 text-sm md:text-base leading-relaxed mb-8 max-w-xl">
            Register instantly and receive a virtual **$100,000 USD** balance. Practice strategic asset allocation, monitor custom watchlists, track live price charts, and unlock achievements.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {user ? (
              <Link
                to="/trade"
                className="bg-white hover:bg-slate-100 text-[#423ba7] font-extrabold px-8 py-4 rounded-full text-sm shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-102"
              >
                Go to Trading Terminal
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold px-8 py-4 rounded-full text-sm shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-102"
                >
                  Get Your Free $100K
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/market"
                  className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold px-8 py-4 rounded-full text-sm flex items-center justify-center transition-all"
                >
                  Explore Markets
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Feature Highlights Grid Overlay inside Banner */}
        <div className="relative z-10 bg-white/10 border border-white/15 backdrop-blur-md p-6 rounded-3xl w-full lg:w-96 shadow-2xl shrink-0">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <span className="text-xs text-indigo-200 font-black uppercase tracking-wider">Simulation Sandbox</span>
            <span className="text-[10px] bg-emerald-400/25 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full">ACTIVE</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-indigo-200 font-semibold">Virtual Starting Balance</span>
              <span className="text-amber-300 font-black text-sm">$100,000.00</span>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-indigo-200 font-semibold">Mock Trading Commission</span>
              <span className="text-emerald-300 font-bold">0% (Always Free)</span>
            </div>
            
            {/* Visual Indicators */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex justify-between text-[10px] text-indigo-200 font-bold">
                <span>Learning Curve Progression</span>
                <span>85%</span>
              </div>
              <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Productive Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200/50 p-5 shadow-sm flex items-center gap-4">
          <div className="bg-[#423ba7]/10 p-3 rounded-2xl text-[#423ba7] shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Traders</span>
            <span className="text-xl font-black text-slate-800 block mt-0.5">14,832</span>
            <span className="text-[9px] text-emerald-500 font-semibold block mt-0.5">+184 today</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/50 p-5 shadow-sm flex items-center gap-4">
          <div className="bg-orange-500/10 p-3 rounded-2xl text-orange-500 shrink-0">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Simulated Orders</span>
            <span className="text-xl font-black text-slate-800 block mt-0.5">384,192</span>
            <span className="text-[9px] text-indigo-500 font-semibold block mt-0.5">Real-time matching</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/50 p-5 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-600 shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Sandbox Volume</span>
            <span className="text-xl font-black text-slate-800 block mt-0.5">$1.24B</span>
            <span className="text-[9px] text-emerald-500 font-semibold block mt-0.5">100% risk-free</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/50 p-5 shadow-sm flex items-center gap-4">
          <div className="bg-amber-500/10 p-3 rounded-2xl text-amber-500 shrink-0">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Indexed Assets</span>
            <span className="text-xl font-black text-slate-800 block mt-0.5">399 Coins</span>
            <span className="text-[9px] text-amber-600 font-semibold block mt-0.5">CoinGecko Sync</span>
          </div>
        </div>
      </section>

      {/* Main Perks Section */}
      <section className="bg-white rounded-[2rem] border border-slate-200/50 p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h3 className="text-2xl font-black text-slate-800">Why Trade With Us?</h3>
          <p className="text-slate-400 text-sm mt-2">
            The platform is designed to offer maximum training utility, simulating real brokerage features at zero cost.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
            <div className="bg-[#423ba7]/10 p-3 rounded-xl text-[#423ba7] w-fit mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm mb-1.5">No Deposits Ever</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              We never collect credit cards or cash deposits. Practice paper trading without any financial exposure.
            </p>
          </div>

          <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
            <div className="bg-orange-500/10 p-3 rounded-xl text-orange-500 w-fit mb-4">
              <Activity className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm mb-1.5">Live Data Fallbacks</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Always active. Our pricing engine uses real-time feeds with dynamic simulation switches if APIs hit limits.
            </p>
          </div>

          <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
            <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-600 w-fit mb-4">
              <PieChart className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm mb-1.5">In-Depth Analytics</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Evaluate performance with weighted average buy metrics, transaction tracking, and cash-split calculations.
            </p>
          </div>

          <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
            <div className="bg-amber-500/10 p-3 rounded-xl text-amber-600 w-fit mb-4">
              <Award className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm mb-1.5">Global Rankings</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Ascend rankings on the global leaderboard. Compare net portfolio metrics with active paper traders.
            </p>
          </div>
        </div>
      </section>

      {/* Simulation Ledgers (Activity & Reviews) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live Simulation Activity Ledger */}
        <div className="bg-white rounded-[2rem] border border-slate-200/50 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="bg-[#423ba7]/10 p-2.5 rounded-xl text-[#423ba7]">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base leading-tight font-display">Global Activity Ledger</h3>
                  <p className="text-slate-400 text-[10px] mt-0.5">Real-time simulation orders executed on the network</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-600 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                Live Feed
              </span>
            </div>

            <div className="space-y-3.5">
              {[
                { trader: 'AlphaTrader', action: 'BUY', amount: '1.42 BTC', price: '$95,495.00', time: '12s ago', rank: 1 },
                { trader: 'HODL_Queen', action: 'SELL', amount: '15.8 ETH', price: '$54,991.90', time: '45s ago', rank: 6 },
                { trader: 'SatoshiSeeker', action: 'BUY', amount: '450.0 SOL', price: '$74,587.50', time: '2m ago', rank: 2 },
                { trader: 'DiamondHands', action: 'BUY', amount: '2,500 MATIC', price: '$1,825.00', time: '5m ago', rank: 5 },
                { trader: 'WhaleWatcher', action: 'SELL', amount: '18.4K DOGE', price: '$2,612.80', time: '8m ago', rank: 3 }
              ].map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-slate-50/50 hover:bg-slate-50 border border-slate-100/50 p-3 rounded-2xl transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shadow-sm ${
                      tx.rank === 1 ? 'bg-amber-400 text-slate-800' : tx.rank === 2 ? 'bg-slate-300 text-slate-800' : tx.rank === 3 ? 'bg-amber-700 text-white' : 'bg-indigo-50 text-indigo-500'
                    }`}>
                      {tx.trader.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-700 block">{tx.trader}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                        Rank #{tx.rank}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={`inline-block font-black px-2 py-0.5 rounded text-[9px] uppercase tracking-wider mb-0.5 ${
                        tx.action === 'BUY' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                      }`}>
                        {tx.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold block">{tx.amount}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-700 block">{tx.price}</span>
                      <span className="text-[9px] text-slate-400 font-medium block">{tx.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trader Review Ledger */}
        <div className="bg-white rounded-[2rem] border border-slate-200/50 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-600">
                  <Star className="h-5 w-5 fill-amber-500/10" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base leading-tight font-display">Trader Review Ledger</h3>
                  <p className="text-slate-400 text-[10px] mt-0.5">Ratings and feedback from verified sandbox users</p>
                </div>
              </div>
              <span className="text-[9px] bg-indigo-50 text-indigo-500 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                9.8/10 Score
              </span>
            </div>

            <div className="space-y-3.5">
              {[
                { author: 'Alex M.', role: 'AlphaTrader', rank: 1, stars: 5, review: 'The SVG charting and allocation tools are spot-on. Having a $100K buffer let me backtest my momentum strategies without losing real cash!' },
                { author: 'Sarah T.', role: 'HODL_Queen', rank: 6, stars: 5, review: "I love the gamified milestones! Unlocking 'Whale Status' keeps it fun, and the CSV ledger exporter makes reviewing my trade history super easy." },
                { author: 'Liam K.', role: 'NoobTrader', rank: 42, stars: 5, review: 'As a beginner, this is perfect. It behaves exactly like a real terminal but is 100% free. The sentiment news ticker helped me make my first profitable mock trade.' }
              ].map((rev, idx) => (
                <div key={idx} className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100/50 p-4 rounded-2xl transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-700 text-xs">{rev.author}</span>
                      <span className="text-[9px] bg-[#423ba7]/10 text-[#423ba7] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                        Rank #{rev.rank}
                      </span>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: rev.stars }).map((_, sIdx) => (
                        <Star key={sIdx} className="h-3 w-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed italic">
                    "{rev.review}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Features Grid Showcase */}
      <section className="bg-white rounded-[2rem] border border-slate-200/50 p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h3 className="text-2xl font-black text-slate-800">Advanced Simulator Suite</h3>
          <p className="text-slate-400 text-sm mt-2">
            Fully equipped with visual indicators, data filters, and gamification to simulate professional terminal experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="flex gap-4">
            <div className="bg-[#423ba7]/10 p-3 rounded-2xl text-[#423ba7] h-fit shrink-0">
              <PieChart className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm mb-1">Asset Allocation Chart</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Renders a dynamic SVG radial donut chart in your trading terminal, showing your real-time holdings split against available cash.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex gap-4">
            <div className="bg-orange-500/10 p-3 rounded-2xl text-orange-500 h-fit shrink-0">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm mb-1">Custom Watchlists</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Star your favorite digital assets directly from the Market list to pin them to your watchlist dashboards for quick trading.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex gap-4">
            <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-600 h-fit shrink-0">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm mb-1">CSV Ledger Exports</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Download your transaction audit trail logs as a formatted CSV spreadsheet for offline strategy reviews.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex gap-4">
            <div className="bg-amber-500/10 p-3 rounded-2xl text-amber-600 h-fit shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm mb-1">Milestone Achievements</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Unlock gamified badges (e.g., Rookie, Diversifier, Whale Status) as your net portfolio worth scales through trading.
              </p>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="flex gap-4">
            <div className="bg-red-500/10 p-3 rounded-2xl text-red-500 h-fit shrink-0">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm mb-1">Price Alerts (Sidebar Alerts)</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Set threshold notifications on selected coins. The app checks live pricing feeds and triggers visual warnings.
              </p>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="flex gap-4">
            <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-500 h-fit shrink-0">
              <Newspaper className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm mb-1">Sentiment News Ticker</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                An integrated market news feed with sentiment tracking tags (Bullish, Neutral, Bearish) to contextualize price changes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live News Ticker Card (mockup-inspired interactive widget for first time visitors) */}
      <section className="bg-white rounded-[2rem] border border-slate-200/50 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        <div className="flex items-center gap-2.5 mb-6 border-b border-slate-100 pb-3">
          <Newspaper className="h-5 w-5 text-indigo-500" />
          <h3 className="font-extrabold text-slate-800 text-sm">Simulator Live Market Ticker</h3>
        </div>

        {newsLoading ? (
          <div className="text-center py-6 text-slate-400 text-xs animate-pulse">
            Connecting news feeds...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.slice(0, 3).map(item => (
              <a key={item.id} href={item.url || '#'} target="_blank" rel="noopener noreferrer" className="block">
                <div className="p-6 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between gap-4 text-sm relative break-words">
                  <span className="font-bold text-slate-700 leading-snug">{item.title}</span>
                  <div className="flex justify-between items-center text-[12px]">
                    <span className={`px-2 py-0.5 rounded font-black ${
                      item.sentiment === 'Bullish'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : item.sentiment === 'Bearish'
                        ? 'bg-rose-500/10 text-rose-600'
                        : 'bg-slate-200/50 text-slate-500'
                    }`}>
                      {item.sentiment}
                    </span>
                    <span className="text-slate-400 font-medium">{item.time}</span>
                  </div>
                  <span className="absolute top-2 right-2 bg-amber-400/20 text-amber-600 text-xs font-bold px-2 py-0.5 rounded-full">Live</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
