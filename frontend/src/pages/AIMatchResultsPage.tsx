import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Sparkles, User, AlertTriangle, CheckCircle, Flame } from 'lucide-react';

interface AIMatchResultsPageProps {
  match: any;
  setView: (view: string) => void;
}

const attributeFields = [
  { key: 'budget', label: 'Budget', userLabel: 'Budget Range', matchLabel: 'Budget Range' },
  { key: 'area', label: 'Area Preference', userLabel: 'Preferred Area', matchLabel: 'Preferred Area' },
  { key: 'sleep', label: 'Sleep Schedule', userLabel: 'Sleep Schedule', matchLabel: 'Sleep Schedule' },
  { key: 'cleanliness', label: 'Cleanliness', userLabel: 'Cleanliness', matchLabel: 'Cleanliness' },
  { key: 'smoking', label: 'Smoking', userLabel: 'Smoking Habit', matchLabel: 'Smoking Habit' },
  { key: 'drinking', label: 'Drinking', userLabel: 'Drinking Habit', matchLabel: 'Drinking Habit' },
  { key: 'food', label: 'Food Preference', userLabel: 'Food Preference', matchLabel: 'Food Preference' },
  { key: 'noise', label: 'Noise Level', userLabel: 'Noise Tolerance', matchLabel: 'Noise Tolerance' },
  { key: 'guests', label: 'Guests Policy', userLabel: 'Guests', matchLabel: 'Guests' },
];

const parseLifestyle = (profile: any) => {
  if (!profile) return {};
  let habits: any = {};
  try {
    habits = typeof profile.lifestyle_habits === 'string'
      ? JSON.parse(profile.lifestyle_habits)
      : (profile.lifestyle_habits || {});
  } catch (e) {}
  return {
    budget: profile.budget ? `₹${profile.budget}` : '',
    area: profile.preferred_area || profile.area || '',
    sleep: habits.sleep || '',
    cleanliness: habits.cleanliness || '',
    smoking: habits.smoking || '',
    drinking: habits.drinking || '',
    food: habits.food || '',
    noise: habits.noise || '',
    guests: habits.guests || '',
  };
};

const getCompareStatus = (userVal: string, matchVal: string) => {
  if (!userVal || !matchVal) return { icon: AlertTriangle, color: 'text-amber-500' };
  const a = userVal.toLowerCase().trim();
  const b = matchVal.toLowerCase().trim();
  if (a === b) return { icon: CheckCircle, color: 'text-green-500' };
  if (a.includes(b) || b.includes(a)) return { icon: CheckCircle, color: 'text-green-500' };
  return { icon: AlertTriangle, color: 'text-amber-500' };
};

const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 176 176" className="w-36 sm:w-44 h-36 sm:h-44 transform -rotate-90">
        <circle cx="88" cy="88" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="88" cy="88" r={radius}
          fill="none" stroke="url(#scoreGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-slate-800">{score}%</span>
        <span className="text-xs text-amber-600 font-medium">Match</span>
      </div>
    </div>
  );
};

const AIMatchResultsComponent: React.FC<AIMatchResultsPageProps> = ({ match, setView }) => {
  const { user } = useApp();

  if (!match) {
    return (
      <div className="min-h-screen bg-amber-50/30 flex items-center justify-center p-6">
        <div className="bg-white/90 border border-amber-200/20 shadow-glass rounded-2xl p-12 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-amber-100">
              <AlertTriangle className="w-12 h-12 text-amber-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">No Active Match Selected</h2>
          <p className="text-slate-500 mb-6">Please go back and select a match to view detailed results.</p>
          <button
            onClick={() => setView(user?.role === 'finder' ? 'roommates' : 'dashboard-seeker')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const userProfile = parseLifestyle(user);
  const matchProfile = parseLifestyle(match?.profile || match);
  const score = match.score ?? match.matchScore ?? 85;

  const explanation = match.explanation || match.matchExplanation ||
    `Based on your lifestyle preferences, ${match.name || 'this person'} is a strong match for you. Your habits and preferences align well across key areas like cleanliness, sleep schedule, and budget preferences.`;

  const matchName = match.name || 'Your Match';
  const matchAge = match.age || '';
  const matchOccupation = match.occupation || match.profile?.occupation || '';
  const matchBio = match.bio || match.profile?.bio || '';

  return (
    <div className="min-h-screen bg-amber-50/30">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <button
          onClick={() => setView(user?.role === 'finder' ? 'roommates' : 'dashboard-seeker')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-6 group"
        >
          <div className="p-1.5 rounded-lg bg-white/90 border border-amber-200/20 group-hover:border-amber-300/40 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-medium">Back to Dashboard</span>
        </button>

        <div className="bg-white/90 border border-amber-200/20 shadow-glass rounded-2xl p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <ScoreRing score={score} />
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-semibold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-amber-600 to-amber-500">
                  AI Match Analysis
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-amber-600 to-amber-500 mb-4">
                {matchName}
              </h1>
              <p className="text-slate-600 leading-relaxed text-base">{explanation}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white/90 border border-amber-200/20 shadow-glass rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                Side-by-Side Comparison
              </h2>
              <div className="space-y-3">
                {attributeFields.map((attr) => {
                  const userVal = userProfile[attr.key] || 'Not specified';
                  const matchVal = matchProfile[attr.key] || 'Not specified';
                  const { icon: StatusIcon, color } = getCompareStatus(userVal, matchVal);
                  return (
                    <div
                      key={attr.key}
                      className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center p-3.5 rounded-xl bg-amber-50/40 border border-amber-100/40"
                    >
                      <div className="text-right">
                        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">{attr.userLabel}</p>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{userVal}</p>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <StatusIcon className={`w-5 h-5 ${color}`} />
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{attr.label}</span>
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">{attr.matchLabel}</p>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{matchVal}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white/90 border border-amber-200/20 shadow-glass rounded-2xl p-6 sticky top-6">
              <div className="flex flex-col items-center text-center mb-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-3 shadow-lg">
                  <User className="w-9 h-9 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">{matchName}</h3>
                {(matchAge || matchOccupation) && (
                  <p className="text-sm text-slate-500">
                    {[matchAge, matchOccupation].filter(Boolean).join(' \u2022 ')}
                  </p>
                )}
              </div>

              {matchBio && (
                <div className="mb-5 p-3.5 rounded-xl bg-amber-50/40 border border-amber-100/40">
                  <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Bio</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{matchBio}</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-1.5 mb-5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Flame
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(score / 20) ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`}
                  />
                ))}
                <span className="text-xs text-slate-400 ml-1">Compatibility</span>
              </div>

              <button
                onClick={() => setView('chat')}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Sparkles className="w-4 h-4" /> Start Chatting
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AIMatchResultsPage = AIMatchResultsComponent;
