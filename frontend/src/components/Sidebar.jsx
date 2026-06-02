import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, BarChart2, Coins, Award, LogOut, User, LogIn, UserPlus } from 'lucide-react';

const Sidebar = () => {
  const { user, loading, logout } = useContext(AuthContext);

  const navLinkClass = ({ isActive }) =>
    `relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 group ${
      isActive
        ? 'bg-white/15 text-white shadow-md'
        : 'text-indigo-200 hover:bg-white/5 hover:text-white'
    }`;

  const activeIndicator = ({ isActive }) =>
    isActive ? (
      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-md" />
    ) : null;

  return (
    <aside className="w-20 bg-[#423ba7] flex flex-col items-center justify-between py-6 shrink-0 shadow-xl border-r border-indigo-900/10">
      {/* Top Brand Logo */}
      <div className="flex flex-col items-center gap-6">
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white shadow-md border border-white/10">
          <Coins className="h-5.5 w-5.5 text-amber-300" />
        </div>

        {/* Separator */}
        <div className="w-8 h-[1px] bg-white/10" />

        {/* Navigation Icons */}
        <nav className="flex flex-col items-center gap-4">
          {!user && (
            <NavLink to="/" className={navLinkClass}>
              {({ isActive }) => (
                <>
                  {activeIndicator({ isActive })}
                  <Home className="h-5 w-5" />
                  <span className="absolute left-24 bg-slate-900 text-white text-xs px-2 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow duration-200 z-50">
                    Home
                  </span>
                </>
              )}
            </NavLink>
          )}

          <NavLink to="/market" className={navLinkClass}>
            {({ isActive }) => (
              <>
                {activeIndicator({ isActive })}
                <BarChart2 className="h-5 w-5" />
                <span className="absolute left-24 bg-slate-900 text-white text-xs px-2 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow duration-200 z-50">
                  Market
                </span>
              </>
            )}
          </NavLink>

          {user && (
            <NavLink to="/trade" className={navLinkClass}>
              {({ isActive }) => (
                <>
                  {activeIndicator({ isActive })}
                  <Coins className="h-5 w-5" />
                  <span className="absolute left-24 bg-slate-900 text-white text-xs px-2 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow duration-200 z-50">
                    Trade
                  </span>
                </>
              )}
            </NavLink>
          )}

          <NavLink to="/leaderboard" className={navLinkClass}>
            {({ isActive }) => (
              <>
                {activeIndicator({ isActive })}
                <Award className="h-5 w-5" />
                <span className="absolute left-24 bg-slate-900 text-white text-xs px-2 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow duration-200 z-50">
                  Leaderboard
                </span>
              </>
            )}
          </NavLink>
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-4">
        {loading ? (
          <div className="w-10 h-10 rounded-xl bg-indigo-900/10 animate-pulse" />
        ) : user ? (
          <button
            onClick={logout}
            className="flex items-center justify-center w-12 h-12 rounded-xl text-indigo-200 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-300 group relative"
          >
            <LogOut className="h-5 w-5" />
            <span className="absolute left-24 bg-slate-900 text-white text-xs px-2 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow duration-200 z-50">
              Logout
            </span>
          </button>
        ) : (
          <>
            <NavLink to="/login" className={navLinkClass}>
              {({ isActive }) => (
                <>
                  <LogIn className="h-5 w-5" />
                  <span className="absolute left-24 bg-slate-900 text-white text-xs px-2 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow duration-200 z-50">
                    Login
                  </span>
                </>
              )}
            </NavLink>
            <NavLink to="/register" className={navLinkClass}>
              {({ isActive }) => (
                <>
                  <UserPlus className="h-5 w-5" />
                  <span className="absolute left-24 bg-slate-900 text-white text-xs px-2 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow duration-200 z-50">
                    Register
                  </span>
                </>
              )}
            </NavLink>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
