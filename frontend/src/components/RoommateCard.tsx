import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, MapPin, User, Compass, Zap } from 'lucide-react';
import { UserProfile } from '../lib/aiMatching';

interface RoommateCardProps {
  profile: UserProfile;
  compatibilityScore: number;
  explanation: string;
  onConnect: () => void;
  onViewDetails: () => void;
  isPending: boolean;
  isAccepted: boolean;
}

export const RoommateCard: React.FC<RoommateCardProps> = ({
  profile,
  compatibilityScore,
  explanation,
  onConnect,
  onViewDetails,
  isPending,
  isAccepted
}) => {
  const { user } = useApp();

  let habits: any = {};
  try {
    habits = typeof profile.lifestyle_habits === 'string' ? JSON.parse(profile.lifestyle_habits || '{}') : (profile.lifestyle_habits || {});
  } catch (e) {
    console.error(e);
  }

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'from-amber-400 to-amber-500 text-amber-50';
    if (score >= 70) return 'from-amber-500 to-amber-600 text-amber-50';
    return 'from-amber-600 to-amber-700 text-amber-50';
  };

  return (
    <div className="relative flex flex-col bg-white border border-amber-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Profile Pic Header */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <img
          src={profile.profile_pic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250'}
          alt={profile.name}
          className="w-full h-full object-cover"
        />

        {/* Dynamic Compatibility Score Overlay */}
        <div className={`absolute top-4 right-4 bg-gradient-to-r ${getScoreColor(compatibilityScore)} font-extrabold text-sm py-2 px-3.5 rounded-2xl shadow-lg flex items-center gap-1.5 glow-primary`}>
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>{compatibilityScore}% Match</span>
        </div>

        {/* Basic Name details */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent p-5 text-white">
          <h3 className="font-extrabold text-xl leading-tight flex items-baseline gap-2">
            {profile.name}
            {profile.age && <span className="font-medium text-slate-300 text-base">{profile.age}</span>}
          </h3>
          <p className="text-xs text-slate-200 truncate mt-1">
            {profile.occupation} {profile.college_company ? `@ ${profile.college_company}` : ''}
          </p>
        </div>
      </div>

      {/* Profile Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location details */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-3">
            <MapPin className="w-4 h-4 text-amber-500" />
            <span>Prefers {profile.preferred_area || 'Koramangala'}, {profile.city || 'Bengaluru'}</span>
          </div>

          {/* Budget */}
          {profile.budget && profile.budget > 0 && (
            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 font-bold text-xs py-1 px-3 rounded-lg mb-3">
              Budget: ₹{profile.budget.toLocaleString('en-IN')} / mo
            </div>
          )}

          {/* Lifestyle Badge List */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {habits.sleep && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-amber-50 text-amber-600 border border-amber-100/50 capitalize">
                {habits.sleep === 'early' ? '🌅 Early Riser' : '🌙 Night Owl'}
              </span>
            )}
            {habits.cleanliness && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-amber-50 text-amber-600 border border-amber-100/50 capitalize">
                ✨ {habits.cleanliness} Clean
              </span>
            )}
            {habits.smoking && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-amber-50 text-amber-600 border border-amber-100/50 capitalize">
                🚭 Smoke: {habits.smoking}
              </span>
            )}
            {habits.food && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-amber-50 text-amber-600 border border-amber-100/50 capitalize">
                🥦 Food: {habits.food}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed italic mb-4">
            "{profile.bio || 'No bio provided.'}"
          </p>

          <div className="p-3 bg-amber-50/50 border border-amber-100/50 rounded-2xl mb-4">
            <p className="text-[11px] text-amber-700 font-medium leading-relaxed flex items-start gap-1">
              <Compass className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{explanation}</span>
            </p>
          </div>
        </div>

        {/* Buttons Action Group */}
        <div className="flex gap-2 border-t border-slate-100 pt-4 mt-auto">
          <button
            onClick={onViewDetails}
            className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            AI Details
          </button>
          
          {isAccepted ? (
            <button
              disabled
              className="flex-1 px-3 py-2 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl cursor-default"
            >
              Connected
            </button>
          ) : isPending ? (
            <button
              disabled
              className="flex-1 px-3 py-2 bg-slate-50 text-slate-400 font-bold text-xs rounded-xl cursor-default"
            >
              Pending
            </button>
          ) : (
            <button
              onClick={onConnect}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-700 text-white font-bold text-xs rounded-xl hover:opacity-90 transform active:scale-95 transition-all duration-200"
            >
              Connect
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
