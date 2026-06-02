import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Search,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  BarChart3,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Coins
} from 'lucide-react';

const Market = () => {
  const { API_URL, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');
  const [historyData, setHistoryData] = useState([]);
  const [chartDays, setChartDays] = useState('7');
  const [chartLoading, setChartLoading] = useState(false);
  const [search, setSearch] = useState(initialSearch);

  // Tracking refs to distinguish between user actions and background price updates
  const prevSearchRef = useRef(initialSearch);
  const prevActiveTabRef = useRef('all');
  const firstLoadRef = useRef(true);

  // Sync state when URL parameter changes (e.g. from Header search)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const s = params.get('search') || '';
    if (s !== search) {
      setSearch(s);
    }
  }, [location.search]);

  // When local search input changes (table search), update URL (replacing history)
  const handleLocalSearchChange = (val) => {
    setSearch(val);
    const params = new URLSearchParams(location.search);
    if (val) {
      params.set('search', val);
    } else {
      params.delete('search');
    }
    navigate(`/market?${params.toString()}`, { replace: true });
  };
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  
  // Tab states: 'all' | 'gainers' | 'losers' | 'watchlist'
  const [activeTab, setActiveTab] = useState('all');
  
  // Sorting states
  const [sortBy, setSortBy] = useState('market_cap');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPrices();
    
    // Load Watchlist from localStorage
    const saved = localStorage.getItem('watchlist');
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (e) {
        setWatchlist([]);
      }
    }
    
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [selectedCoin, chartDays]);

  // Reset pagination when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);

  // Auto-select first matching coin when filtered results change
  useEffect(() => {
    if (cryptos.length === 0) return;
    
    // Check if the search or activeTab has actually changed, or if it's the first time cryptos are loaded
    const searchChanged = search !== prevSearchRef.current;
    const tabChanged = activeTab !== prevActiveTabRef.current;
    const isFirstLoad = firstLoadRef.current;

    // Update tracking refs to current values
    prevSearchRef.current = search;
    prevActiveTabRef.current = activeTab;
    if (isFirstLoad) {
      firstLoadRef.current = false;
    }

    // Only update selected coin if search/tab changed or it is the initial load
    if (searchChanged || tabChanged || isFirstLoad) {
      let tabCoins = [...cryptos];
      if (activeTab === 'gainers') {
        tabCoins = tabCoins.filter(c => c.price_change_percentage_24h > 0);
      } else if (activeTab === 'losers') {
        tabCoins = tabCoins.filter(c => c.price_change_percentage_24h < 0);
      } else if (activeTab === 'watchlist') {
        tabCoins = tabCoins.filter(c => watchlist.includes(c.id));
      }

      const matched = tabCoins.filter(coin =>
        coin.name.toLowerCase().includes(search.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(search.toLowerCase())
      );

      if (matched.length > 0) {
        setSelectedCoin(matched[0].id);
      }
    }
    // We intentionally exclude selectedCoin and watchlist from dependencies
    // to avoid resetting the user's manual coin selection when they click a table row.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, activeTab, cryptos]);

  const fetchPrices = async () => {
    try {
      const res = await axios.get(`${API_URL}/market/prices`);
      if (res.data.success) {
        setCryptos(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching market prices', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshPrices = async () => {
    setIsRefreshing(true);
    await fetchPrices();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const fetchHistory = async () => {
    setChartLoading(true);
    try {
      const res = await axios.get(`${API_URL}/market/history/${selectedCoin}?days=${chartDays}`);
      if (res.data.success) {
        setHistoryData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching coin history', err);
    } finally {
      setChartLoading(false);
    }
  };

  const toggleWatchlist = (coinId, e) => {
    e.stopPropagation(); // prevent selecting the coin row
    if (!user) {
      navigate('/login');
      return;
    }
    const updated = watchlist.includes(coinId)
      ? watchlist.filter(id => id !== coinId)
      : [...watchlist, coinId];
    setWatchlist(updated);
    localStorage.setItem('watchlist', JSON.stringify(updated));
  };

  // Helper to handle column sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc'); // default to descending on first click
    }
  };

  // 1. Filter by Active Tab
  let tabCoins = [...cryptos];
  if (activeTab === 'gainers') {
    tabCoins = tabCoins.filter(c => c.price_change_percentage_24h > 0);
  } else if (activeTab === 'losers') {
    tabCoins = tabCoins.filter(c => c.price_change_percentage_24h < 0);
  } else if (activeTab === 'watchlist') {
    tabCoins = tabCoins.filter(c => watchlist.includes(c.id));
  }

  // 2. Filter by Search Query
  const filteredCoins = tabCoins.filter(coin =>
    coin.name.toLowerCase().includes(search.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(search.toLowerCase())
  );

  // 3. Sort Coins
  const sortedCoins = filteredCoins.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (valA === undefined || valA === null) valA = 0;
    if (valB === undefined || valB === null) valB = 0;

    // Handle string sorting (like Name)
    if (typeof valA === 'string') {
      return sortOrder === 'asc' 
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    // Default numeric sorting
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  // 4. Paginate Coins
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCoins = sortedCoins.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedCoins.length / itemsPerPage) || 1;

  const selectedCoinData = cryptos.find(c => c.id === selectedCoin) || cryptos[0];

  const renderSvgChart = () => {
    if (historyData.length === 0) return null;

    const width = 800;
    const height = 280;
    const padding = 20;

    const prices = historyData.map(p => p[1]);
    const maxVal = Math.max(...prices);
    const minVal = Math.min(...prices);
    const valRange = maxVal - minVal || 1;

    const points = historyData.map((data, index) => {
      const x = padding + (index / (historyData.length - 1)) * (width - padding * 2);
      const y = height - padding - ((data[1] - minVal) / valRange) * (height - padding * 2);
      return { x, y };
    });
    
    const referencePoints = points.map((p, idx) => {
      const offsetFactor = Math.sin(idx * 0.4) * 15 + Math.cos(idx * 0.2) * 5;
      const newY = Math.max(padding, Math.min(height - padding, p.y + offsetFactor));
      return { x: p.x, y: newY };
    });

    const pathData1 = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
    const pathData2 = `M ${referencePoints.map(p => `${p.x},${p.y}`).join(' L ')}`;
    
    const fillPathData1 = `${pathData1} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`;
    const fillPathData2 = `${pathData2} L ${referencePoints[referencePoints.length - 1].x},${height - padding} L ${referencePoints[0].x},${height - padding} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="periwinkleGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#423ba7" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#423ba7" stopOpacity="0.00" />
          </linearGradient>
          <linearGradient id="peachGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.00" />
          </linearGradient>
        </defs>

        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(0,0,0,0.03)" strokeDasharray="3" />
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(0,0,0,0.03)" strokeDasharray="3" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(0,0,0,0.06)" />

        <path d={fillPathData2} fill="url(#peachGrad)" />
        <path d={fillPathData1} fill="url(#periwinkleGrad)" />

        <path
          d={pathData2}
          fill="none"
          stroke="#f97316"
          strokeWidth="1.5"
          strokeDasharray="4 2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.65"
        />

        <path
          d={pathData1}
          fill="none"
          stroke="#423ba7"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {points.length > 5 && [
          points[Math.floor(points.length * 0.25)],
          points[Math.floor(points.length * 0.5)],
          points[Math.floor(points.length * 0.75)],
          points[points.length - 1]
        ].map((p, idx) => (
          <g key={idx}>
            <circle cx={p.x} cy={p.y} r="5" fill="#423ba7" stroke="white" strokeWidth="2" />
            <circle cx={p.x} cy={p.y} r="8" fill="#423ba7" opacity="0.15" />
          </g>
        ))}
      </svg>
    );
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <ChevronsUpDown className="h-3 w-3 opacity-40 ml-1 inline text-slate-400" />;
    return sortOrder === 'asc' 
      ? <TrendingUp className="h-3 w-3 text-indigo-600 ml-1 inline" />
      : <TrendingDown className="h-3 w-3 text-indigo-600 ml-1 inline" />;
  };

  return (
    <div className="flex-1 flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Top action cards row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Crypto Exchange Market</h2>
          <p className="text-slate-400 text-xs mt-0.5">Explore real-time cryptocurrency values, sort live metrics, and start virtual trading.</p>
        </div>

        <div>
          <button
            onClick={refreshPrices}
            className="flex items-center gap-2 text-[#423ba7] bg-white border border-slate-200/50 px-4 py-2.5 rounded-full shadow-sm hover:bg-slate-50 transition-colors text-xs font-bold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Feed
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-indigo-600 animate-pulse font-bold">
          Updating price logs...
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Main Selected Coin Chart Panel */}
          {selectedCoinData && (
            <div className="bg-white rounded-[2rem] border border-slate-200/50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <img src={selectedCoinData.image} alt={selectedCoinData.name} className="h-12 w-12 object-contain" />
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-2xl font-black text-slate-800">{selectedCoinData.name}</h3>
                      <span className="text-xs bg-slate-100 text-slate-400 font-bold px-2 py-0.5 rounded-md uppercase">{selectedCoinData.symbol}</span>
                      <button
                        onClick={(e) => toggleWatchlist(selectedCoinData.id, e)}
                        className={`p-1 rounded-full hover:bg-slate-50 transition-colors ${
                          watchlist.includes(selectedCoinData.id) ? 'text-amber-400' : 'text-slate-300 hover:text-slate-500'
                        }`}
                      >
                        <Star className={`h-5 w-5 ${watchlist.includes(selectedCoinData.id) ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1.5">
                      <span className="text-3xl font-black text-slate-800">
                        ${selectedCoinData.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </span>
                      <span className={`text-xs font-black flex items-center gap-0.5 ${
                        selectedCoinData.price_change_percentage_24h >= 0 ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        {selectedCoinData.price_change_percentage_24h >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        {selectedCoinData.price_change_percentage_24h?.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Day selector pill */}
                  <div className="flex items-center bg-slate-100/80 p-1 rounded-full border border-slate-200/40 text-xs font-bold text-slate-500">
                    {['1', '7', '30'].map(d => (
                      <button
                        key={d}
                        onClick={() => setChartDays(d)}
                        className={`px-3 py-1.5 rounded-full transition-all ${
                          chartDays === d ? 'bg-[#423ba7] text-white shadow-sm' : 'hover:bg-slate-200/60'
                        }`}
                      >
                        {d === '1' ? '24h' : `${d}d`}
                      </button>
                    ))}
                  </div>

                  {/* Trade Action Link */}
                  <Link
                    to={`/trade?coin=${selectedCoinData.id}`}
                    className="bg-[#423ba7] hover:bg-[#342e8a] text-white text-xs font-extrabold px-5 py-3 rounded-full shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5 active:scale-95 text-center shrink-0"
                  >
                    Open Trading Console
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Stats & Chart Visual Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Stats cards (Col Span 3) */}
                <div className="lg:col-span-3 space-y-4 flex flex-col justify-between">
                  <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl flex flex-col justify-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Market Cap Ranking</span>
                    <span className="text-xl font-black text-slate-700 mt-1">
                      Rank #{cryptos.findIndex(c => c.id === selectedCoinData.id) + 1}
                    </span>
                  </div>
                  
                  <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl flex flex-col justify-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Market Capitalization</span>
                    <span className="text-xl font-black text-slate-700 mt-1 leading-snug">
                      ${selectedCoinData.market_cap?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>

                  <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl flex flex-col justify-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live Volume Status</span>
                    <span className="text-base font-black text-emerald-600 flex items-center gap-1 mt-1">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" /> Real-time active
                    </span>
                  </div>
                </div>

                {/* SVG Chart (Col Span 9) */}
                <div className="lg:col-span-9 h-72 relative flex items-center justify-center bg-slate-50/20 border border-slate-100/50 rounded-2xl p-4">
                  {chartLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px] rounded-2xl">
                      <BarChart3 className="h-8 w-8 text-indigo-500 animate-pulse" />
                    </div>
                  ) : historyData.length > 0 ? (
                    renderSvgChart()
                  ) : (
                    <span className="text-slate-400">Loading chart analytics...</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Full Width Coin Listing and Search Table Card */}
          <div className="bg-white rounded-[2rem] border border-slate-200/50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              {/* Category tabs */}
              <div className="flex bg-slate-100/80 p-1.5 rounded-full border border-slate-200/40 text-xs font-bold text-slate-500 w-fit shrink-0 gap-1">
                {[
                  { id: 'all', label: 'All Cryptos', icon: (active) => <Coins className={`h-4 w-4 ${active ? 'text-white' : 'text-slate-400'}`} /> },
                  { id: 'gainers', label: 'Gainers', icon: (active) => <TrendingUp className={`h-4 w-4 ${active ? 'text-white' : 'text-emerald-500'}`} /> },
                  { id: 'losers', label: 'Losers', icon: (active) => <TrendingDown className={`h-4 w-4 ${active ? 'text-white' : 'text-rose-500'}`} /> },
                  ...(user ? [{ id: 'watchlist', label: 'Watchlist', icon: (active) => <Star className={`h-4 w-4 ${active ? 'text-white fill-white' : 'text-amber-500 fill-amber-500'}`} /> }] : [])
                ].map(tab => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${
                        isActive ? 'bg-[#423ba7] text-white shadow-sm' : 'hover:bg-slate-200/60'
                      }`}
                    >
                      {tab.icon(isActive)}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Styled Search bar */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-3 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search assets by symbol or name..."
                  value={search}
                  onChange={(e) => handleLocalSearchChange(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200/60 rounded-full py-2.5 pl-11 pr-4 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition-all"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto min-h-[350px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[9px] select-none">
                    <th className="py-4 px-3 w-10 text-center">
                      <Star className="h-4.5 w-4.5 mx-auto text-slate-400 fill-slate-100" />
                    </th>
                    <th className="py-4 px-3 w-12 text-center cursor-pointer hover:text-slate-700" onClick={() => handleSort('market_cap')}># {getSortIcon('market_cap')}</th>
                    <th className="py-4 px-4 cursor-pointer hover:text-slate-700" onClick={() => handleSort('name')}>Name {getSortIcon('name')}</th>
                    <th className="py-4 px-4 text-right cursor-pointer hover:text-slate-700" onClick={() => handleSort('current_price')}>Price {getSortIcon('current_price')}</th>
                    <th className="py-4 px-4 text-right cursor-pointer hover:text-slate-700" onClick={() => handleSort('price_change_percentage_24h')}>24h Change {getSortIcon('price_change_percentage_24h')}</th>
                    <th className="py-4 px-4 text-right cursor-pointer hover:text-slate-700" onClick={() => handleSort('market_cap')}>Market Cap</th>
                    <th className="py-4 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCoins.map((coin, index) => {
                    const globalRank = cryptos.findIndex(c => c.id === coin.id) + 1;
                    const isWatchlisted = watchlist.includes(coin.id);
                    const isSelected = selectedCoin === coin.id;
                    
                    return (
                      <tr 
                        key={coin.id} 
                        onClick={() => setSelectedCoin(coin.id)}
                        className={`border-b border-slate-100/50 hover:bg-slate-50/60 cursor-pointer transition-colors duration-200 ${
                          isSelected ? 'bg-indigo-50/15' : ''
                        }`}
                      >
                        {/* Star Watchlist */}
                        <td className="py-4 px-3 text-center">
                          <button
                            onClick={(e) => toggleWatchlist(coin.id, e)}
                            className={`p-1.5 rounded-full hover:bg-slate-100 transition-colors ${
                              isWatchlisted ? 'text-amber-400' : 'text-slate-300 hover:text-slate-500'
                            }`}
                          >
                            <Star className={`h-4.5 w-4.5 ${isWatchlisted ? 'fill-amber-400' : ''}`} />
                          </button>
                        </td>

                        {/* Rank */}
                        <td className="py-4 px-3 text-center font-bold text-slate-400">
                          {globalRank}
                        </td>

                        {/* Logo + Name */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img src={coin.image} alt={coin.name} className="h-7 w-7 object-contain rounded-full bg-slate-50 border border-slate-100 p-0.5" />
                            <div>
                              <span className="font-extrabold text-slate-800 text-sm block leading-none">{coin.name}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">{coin.symbol}</span>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-4 text-right font-black text-slate-700 text-sm">
                          ${coin.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                        </td>

                        {/* 24h Change */}
                        <td className="py-4 px-4 text-right">
                          <span className={`inline-flex items-center gap-0.5 font-bold px-2.5 py-1 rounded-full text-[10px] ${
                            coin.price_change_percentage_24h >= 0 
                              ? 'bg-emerald-500/10 text-emerald-600' 
                              : 'bg-rose-500/10 text-rose-600'
                          }`}>
                            {coin.price_change_percentage_24h >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%
                          </span>
                        </td>

                        {/* Market Cap */}
                        <td className="py-4 px-4 text-right font-semibold text-slate-500">
                          ${coin.market_cap?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>

                        {/* Action buttons */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              to={`/trade?coin=${coin.id}`}
                              onClick={(e) => e.stopPropagation()} // prevent row select
                              className="bg-indigo-50 hover:bg-[#423ba7] hover:text-white text-[#423ba7] font-extrabold px-3 py-1.5 rounded-full transition-all text-[10px] uppercase tracking-wider"
                            >
                              Trade
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {currentCoins.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400 font-semibold italic">
                        No digital assets match your filter or search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-medium">
                  Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, sortedCoins.length)} of {sortedCoins.length} assets
                </span>

                <div className="flex items-center gap-1.5 self-center">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-200/50 bg-white hover:bg-slate-50 rounded-xl disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 text-slate-600" />
                  </button>
                  
                  {/* Page index buttons (smart range) */}
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                    let targetPage = currentPage;
                    if (currentPage <= 3) {
                      targetPage = idx + 1;
                    } else if (currentPage >= totalPages - 2) {
                      targetPage = totalPages - 4 + idx;
                    } else {
                      targetPage = currentPage - 2 + idx;
                    }

                    if (targetPage < 1 || targetPage > totalPages) return null;

                    return (
                      <button
                        key={targetPage}
                        onClick={() => setCurrentPage(targetPage)}
                        className={`w-9 h-9 font-bold rounded-xl transition-all ${
                          currentPage === targetPage
                            ? 'bg-[#423ba7] text-white shadow-sm'
                            : 'bg-white border border-slate-200/50 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {targetPage}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-slate-200/50 bg-white hover:bg-slate-50 rounded-xl disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4 text-slate-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Market;
