import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Loader } from 'lucide-react';

const Login = () => {
  const { login, user } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/trade');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      return setError('Please fill in all fields');
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/trade');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-md bg-white p-8 rounded-[2rem] border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800">
            Sign In
          </h2>
          <p className="text-slate-400 text-xs mt-2">Log in to manage your paper-trading portfolio</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs mb-6">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200/60 rounded-xl py-3 pl-11 pr-4 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200/60 rounded-xl py-3 pl-11 pr-4 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#423ba7] hover:bg-[#342e8a] disabled:bg-indigo-500/50 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 mt-4 text-xs"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-slate-400 text-xs">
            Don't have a trading account?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors">
              Register Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
