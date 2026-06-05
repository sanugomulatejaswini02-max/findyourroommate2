import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { RoommateCard } from '../components/RoommateCard';
import { UserCheck, Sparkles, Filter, AlertCircle, Compass } from 'lucide-react';
import { calculateRoommateCompatibility, UserProfile } from '../lib/aiMatching';

interface RoommateFinderDashboardProps {
  setView: (view: string) => void;
  setSelectedMatch: (match: any) => void;
}

export const RoommateFinderDashboard: React.FC<RoommateFinderDashboardProps> = ({
  setView,
  setSelectedMatch
}) => {
  const { user, sendConnectionRequest, notifications, respondToConnection } = useApp();
  
  const [searchArea, setSearchArea] = useState('');
  const [budgetLimit, setBudgetLimit] = useState(30000);
  const [selectedGender, setSelectedGender] = useState('any');
  
  const [matches, setMatches] = useState<Array<{ profile: UserProfile; score: number; explanation: string }>>([]);
  const [pendingReqIds, setPendingReqIds] = useState<number[]>([]);
  const [acceptedReqIds, setAcceptedReqIds] = useState<number[]>([]);

  useEffect(() => {
    if (user) {
      loadRoommateMatches();
    }
  }, [user, searchArea, budgetLimit, selectedGender]);

  const loadRoommateMatches = async () => {
    if (!user) return;
    try {
      const allUsers = JSON.parse(localStorage.getItem('fyr_users') || '[]');
      const connectionRecords = JSON.parse(localStorage.getItem('fyr_connections') || '[]');
      
      // Filter potential roommates (seekers or finders who are not banned and not the current user)
      const potentialMatches = allUsers.filter((u: any) => 
        u.id !== user.id && 
        (u.role === 'seeker' || u.role === 'finder') && 
        u.is_banned === 0
      );

      const computedMatches: any[] = [];
      const pending: number[] = [];
      const accepted: number[] = [];

      connectionRecords.forEach((c: any) => {
        if (c.sender_id === user.id && c.status === 'pending') {
          pending.push(c.receiver_id);
        } else if (c.receiver_id === user.id && c.status === 'pending') {
          pending.push(c.sender_id);
        }

        if ((c.sender_id === user.id || c.receiver_id === user.id) && c.status === 'accepted') {
          accepted.push(c.sender_id === user.id ? c.receiver_id : c.sender_id);
        }
      });

      setPendingReqIds(pending);
      setAcceptedReqIds(accepted);

      for (const other of potentialMatches) {
        // Apply frontend filter before AI scoring to save compute cycles
        if (searchArea && !other.preferred_area?.toLowerCase().includes(searchArea.toLowerCase())) continue;
        if (other.budget && other.budget > budgetLimit) continue;
        if (selectedGender !== 'any' && other.gender !== selectedGender) continue;

        const { score, explanation } = await calculateRoommateCompatibility(user, other);
        computedMatches.push({
          profile: other,
          score,
          explanation
        });
      }

      // Sort by score
      computedMatches.sort((a, b) => b.score - a.score);
      setMatches(computedMatches);
    } catch (e) {
      console.error(e);
    }
  };

  const handleConnect = async (receiverId: number) => {
    const success = await sendConnectionRequest(receiverId);
    if (success) {
      setPendingReqIds(prev => [...prev, receiverId]);
    }
  };

  const handleViewDetails = (match: any) => {
    setSelectedMatch(match);
    setView('ai-match-details');
  };

  // Connection request alerts
  const connectionAlerts = notifications.filter(n => n.type === 'connection' && n.is_read === 0);

  return (
    <div className="min-h-screen bg-amber-50/30  text-slate-800  py-10 max-w-7xl mx-auto w-[92%]">
      
      {/* Title */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-amber-600 to-amber-500   ">
          Roommate Finder Dashboard
        </h2>
        <p className="text-xs text-slate-400  mt-1">Hello, {user?.name}. Complete your profile details to improve compatibility scores.</p>
      </div>

      {/* Connection Invites banner */}
      {connectionAlerts.length > 0 && (
        <div className="mb-8 p-4 bg-white border border-amber-200/60 rounded-3xl shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-600   rounded-xl flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-800">Connection Request</h4>
              <p className="text-xs text-slate-400 mt-0.5">{connectionAlerts[0].message}</p>
            </div>
          </div>
          <button 
            onClick={() => setView('chat')}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-sm"
          >
            Review Invites
          </button>
        </div>
      )}

      {/* Filter panel */}
      <div className="glass-panel bg-white/90 border border-amber-200/20 shadow-glass p-5 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 items-center">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Search Locality</label>
          <input 
            type="text" 
            value={searchArea}
            onChange={(e) => setSearchArea(e.target.value)}
            placeholder="e.g. Koramangala"
            className="w-full px-3 py-2 bg-white border border-amber-200/70 focus:ring-amber-500/50 rounded-xl text-xs"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Max Budget: ₹{budgetLimit.toLocaleString()}</label>
          <input 
            type="range" 
            min={5000} 
            max={50000} 
            step={1000}
            value={budgetLimit} 
            onChange={(e) => setBudgetLimit(Number(e.target.value))}
            className="w-full h-1.5 bg-amber-200/30 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Gender Preference</label>
          <select 
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="w-full px-3 py-2 bg-white border-amber-200 rounded-xl text-xs"
          >
            <option value="any">Any Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 pt-4 text-xs font-bold text-amber-500">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          Sorted by AI Match Score
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.length === 0 ? (
          <div className="col-span-full glass-panel bg-white/90 border border-amber-200/20 shadow-glass p-12 text-center text-slate-400 rounded-3xl">
            <AlertCircle className="w-12 h-12 text-slate-300  mx-auto mb-3" />
            <p className="text-sm font-semibold">No roommate profiles match your criteria.</p>
            <p className="text-xs text-slate-400 mt-1">Try expanding your budget search range or typing a wider locality.</p>
          </div>
        ) : (
          matches.map((match) => (
            <RoommateCard 
              key={match.profile.id}
              profile={match.profile}
              compatibilityScore={match.score}
              explanation={match.explanation}
              isPending={pendingReqIds.includes(match.profile.id)}
              isAccepted={acceptedReqIds.includes(match.profile.id)}
              onConnect={() => handleConnect(match.profile.id)}
              onViewDetails={() => handleViewDetails(match)}
            />
          ))
        )}
      </div>

    </div>
  );
};
