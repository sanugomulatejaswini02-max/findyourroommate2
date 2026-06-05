import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { RoommateCard } from '../components/RoommateCard';
import { PropertyCard } from '../components/PropertyCard';
import { Search, SlidersHorizontal, UserCheck, Sparkles, Home, Heart, X, Compass, AlertCircle } from 'lucide-react';
import { calculateRoommateCompatibility, UserProfile } from '../lib/aiMatching';

interface RoomSeekerDashboardProps {
  setView: (view: string) => void;
  setSelectedProperty: (prop: any) => void;
  setSelectedMatch: (match: any) => void;
}

export const RoomSeekerDashboard: React.FC<RoomSeekerDashboardProps> = ({
  setView,
  setSelectedProperty,
  setSelectedMatch
}) => {
  const { user, properties, sendConnectionRequest, notifications, respondToConnection } = useApp();
  
  // Option check: 'room_only' (Option A) vs 'room_roommate' (Option B)
  let userPrefs: any = {};
  try {
    userPrefs = typeof user?.roommate_prefs === 'string' ? JSON.parse(user.roommate_prefs || '{}') : (user?.roommate_prefs || {});
  } catch (e) {
    console.error(e);
  }

  const isLookingForRoommate = userPrefs.looking_for === 'room_roommate' || user?.role === 'finder';

  // State
  const [activeTab, setActiveTab] = useState<'rooms' | 'roommates'>(isLookingForRoommate ? 'roommates' : 'rooms');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter settings
  const [budgetLimit, setBudgetLimit] = useState(30000);
  const [selectedType, setSelectedType] = useState('any');
  const [selectedGender, setSelectedGender] = useState('any');
  const [selectedFurnish, setSelectedFurnish] = useState('any');

  // Roommate matching states
  const [matches, setMatches] = useState<Array<{ profile: UserProfile; score: number; explanation: string }>>([]);
  const [pendingReqIds, setPendingReqIds] = useState<number[]>([]);
  const [acceptedReqIds, setAcceptedReqIds] = useState<number[]>([]);

  // Load roommate matches on mount for Option B
  useEffect(() => {
    if (isLookingForRoommate && user) {
      loadRoommateMatches();
    }
  }, [user, properties, activeTab]);

  const loadRoommateMatches = async () => {
    if (!user) return;
    try {
      const allUsers = JSON.parse(localStorage.getItem('fyr_users') || '[]');
      const connectionRecords = JSON.parse(localStorage.getItem('fyr_connections') || '[]');
      
      // Filter potential roommates (seekers or finders who are not banned, and not the current user)
      const potentialMatches = allUsers.filter((u: any) => 
        u.id !== user.id && 
        (u.role === 'seeker' || u.role === 'finder') && 
        u.is_banned === 0
      );

      const computedMatches: any[] = [];
      const pending: number[] = [];
      const accepted: number[] = [];

      // Load connection requests
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
        const { score, explanation } = await calculateRoommateCompatibility(user, other);
        computedMatches.push({
          profile: other,
          score,
          explanation
        });
      }

      // Sort by score descending
      computedMatches.sort((a, b) => b.score - a.score);
      setMatches(computedMatches);
    } catch (e) {
      console.error('Error matching roommates:', e);
    }
  };

  const handleConnect = async (receiverId: number) => {
    const success = await sendConnectionRequest(receiverId);
    if (success) {
      setPendingReqIds(prev => [...prev, receiverId]);
    } else {
      alert('Failed to send request');
    }
  };

  const handleViewMatchDetails = (match: any) => {
    setSelectedMatch(match);
    setView('ai-match-details');
  };

  const handleViewPropertyDetails = (prop: any) => {
    setSelectedProperty(prop);
    setView('property-details');
  };

  // Filter Properties list
  const filteredProperties = properties.filter((prop) => {
    const matchesSearch = 
      prop.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      prop.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prop.landmark && prop.landmark.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesBudget = prop.rent <= budgetLimit;
    const matchesType = selectedType === 'any' || prop.type === selectedType;
    const p = prop as any;
    const matchesFurnish = selectedFurnish === 'any' || p.furnished === selectedFurnish;
    const matchesGender = selectedGender === 'any' || p.gender_pref === selectedGender;

    const matchesAvailable = prop.is_available === 1;

    return matchesSearch && matchesBudget && matchesType && matchesAvailable && matchesFurnish && matchesGender;
  });

  // Find incoming connection/match alerts
  const matchAlerts = notifications.filter(n => n.type === 'match' && n.is_read === 0);

  return (
    <div className="min-h-screen bg-amber-50/30 text-slate-800 py-10 max-w-7xl mx-auto w-[92%]">
      
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-amber-600 to-amber-500">
          Find Your Perfect Match
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Currently configured for: <span className="font-extrabold text-amber-500 uppercase">{isLookingForRoommate ? 'Room + Roommate (Option B)' : 'Room Only (Option A)'}</span>
        </p>
      </div>

      {/* Live Roommate Alert Banner */}
      {isLookingForRoommate && matchAlerts.length > 0 && (
        <div className="mb-8 p-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-float border border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm">{matchAlerts[0].title}</h4>
              <p className="text-xs text-slate-200 leading-normal mt-0.5">{matchAlerts[0].message}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const meta = matchAlerts[0].metadata;
                setView('roommates');
                setActiveTab('roommates');
              }}
              className="px-4 py-2 bg-amber-400 text-white font-extrabold text-xs rounded-xl shadow-md"
            >
              Review Compatibility
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs (Only show if Option B) */}
      {isLookingForRoommate && (
        <div className="flex gap-2 border-b border-slate-200 pb-px mb-8">
          <button
            onClick={() => setActiveTab('roommates')}
            className={`pb-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'roommates' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <UserCheck className="w-4 h-4" />
            Compatible Roommates
          </button>
          
          <button
            onClick={() => setActiveTab('rooms')}
            className={`pb-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'rooms' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <Home className="w-4 h-4" />
            Browse Available Rooms
          </button>
        </div>
      )}

      {/* Tab: ROOMS (Property Grid) */}
      {(activeTab === 'rooms' || !isLookingForRoommate) && (
        <div className="space-y-6">
          
          {/* Search Bar & Filters Trigger */}
          <div className="flex gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rooms by locality, city, landmarks, or title..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-amber-200/70 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-800"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 border rounded-2xl flex items-center gap-1 sm:gap-2 text-xs font-bold transition-all shrink-0 ${showFilters ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-200/70 text-slate-700'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {/* Advanced Filter drawer */}
          {showFilters && (
            <div className="bg-white/90 border border-amber-200/30 p-5 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-6 animate-float">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Max Budget: ₹{budgetLimit.toLocaleString()}</label>
                <input 
                  type="range" 
                  min={5000} 
                  max={50000} 
                  step={1000}
                  value={budgetLimit} 
                  onChange={(e) => setBudgetLimit(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Property Type</label>
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs"
                >
                  <option value="any">Any Type</option>
                  <option value="1BHK">1BHK</option>
                  <option value="2BHK">2BHK</option>
                  <option value="PG">PG</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Shared Apartment">Shared Apartment</option>
                  <option value="Independent Room">Independent Room</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Furnishing</label>
                <select 
                  value={selectedFurnish}
                  onChange={(e) => setSelectedFurnish(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs"
                >
                  <option value="any">No Preference</option>
                  <option value="furnished">Furnished Only</option>
                  <option value="unfurnished">Unfurnished Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Gender Restriction</label>
                <select 
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs"
                >
                  <option value="any">No Restriction</option>
                  <option value="male">Male Only</option>
                  <option value="female">Female Only</option>
                </select>
              </div>
            </div>
          )}

          {/* Properties list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.length === 0 ? (
              <div className="col-span-full glass-panel p-12 text-center text-slate-400 rounded-3xl">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold">No properties match your active search terms.</p>
                <p className="text-xs text-slate-400 mt-1">Try expanding your budget slider or searching in a different locality.</p>
              </div>
            ) : (
              filteredProperties.map((prop) => (
                <PropertyCard 
                  key={prop.id}
                  property={prop}
                  onClick={() => handleViewPropertyDetails(prop)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: ROOMMATES (Bumble Compatibility swipe) */}
      {activeTab === 'roommates' && isLookingForRoommate && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.length === 0 ? (
              <div className="col-span-full glass-panel p-12 text-center text-slate-400 rounded-3xl">
                <p className="text-sm font-semibold">No roommate profiles found in the database.</p>
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
                  onViewDetails={() => handleViewMatchDetails(match)}
                />
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
