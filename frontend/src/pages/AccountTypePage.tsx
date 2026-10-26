import React, { useEffect, useState } from 'react';
import { Home, Users, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isOwnerAccount, isUserAccount, resolveHomeView } from '../lib/userRouting';

interface AccountTypePageProps {
  setView: (view: string) => void;
}

export const AccountTypePage: React.FC<AccountTypePageProps> = ({ setView }) => {
  const { user, updateProfile } = useApp();
  const [loading, setLoading] = useState<'owner' | 'user' | null>(null);

  useEffect(() => {
    if (!user) {
      setView('login');
      return;
    }
    if (isOwnerAccount(user) || isUserAccount(user)) {
      setView(resolveHomeView(user));
    }
  }, [user, setView]);

  const chooseOwner = async () => {
    setLoading('owner');
    const success = await updateProfile({ account_type: 'owner' });
    setLoading(null);
    if (success) {
      setView('owner-onboarding');
    } else {
      alert('Could not save account type. Please try again.');
    }
  };

  const chooseUser = async () => {
    setLoading('user');
    const success = await updateProfile({ account_type: 'user' });
    setLoading(null);
    if (success) {
      setView('role-selection');
    } else {
      alert('Could not save account type. Please try again.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 bg-amber-50/30">
      <div className="w-full max-w-3xl">

        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-amber-600 to-amber-500">
            Welcome to Find Your Roommate
          </h2>

          <p className="text-sm text-slate-400 mt-3">
            Choose how you want to use the platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <button
            onClick={chooseOwner}
            disabled={!!loading}
            className="group text-left bg-white border-2 border-amber-200/60 hover:border-amber-500 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 disabled:opacity-60"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-6">
              <Home className="w-7 h-7 text-amber-600" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-800 group-hover:text-amber-600">
              Property Owner
            </h3>

            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              I own rooms, flats, PGs or other rental properties and want to
              list them on the platform.
            </p>

            <div className="mt-7 flex items-center gap-2 text-sm font-bold text-amber-600">
              {loading === 'owner' ? 'Saving...' : 'Continue as Owner'}
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={chooseUser}
            disabled={!!loading}
            className="group text-left bg-white border-2 border-amber-200/60 hover:border-amber-500 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 disabled:opacity-60"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
              <Users className="w-7 h-7 text-emerald-600" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-800 group-hover:text-emerald-600">
              User
            </h3>

            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              I am looking for a room, a roommate, or both.
            </p>

            <div className="mt-7 flex items-center gap-2 text-sm font-bold text-emerald-600">
              {loading === 'user' ? 'Saving...' : 'Continue as User'}
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

        </div>
      </div>
    </div>
  );
};
