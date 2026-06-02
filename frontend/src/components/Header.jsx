import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Search, Wallet, User, LogIn } from 'lucide-react';

const Header = () => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  // Sync header search text with URL parameter ?search=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchText(params.get('search') || '');
  }, [location.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/market?search=${encodeURIComponent(searchText)}`);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchText(val);
    if (location.pathname === '/market') {
      navigate(`/market?search=${encodeURIComponent(val)}`, { replace: true });
    }
  };

  // Get Page Title from path
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Overview';
      case '/market':
        return 'Market Data';
      case '/trade':
        return 'Trading Console';
      case '/leaderboard':
        return 'Leaderboard';
      case '/login':
        return 'Access Portal';
      case '/register':
        return 'Account Creation';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="px-8 py-6 flex items-center justify-between bg-[#edf0f5]/80 backdrop-blur-md sticky top-0 z-40">
      {/* Page Title / Mock Search Bar */}
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-bold text-slate-800 hidden md:block">
          {getPageTitle()}
        </h1>

        {/* Active Search Pill */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search assets, options..."
            value={searchText}
            onChange={handleSearchChange}
            className="w-56 md:w-80 bg-white border border-slate-200/60 rounded-full py-2.5 pl-5 pr-12 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition-all"
          />
          <button type="submit" className="absolute right-1 top-1 bg-[#423ba7] hover:bg-[#342e8a] text-white p-2 rounded-full shadow transition-all cursor-pointer">
            <Search className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {/* Right Content */}
      <div className="flex items-center gap-4">
        {loading ? (
          <div className="h-10 w-24 bg-slate-200/50 animate-pulse rounded-full" />
        ) : user ? (
          <div className="flex items-center gap-4">
            {/* Wallet pill */}
            <div className="bg-white border border-slate-200/60 pl-3 pr-4 py-2 rounded-full flex items-center gap-2.5 shadow-sm text-sm">
              <div className="bg-emerald-500/10 p-1.5 rounded-full text-emerald-600">
                <Wallet className="h-4 w-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">USD Balance</span>
                <span className="font-extrabold text-slate-700 leading-tight">
                  ${user.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Profile Info Card */}
            <div className="bg-white border border-slate-200/60 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm text-sm font-semibold text-slate-700">
              <User className="h-4 w-4 text-indigo-500" />
              <span className="hidden sm:inline">{user.username}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-slate-500 hover:text-slate-800 text-sm font-semibold px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-[#423ba7] hover:bg-[#342e8a] text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
