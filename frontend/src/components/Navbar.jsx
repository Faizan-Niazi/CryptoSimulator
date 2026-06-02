import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Coins, LogOut, User, BarChart2, TrendingUp, Award, LogIn } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
      isActive
        ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20'
        : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
    }`;

  return (
    <nav className="sticky top-0 z-50 glass backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/5">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
          <Coins className="h-6 w-6 animate-pulse" />
        </div>
        <span className="text-xl font-extrabold bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent tracking-tight">
          Crypto<span className="text-indigo-400">Simulator</span>
        </span>
      </Link>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-2">
        <NavLink to="/" className={linkClass}>
          <TrendingUp className="h-4 w-4" />
          Home
        </NavLink>
        <NavLink to="/market" className={linkClass}>
          <BarChart2 className="h-4 w-4" />
          Market
        </NavLink>
        <NavLink to="/trade" className={linkClass}>
          <Coins className="h-4 w-4" />
          Trade
        </NavLink>
        <NavLink to="/leaderboard" className={linkClass}>
          <Award className="h-4 w-4" />
          Leaderboard
        </NavLink>
      </div>

      {/* Auth Status */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            {/* User Cash Balance Tag */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 flex items-center gap-2">
              <span className="text-emerald-500">Balance:</span>
              <span>${user.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            {/* Profile Dropdown / Card */}
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <User className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-semibold text-gray-200">{user.username}</span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-102 active:scale-98"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
            <Link
              to="/register"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-102 active:scale-98"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
