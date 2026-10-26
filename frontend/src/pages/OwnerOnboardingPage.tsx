import React, { useEffect, useState } from 'react';
import { Home, Phone, MapPin, FileText, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isOwnerAccount, isOwnerOnboardingComplete, isUserAccount, resolveHomeView } from '../lib/userRouting';

interface OwnerOnboardingPageProps {
  setView: (view: string) => void;
}

export const OwnerOnboardingPage: React.FC<OwnerOnboardingPageProps> = ({ setView }) => {
  const { user, updateProfile } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setView('login');
      return;
    }
    if (isUserAccount(user)) {
      setView(resolveHomeView(user));
      return;
    }
    if (isOwnerAccount(user) && isOwnerOnboardingComplete(user)) {
      setView('dashboard-owner');
    }
  }, [user, setView]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone || !city) {
      alert('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    const success = await updateProfile({
      name,
      phone,
      city,
      bio,
      account_type: 'owner',
      role: 'owner',
    });

    setLoading(false);

    if (success) {
      setView('dashboard-owner');
    } else {
      alert('Failed to save owner details. Please try again.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 bg-amber-50/30">
      <div className="w-full max-w-2xl bg-white border border-amber-200/60 rounded-3xl p-8 shadow-xl">

        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
            <Home className="w-8 h-8 text-amber-600" />
          </div>

          <h2 className="text-3xl font-extrabold text-slate-800">
            Property Owner Details
          </h2>

          <p className="text-sm text-slate-400 mt-2">
            Tell us a little about yourself before you start listing properties.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              City *
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter your city"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              About You
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell users a little about yourself..."
                rows={4}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Continue to Owner Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};
