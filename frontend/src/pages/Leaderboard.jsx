import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Award, Trophy, Medal, Search, TrendingUp, ShieldAlert } from 'lucide-react';

const Leaderboard = () => {
  const { API_URL, user } = useContext(AuthContext);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const mockLeaderboard = [
    { rank: 1, userId: 'mock1', username: 'AlphaTrader', cash: 1420500.00, assetsValue: 120400.00, totalValue: 1540900.00 },
    { rank: 2, userId: 'mock2', username: 'SatoshiSeeker', cash: 890200.00, assetsValue: 450150.00, totalValue: 1340350.00 },
    { rank: 3, userId: 'mock3', username: 'WhaleWatcher', cash: 100500.00, assetsValue: 980000.00, totalValue: 1080500.00 },
    { rank: 4, userId: 'mock4', username: 'BullRunBuddy', cash: 500000.00, assetsValue: 350000.00, totalValue: 850000.00 },
    { rank: 5, userId: 'mock5', username: 'DiamondHands', cash: 25000.00, assetsValue: 675000.00, totalValue: 700000.00 },
    { rank: 6, userId: 'mock6', username: 'HODL_Queen', cash: 120000.00, assetsValue: 450000.00, totalValue: 570000.00 },
    { rank: 7, userId: 'mock7', username: 'PaperHandPaul', cash: 250000.00, assetsValue: 85000.00, totalValue: 335000.00 },
    { rank: 8, userId: 'mock8', username: 'NoobTrader', cash: 95000.00, assetsValue: 12000.00, totalValue: 107000.00 }
  ];

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchLeaderboard();
    } else {
      setPlayers(mockLeaderboard);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get(`${API_URL}/leaderboard`);
      if (res.data.success) {
        setPlayers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching leaderboard', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter(player =>
    player.username.toLowerCase().includes(search.toLowerCase())
  );

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-amber-500 animate-bounce" />;
      case 2:
        return <Medal className="h-5 w-5 text-slate-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-700" />;
      default:
        return <span className="text-slate-400 font-extrabold text-xs w-5 text-center">{rank}</span>;
    }
  };

  const getRankBg = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-amber-500/5 border-amber-500/10 hover:bg-amber-500/10';
      case 2:
        return 'bg-slate-100/40 border-slate-200/40 hover:bg-slate-100/60';
      case 3:
        return 'bg-amber-700/5 border-amber-700/10 hover:bg-amber-700/10';
      default:
        return 'bg-white border-transparent hover:border-slate-100 hover:bg-slate-50/40';
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-8 max-w-5xl mx-auto w-full">
      {/* Top Banner section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-1.5">
            <Award className="h-5 w-5 text-indigo-500" />
            Rankings Leaderboard
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">Ranked by total virtual net portfolio worth (USD Cash + Live Asset Values)</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search trader..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border border-slate-200/60 rounded-full py-2.5 pl-10 pr-4 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full sm:w-64 shadow-sm"
          />
        </div>
      </div>

      {/* Demo Mode CTA Banner for guest users */}
      {!user && (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 text-sm">Demo Mode Active</h4>
            <p className="text-slate-500 text-xs">You are currently viewing a simulated demonstration board. Join the simulator to compete!</p>
          </div>
          <div className="flex gap-2 font-display">
            <Link to="/login" className="bg-[#423ba7] hover:bg-[#342e8a] text-white text-xs font-bold px-4.5 py-2 rounded-full shadow-md shadow-indigo-500/10 transition-all text-center shrink-0">
              Sign In
            </Link>
            <Link to="/register" className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4.5 py-2 rounded-full transition-all text-center shrink-0">
              Register
            </Link>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-indigo-600 animate-pulse font-bold">
          Aggregating ranking lists...
        </div>
      ) : (
        <div className="space-y-3">
          {/* Table Header labels */}
          <div className="hidden md:grid grid-cols-12 px-6 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Trader</div>
            <div className="col-span-2 text-right">Cash Balance</div>
            <div className="col-span-2 text-right">Crypto Assets</div>
            <div className="col-span-3 text-right">Total Net Worth</div>
          </div>

          {/* Leaderboard Cards */}
          <div className="space-y-2.5">
            {filteredPlayers.map(player => {
              const isSelf = user && player.userId === user._id;
              const displayName = isSelf ? user.username : player.username;
              return (
                <div
                  key={player.userId}
                  className={`bg-white rounded-2xl border p-4.5 flex flex-col md:grid md:grid-cols-12 gap-3 items-center transition-all duration-300 ${
                    isSelf 
                      ? 'border-indigo-500/40 bg-indigo-50/5 hover:bg-indigo-50/10 shadow-[0_4px_20px_rgba(66,59,167,0.05)]' 
                      : getRankBg(player.rank)
                  }`}
                >
                  {/* Rank Badge */}
                  <div className="col-span-1 flex items-center gap-2 justify-center md:justify-start w-full">
                    <span className="md:hidden text-[10px] text-slate-400 font-bold uppercase">Rank: </span>
                    <div className="flex items-center justify-center bg-slate-100 p-1.5 rounded-lg border border-slate-200/40">
                      {getRankIcon(player.rank)}
                    </div>
                  </div>

                  {/* Username with initial avatar */}
                  <div className="col-span-4 flex items-center justify-between md:justify-start w-full">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                        isSelf
                          ? 'bg-[#423ba7] text-white'
                          : player.rank === 1 ? 'bg-amber-400 text-slate-800' : player.rank === 2 ? 'bg-slate-300 text-slate-800' : player.rank === 3 ? 'bg-amber-700 text-white' : 'bg-indigo-50 text-indigo-500'
                      }`}>
                        {displayName?.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-700 text-sm">{displayName}</span>
                        {isSelf && (
                          <span className="bg-[#423ba7]/10 text-[#423ba7] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                {/* Cash */}
                <div className="col-span-2 flex justify-between md:justify-end w-full md:text-right">
                  <span className="md:hidden text-[10px] text-slate-400 font-bold uppercase">Cash:</span>
                  <span className="font-semibold text-slate-500 text-xs">
                    ${player.cash?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Assets Value */}
                <div className="col-span-2 flex justify-between md:justify-end w-full md:text-right">
                  <span className="md:hidden text-[10px] text-slate-400 font-bold uppercase">Assets:</span>
                  <span className="font-semibold text-purple-600 text-xs">
                    ${player.assetsValue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Net Worth */}
                <div className="col-span-3 flex justify-between md:justify-end w-full md:text-right">
                  <span className="md:hidden text-[10px] text-slate-400 font-bold uppercase text-emerald-500">Net Portfolio:</span>
                  <span className="font-black text-[#423ba7] text-base">
                    ${player.totalValue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              );
            })}

            {filteredPlayers.length === 0 && (
              <div className="bg-white p-12 text-center text-slate-400 border border-slate-200/50 rounded-[2rem] flex flex-col items-center justify-center gap-3">
                <ShieldAlert className="h-8 w-8 text-slate-300 animate-bounce" />
                <span className="font-semibold text-sm">No traders found</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
