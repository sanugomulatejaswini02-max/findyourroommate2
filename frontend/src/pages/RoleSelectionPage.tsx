import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Home, Users, Search, ArrowRight, ArrowLeft, Send } from 'lucide-react';

interface RoleSelectionPageProps {
  setView: (view: string) => void;
}

export const RoleSelectionPage: React.FC<RoleSelectionPageProps> = ({ setView }) => {
  const { user, updateProfile } = useApp();
  
  // Steps: 0 = Choose A vs B, 1 = Form A (Room Only), 2 = Form B (Room + Roommate)
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [loading, setLoading] = useState(false);

  // Form A state
  const [prefArea, setPrefArea] = useState('');
  const [prefBudget, setPrefBudget] = useState(15000);
  const [prefPropType, setPrefPropType] = useState('Shared Apartment');
  const [prefGender, setPrefGender] = useState('any');
  const [prefFurnished, setPrefFurnished] = useState('any');

  // Form B state
  const [age, setAge] = useState(21);
  const [gender, setGender] = useState('male');
  const [occupation, setOccupation] = useState('');
  const [collegeCompany, setCollegeCompany] = useState('');
  const [bio, setBio] = useState('');
  
  const [sleep, setSleep] = useState<'early' | 'night'>('early');
  const [cleanliness, setCleanliness] = useState<'high' | 'medium' | 'low'>('medium');
  const [smoking, setSmoking] = useState<'no' | 'outside' | 'yes'>('no');
  const [drinking, setDrinking] = useState<'no' | 'outside' | 'yes'>('no');
  const [food, setFood] = useState<'veg' | 'non-veg' | 'any'>('any');
  const [noise, setNoise] = useState<'low' | 'medium' | 'high'>('medium');
  const [guests, setGuests] = useState<'no' | 'weekends' | 'anytime'>('weekends');
  const [work, setWork] = useState<'day' | 'night' | 'flexible'>('day');
  const [study, setStudy] = useState<'regular' | 'flexible'>('regular');

  const handleFormASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefArea) {
      alert('Please fill in preferred area');
      return;
    }
    setLoading(true);
    
    // Save preferences inside roommate_prefs or as user attributes
    const success = await updateProfile({
      city: 'Bengaluru',
      preferred_area: prefArea,
      budget: prefBudget,
      roommate_prefs: JSON.stringify({
        property_type: prefPropType,
        gender_preference: prefGender,
        furnished_preference: prefFurnished,
        looking_for: 'room_only'
      })
    });

    setLoading(false);
    if (success) {
      setView('dashboard-seeker');
    } else {
      alert('Failed to save preferences. Please try again.');
    }
  };

  const handleFormBSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefArea || !occupation) {
      alert('Please fill in preferred area and occupation');
      return;
    }
    setLoading(true);

    const habitsObj = {
      sleep,
      cleanliness,
      smoking,
      drinking,
      food,
      noise,
      guests,
      work,
      study
    };

    const success = await updateProfile({
      age,
      gender,
      occupation,
      college_company: collegeCompany,
      bio,
      city: 'Bengaluru',
      preferred_area: prefArea,
      budget: prefBudget,
      lifestyle_habits: habitsObj,
      roommate_prefs: JSON.stringify({
        gender: gender === 'male' ? 'male' : gender === 'female' ? 'female' : 'any',
        looking_for: 'room_roommate'
      })
    });

    setLoading(false);
    if (success) {
      setView('dashboard-seeker');
    } else {
      alert('Failed to save preferences. Please try again.');
    }
  };

  return (
    <div className="min-h-[90vh] bg-amber-50/30 text-slate-800 py-12 flex items-center justify-center p-6">
      
      {step === 0 && (
        /* STEP 0: Selection Screen */
        <div className="max-w-3xl w-full text-center space-y-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-amber-600 to-amber-500">
              Tell us what you're looking for
            </h2>
            <p className="text-xs sm:text-sm text-slate-405 mt-2">
              Help us tailor your search experience by choosing your room hunt option.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Option A: Room Only */}
            <div 
              onClick={() => setStep(1)}
              className="group glass-panel p-8 rounded-[30px] border-2 border-amber-200/50 hover:border-amber-500 hover:shadow-xl cursor-pointer text-left flex flex-col justify-between h-80 hover:-translate-y-1 transition-all"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-6">
                  <Home className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-extrabold text-xl text-slate-800 group-hover:text-amber-600">
                  Option A: Room Only
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-3">
                  I just want to find a room, PG, flat, or hostel to move into. I don't need roommate matchmaking features.
                </p>
              </div>
              
              <div className="mt-8 flex items-center gap-1 text-xs font-bold text-amber-600">
                Configure preferences <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Option B: Room + Roommate */}
            <div 
              onClick={() => setStep(2)}
              className="group glass-panel p-8 rounded-[30px] border-2 border-amber-200/50 hover:border-amber-500 hover:shadow-xl cursor-pointer text-left flex flex-col justify-between h-80 hover:-translate-y-1 transition-all"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-extrabold text-xl text-slate-800 group-hover:text-amber-600">
                  Option B: Room + Roommate
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-3">
                  I want to team up with compatible roommates who share my budget, sleep schedule, and lifestyle habits.
                </p>
              </div>
              
              <div className="mt-8 flex items-center gap-1 text-xs font-bold text-amber-600">
                Complete matching profile <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        /* STEP 1: FORM A (Room Only) */
        <div className="max-w-xl w-full bg-white border border-amber-200/60 rounded-3xl p-8 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => setStep(0)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h3 className="font-bold text-slate-800 text-lg">Room Only Preferences</h3>
          </div>

          <form onSubmit={handleFormASubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Preferred Area / Suburb
              </label>
              <input
                type="text"
                required
                value={prefArea}
                onChange={(e) => setPrefArea(e.target.value)}
                placeholder="e.g. Koramangala, Indiranagar"
                className="w-full px-4 py-3 bg-white border border-amber-200/70 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Max Monthly Budget (₹)
                </label>
                <input
                  type="number"
                  required
                  value={prefBudget}
                  onChange={(e) => setPrefBudget(Number(e.target.value))}
                  placeholder="15000"
                  className="w-full px-4 py-3 bg-white border border-amber-200/70 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Property Type
                </label>
                <select
                  value={prefPropType}
                  onChange={(e) => setPrefPropType(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-amber-200/70 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-800"
                >
                  <option value="1BHK">1BHK</option>
                  <option value="2BHK">2BHK</option>
                  <option value="PG">PG</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Shared Apartment">Shared Apartment</option>
                  <option value="Independent Room">Independent Room</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Gender Preference
                </label>
                <select
                  value={prefGender}
                  onChange={(e) => setPrefGender(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-amber-200/70 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-800"
                >
                  <option value="any">No Preference</option>
                  <option value="male">Male Only</option>
                  <option value="female">Female Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Furnished Preference
                </label>
                <select
                  value={prefFurnished}
                  onChange={(e) => setPrefFurnished(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-amber-200/70 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-800"
                >
                  <option value="any">Anything Goes</option>
                  <option value="furnished">Furnished Only</option>
                  <option value="unfurnished">Unfurnished Only</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-700 hover:opacity-95 text-white font-extrabold rounded-2xl shadow-md transform active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Saving...' : 'Search Properties'}
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {step === 2 && (
        /* STEP 2: FORM B (Room + Roommate Profile Match) */
        <div className="max-w-2xl w-full bg-white border border-amber-200/60 rounded-3xl p-8 shadow-xl max-h-[85vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => setStep(0)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h3 className="font-bold text-slate-800 text-lg">Detailed Match Profile</h3>
          </div>

          <form onSubmit={handleFormBSubmit} className="space-y-6">
            
            {/* Bio & Demographics */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-xs text-amber-600 uppercase tracking-wider">1. Basic Information</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Age</label>
                  <input 
                    type="number" 
                    value={age} 
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Gender</label>
                  <select 
                    value={gender} 
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-sm"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Budget (₹)</label>
                  <input 
                    type="number" 
                    value={prefBudget} 
                    onChange={(e) => setPrefBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Occupation</label>
                  <input 
                    type="text" 
                    required 
                    value={occupation} 
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. Student, UX Designer"
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">College / Company</label>
                  <input 
                    type="text" 
                    value={collegeCompany} 
                    onChange={(e) => setCollegeCompany(e.target.value)}
                    placeholder="e.g. NIFT, Google"
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase font-semibold">Preferred Area</label>
                <input 
                  type="text" 
                  required
                  value={prefArea} 
                  onChange={(e) => setPrefArea(e.target.value)}
                  placeholder="e.g. Koramangala, HSR Layout"
                  className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Short Bio</label>
                <textarea 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Write a few lines about yourself..."
                  className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Lifestyle habits questionnaire */}
            <div className="space-y-4 pt-4 border-t border-amber-100">
              <h4 className="font-extrabold text-xs text-amber-600 uppercase tracking-wider">2. Lifestyle Habits</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Sleeping Schedule</label>
                  <select 
                    value={sleep} 
                    onChange={(e) => setSleep(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs"
                  >
                    <option value="early">Early Riser (sleep/wake early)</option>
                    <option value="night">Night Owl (late nights)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Cleanliness Standard</label>
                  <select 
                    value={cleanliness} 
                    onChange={(e) => setCleanliness(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs"
                  >
                    <option value="high">High (extremely tidy, clean daily)</option>
                    <option value="medium">Medium (reasonable cleanliness)</option>
                    <option value="low">Low (relaxed/unorganized)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Smoking</label>
                  <select 
                    value={smoking} 
                    onChange={(e) => setSmoking(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs"
                  >
                    <option value="no">Non-smoker</option>
                    <option value="outside">Only Outside</option>
                    <option value="yes">Regular Smoker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Drinking</label>
                  <select 
                    value={drinking} 
                    onChange={(e) => setDrinking(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs"
                  >
                    <option value="no">No Alcohol</option>
                    <option value="outside">Occasionally/Outside</option>
                    <option value="yes">Social Drinker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Food Preference</label>
                  <select 
                    value={food} 
                    onChange={(e) => setFood(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs"
                  >
                    <option value="any">Anything Goes</option>
                    <option value="veg">Strict Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Noise Tolerance</label>
                  <select 
                    value={noise} 
                    onChange={(e) => setNoise(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs"
                  >
                    <option value="low">Low (prefers absolute silence)</option>
                    <option value="medium">Medium (moderate sounds)</option>
                    <option value="high">High (loud TV, music ok)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Guests Policy</label>
                  <select 
                    value={guests} 
                    onChange={(e) => setGuests(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs"
                  >
                    <option value="no">No Overnight Guests</option>
                    <option value="weekends">Weekends Only</option>
                    <option value="anytime">Anytime / Open</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-700 hover:opacity-95 text-white font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? 'Analyzing matches...' : 'Find Compatible Roommates'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
