import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { compressImage } from '../utils/compressImage';
import { UserPlus, Mail, Lock, User, ShieldAlert, AlertCircle, Home, UserCheck, Search, Upload } from 'lucide-react';

interface SignupPageProps {
  setView: (view: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ setView }) => {
  const { signUp } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'owner' | 'seeker' | 'finder'>('seeker');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 400, 0.7);
      setProfilePic(compressed);
    } catch {
      setProfilePic(await compressImage(file, 800, 0.6));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      await signUp(email, password, name, role, { profile_pic: profilePic || undefined });
      // Route based on role
      if (role === 'owner') {
        setView('dashboard-owner');
      } else {
        setView('role-selection'); // Seekers choose option A or B onboarding
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: 'owner',
      title: 'Property Owner',
      desc: 'I have rooms, flats, or PG beds to rent out.',
      icon: <Home className="w-5 h-5 text-amber-600" />
    },
    {
      id: 'seeker',
      title: 'Room Seeker',
      desc: 'I am looking for a room, with or without a roommate.',
      icon: <Search className="w-5 h-5 text-amber-500" />
    },
    {
      id: 'finder',
      title: 'Roommate Finder',
      desc: 'I want to find a compatible roommate first.',
      icon: <UserCheck className="w-5 h-5 text-emerald-500" />
    }
  ];

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 bg-amber-50/30 text-slate-800">
      <div className="w-full max-w-xl bg-white border border-amber-200/60 rounded-3xl p-8 shadow-xl">
        
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-amber-600 to-amber-500">
            Create Free Account
          </h2>
          <p className="text-xs text-slate-400 mt-2">Join RoomieMatch to connect with verified listings and compatible roommates.</p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-start gap-2 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* User Role Card Grid Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wide">
              Select Your Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {roles.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setRole(r.id as any)}
                  className={`p-4 border rounded-2xl cursor-pointer hover:border-amber-400 hover:bg-slate-50/20 transition-all ${role === r.id ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20' : 'border-amber-200/40'}`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                    {r.icon}
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 leading-tight">{r.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-amber-200/70 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-amber-200/70 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-800"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
              Create Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-11 pr-4 py-3 bg-white border border-amber-200/70 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
              Profile Picture <span className="text-slate-300 font-normal">(optional)</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-white hover:file:bg-amber-600 file:cursor-pointer cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-700 hover:opacity-95 text-white font-extrabold rounded-2xl shadow-md hover:shadow-amber-500/20 transform active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Registering...' : 'Register Account'}
            <UserPlus className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-amber-200/40">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <button
              onClick={() => setView('login')}
              className="text-amber-600 font-bold hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
