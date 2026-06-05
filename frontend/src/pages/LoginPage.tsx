import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogIn, Mail, Lock, AlertCircle, Info } from 'lucide-react';

interface LoginPageProps {
  setView: (view: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setView }) => {
  const { signIn, user } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const loggedUser = await signIn(email, password);
      if (loggedUser.role === 'owner') {
        setView('dashboard-owner');
      } else if (loggedUser.role === 'admin') {
        setView('admin');
      } else {
        setView('dashboard-seeker');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (mockEmail: string, mockPass: string) => {
    setEmail(mockEmail);
    setPassword(mockPass);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-amber-50/30">
      <div className="w-full max-w-md bg-white border border-amber-200/60 rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-amber-600 to-amber-500">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-400 mt-2">Sign in to find rooms, match roommates, and chat in real-time.</p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2 text-xs leading-relaxed text-rose-600">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-amber-600 mb-1.5 uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 bg-white border border-amber-200/70 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-600 mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-white border border-amber-200/70 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-700 hover:opacity-95 text-white font-extrabold rounded-2xl shadow-md hover:shadow-amber-500/20 transform active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Signing In...' : 'Sign In'}
            <LogIn className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-amber-100">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <button
              onClick={() => setView('signup')}
              className="text-amber-600 font-bold hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>

      <div className="mt-8 max-w-md w-full bg-white border border-amber-200/50 p-6 rounded-3xl shadow-sm">
        <div className="flex gap-2 items-start text-amber-600">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-slate-800">Testing Credentials</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
              Select one of the simulated roles below to fill in details and explore dashboards immediately:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={() => handleQuickLogin('owner@example.com', 'password123')}
            className="text-[10px] text-left p-2.5 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors border border-amber-100"
          >
            <p className="font-extrabold text-slate-800">Owner</p>
            <p className="text-slate-500 font-normal">owner@example.com</p>
          </button>
          <button
            onClick={() => handleQuickLogin('seeker1@example.com', 'password123')}
            className="text-[10px] text-left p-2.5 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors border border-amber-100"
          >
            <p className="font-extrabold text-slate-800">Seeker (Aanya)</p>
            <p className="text-slate-500 font-normal">seeker1@example.com</p>
          </button>
          <button
            onClick={() => handleQuickLogin('finder1@example.com', 'password123')}
            className="text-[10px] text-left p-2.5 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors border border-amber-100"
          >
            <p className="font-extrabold text-slate-800">Finder (Priyanka)</p>
            <p className="text-slate-500 font-normal">finder1@example.com</p>
          </button>
          <button
            onClick={() => handleQuickLogin('admin@example.com', 'admin123')}
            className="text-[10px] text-left p-2.5 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors border border-amber-100"
          >
            <p className="font-extrabold text-slate-800">Admin</p>
            <p className="text-slate-500 font-normal">admin@example.com</p>
          </button>
        </div>
      </div>
    </div>
  );
};
