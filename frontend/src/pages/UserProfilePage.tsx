import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { compressImage } from '../utils/compressImage';
import { User, Check, Edit2, ShieldCheck, Save, Sparkles, Upload } from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { user, updateProfile } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age || 21);
  const [gender, setGender] = useState(user?.gender || 'male');
  const [occupation, setOccupation] = useState(user?.occupation || '');
  const [collegeCompany, setCollegeCompany] = useState(user?.college_company || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [city, setCity] = useState(user?.city || 'Bengaluru');
  const [area, setArea] = useState(user?.preferred_area || '');
  const [budget, setBudget] = useState(user?.budget || 12000);
  const [profilePic, setProfilePic] = useState(user?.profile_pic || '');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
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

  let userHabits: any = {};
  try {
    userHabits = typeof user?.lifestyle_habits === 'string'
      ? JSON.parse(user.lifestyle_habits || '{}')
      : (user?.lifestyle_habits || {});
  } catch (_) {}

  const [sleep, setSleep] = useState<'early' | 'night'>(userHabits.sleep || 'early');
  const [cleanliness, setCleanliness] = useState<'high' | 'medium' | 'low'>(userHabits.cleanliness || 'medium');
  const [smoking, setSmoking] = useState<'no' | 'outside' | 'yes'>(userHabits.smoking || 'no');
  const [drinking, setDrinking] = useState<'no' | 'outside' | 'yes'>(userHabits.drinking || 'no');
  const [food, setFood] = useState<'veg' | 'non-veg' | 'any'>(userHabits.food || 'any');
  const [noise, setNoise] = useState<'low' | 'medium' | 'high'>(userHabits.noise || 'medium');
  const [guests, setGuests] = useState<'no' | 'weekends' | 'anytime'>(userHabits.guests || 'weekends');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Name cannot be empty!');
      return;
    }
    setLoading(true);
    setSuccessMsg('');

    const habitsObj = { sleep, cleanliness, smoking, drinking, food, noise, guests };

    const success = await updateProfile({
      name,
      age,
      gender,
      occupation,
      college_company: collegeCompany,
      bio,
      city,
      preferred_area: area,
      budget,
      profile_pic: profilePic || undefined,
      lifestyle_habits: habitsObj,
    });

    setLoading(false);
    if (success) {
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      alert('Failed to save profile details.');
    }
  };

  const isSeekerOrFinder = user?.role === 'seeker' || user?.role === 'finder';

  return (
    <div className="min-h-screen bg-amber-50/30 text-slate-800 py-10 max-w-4xl mx-auto w-[92%]">

      <div className="mb-8">
        <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-amber-600 to-amber-500">
          Profile Settings
        </h2>
        <p className="text-xs text-slate-400 mt-1">Update your personal profile, lifestyle preferences, and profile picture.</p>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-sm">
          <Check className="w-4.5 h-4.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        <div className="bg-white/90 border border-amber-200/20 shadow-glass p-6 rounded-3xl flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <img
              src={profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
              alt={name}
              className="w-28 h-28 rounded-3xl object-cover ring-4 ring-amber-500/20 shadow-md"
            />
          </div>

          <div className="w-full">
            <label className="block text-[10px] font-bold text-slate-400 uppercase text-left mb-1.5">Profile Picture</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-white hover:file:bg-amber-600 file:cursor-pointer cursor-pointer"
            />
          </div>

          <div className="w-full border-t border-slate-100 pt-4 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600">
            <ShieldCheck className="w-4 h-4" />
            <span>Account Verified</span>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">

          <div className="bg-white/90 border border-amber-200/20 shadow-glass p-6 rounded-3xl space-y-4">
            <h3 className="font-extrabold text-base border-b border-slate-100 pb-3">1. Personal Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-xs focus:ring-1 focus:ring-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border-amber-200 rounded-xl text-xs"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Occupation</label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">College / Company</label>
                <input
                  type="text"
                  value={collegeCompany}
                  onChange={(e) => setCollegeCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-xs"
              />
            </div>

            {isSeekerOrFinder && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Preferred Area</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Max Monthly Budget (₹)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">About Me / Short Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-xs focus:outline-none"
              />
            </div>
          </div>

          {isSeekerOrFinder && (
            <div className="bg-white/90 border border-amber-200/20 shadow-glass p-6 rounded-3xl space-y-4">
              <h3 className="font-extrabold text-base border-b border-slate-100 pb-3 flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-amber-500" />
                2. Match Preferences
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Sleeping Schedule</label>
                  <select
                    value={sleep}
                    onChange={(e) => setSleep(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border-amber-200 rounded-xl text-xs"
                  >
                    <option value="early">Early Riser</option>
                    <option value="night">Night Owl</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Cleanliness Level</label>
                  <select
                    value={cleanliness}
                    onChange={(e) => setCleanliness(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border-amber-200 rounded-xl text-xs"
                  >
                    <option value="high">High (Tidy)</option>
                    <option value="medium">Medium (Moderate)</option>
                    <option value="low">Low (Relaxed)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Smoking Policy</label>
                  <select
                    value={smoking}
                    onChange={(e) => setSmoking(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border-amber-200 rounded-xl text-xs"
                  >
                    <option value="no">Non-smoker</option>
                    <option value="outside">Only Outside</option>
                    <option value="yes">Smoker ok</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Drinking</label>
                  <select
                    value={drinking}
                    onChange={(e) => setDrinking(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border-amber-200 rounded-xl text-xs"
                  >
                    <option value="no">No Alcohol</option>
                    <option value="outside">Occasionally</option>
                    <option value="yes">Social drinker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Food Type</label>
                  <select
                    value={food}
                    onChange={(e) => setFood(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border-amber-200 rounded-xl text-xs"
                  >
                    <option value="any">Anything Goes</option>
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Noise Tolerance</label>
                  <select
                    value={noise}
                    onChange={(e) => setNoise(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border-amber-200 rounded-xl text-xs"
                  >
                    <option value="low">Quiet preferred</option>
                    <option value="medium">Moderate sound ok</option>
                    <option value="high">Loud sounds ok</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Guest Policy</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border-amber-200 rounded-xl text-xs"
                  >
                    <option value="no">No overnight guests</option>
                    <option value="weekends">Weekends only</option>
                    <option value="anytime">Open policy</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-700 hover:opacity-95 text-white font-extrabold rounded-2xl shadow-md flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </div>

      </form>

    </div>
  );
};
