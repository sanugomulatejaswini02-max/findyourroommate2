import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { compressImage } from '../utils/compressImage';
import { Plus, Trash2, Edit3, Eye, Heart, MessageSquare, Check, X, Calendar, PlusCircle, Upload, XCircle } from 'lucide-react';

interface PropertyOwnerDashboardProps {
  setView: (view: string) => void;
}

export const PropertyOwnerDashboard: React.FC<PropertyOwnerDashboardProps> = ({ setView }) => {
  const { user, properties, addProperty, updateProperty, deleteProperty, chats, wishlist, selectChat } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProp, setEditingProp] = useState<any>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState('1BHK');
  const [rent, setRent] = useState(12000);
  const [deposit, setDeposit] = useState(30000);
  const [location, setLocation] = useState('');
  const [landmark, setLandmark] = useState('');
  const [description, setDescription] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [rooms, setRooms] = useState(1);
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [amenities, setAmenities] = useState<string[]>([]);

  const handlePhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const compressed = await Promise.all(
      Array.from(files).map(f => compressImage(f, 1200, 0.7))
    );
    setPhotos(prev => [...prev, ...compressed]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Filter properties belonging to this owner
  const myProperties = properties.filter(p => p.owner_id === user?.id);

  // Compute analytics
  const totalViews = myProperties.reduce((sum, p) => sum + p.views, 0);
  
  // Simulated interest count: chats or wishlists relating to owner's properties
  const myPropIds = myProperties.map(p => p.id);
  const totalSaves = myProperties.reduce((sum, p) => {
    // In mock, read wishlists count directly
    const wishListRecords = JSON.parse(localStorage.getItem('fyr_wishlists') || '[]');
    const savesForThisProp = wishListRecords.filter((w: any) => w.property_id === p.id).length;
    return sum + savesForThisProp;
  }, 0);

  // Interested users count
  const interestedUsersCount = myProperties.reduce((sum, p) => {
    const notifs = JSON.parse(localStorage.getItem('fyr_notifications') || '[]');
    const matches = notifs.filter((n: any) => n.user_id === user?.id && n.metadata && JSON.parse(n.metadata || '{}').propertyId === p.id);
    return sum + matches.length;
  }, 0) + chats.length;

  const handleAmenitiesChange = (amenity: string) => {
    if (amenities.includes(amenity)) {
      setAmenities(prev => prev.filter(a => a !== amenity));
    } else {
      setAmenities(prev => [...prev, amenity]);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location) {
      alert('Please fill in title and location!');
      return;
    }

    const finalPhotos = photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600'];

    const success = await addProperty({
      title,
      type,
      rent,
      deposit,
      location,
      landmark,
      description,
      amenities,
      available_from: availableFrom || new Date().toISOString().split('T')[0],
      rooms,
      photos: finalPhotos
    });

    if (success) {
      setShowAddModal(false);
      resetForm();
    } else {
      alert('Failed to add listing!');
    }
  };

  const handleEditOpen = (prop: any) => {
    setEditingProp(prop);
    setTitle(prop.title);
    setType(prop.type);
    setRent(prop.rent);
    setDeposit(prop.deposit);
    setLocation(prop.location);
    setLandmark(prop.landmark || '');
    setDescription(prop.description || '');
    setAvailableFrom(prop.available_from);
    setRooms(prop.rooms);
    setAmenities(prop.amenities || []);
    setPhotos(prop.photos || []);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProp) return;

    const finalPhotos = photos.length > 0 ? photos : editingProp.photos;

    const success = await updateProperty(editingProp.id, {
      title,
      type,
      rent,
      deposit,
      location,
      landmark,
      description,
      amenities,
      available_from: availableFrom,
      rooms,
      photos: finalPhotos
    });

    if (success) {
      setShowEditModal(false);
      setEditingProp(null);
      resetForm();
    } else {
      alert('Failed to update listing!');
    }
  };

  const resetForm = () => {
    setTitle('');
    setType('1BHK');
    setRent(12000);
    setDeposit(30000);
    setLocation('');
    setLandmark('');
    setDescription('');
    setAvailableFrom('');
    setRooms(1);
    setPhotos([]);
    setAmenities([]);
  };

  const handleToggleAvailable = async (propertyId: number, currentAvailable: number) => {
    await updateProperty(propertyId, {
      is_available: currentAvailable === 1 ? 0 : 1
    });
  };

  const handleOpenChat = (chatId: number) => {
    selectChat(chatId);
    setView('chat');
  };

  const allAmenitiesOptions = ['WiFi', 'Parking', 'AC', 'Furnished', 'Kitchen', 'Laundry', 'Security'];

  return (
    <div className="min-h-screen bg-amber-50/30 text-slate-800 py-10 max-w-7xl mx-auto w-[92%]">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-amber-600 to-amber-500">
            Owner Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">Hello, {user?.name}. Manage your listings and track seeker interest.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-700 text-white font-extrabold rounded-2xl shadow-md hover:shadow-amber-500/20 transform active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Property
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white/90 border border-amber-200/20 p-6 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Views</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1.5">{totalViews}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-500">
            <Eye className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white/90 border border-amber-200/20 p-6 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Shortlisted Saves</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1.5">{totalSaves}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-500">
            <Heart className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white/90 border border-amber-200/20 p-6 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Interested Users</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1.5">{interestedUsersCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-500">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Properties Management section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Listings List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-extrabold text-xl">My Listings ({myProperties.length})</h3>
          
          {myProperties.length === 0 ? (
            <div className="bg-white/90 border border-amber-200/20 p-10 rounded-3xl text-center text-slate-400">
              <p className="text-sm font-semibold">You haven't listed any properties yet.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 text-xs font-bold text-amber-500 hover:underline flex items-center gap-1 mx-auto"
              >
                Create your first listing <PlusCircle className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myProperties.map((prop) => (
                <div 
                  key={prop.id}
                  className="bg-white border border-amber-200/20 p-5 rounded-3xl flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4 items-center min-w-0">
                    <img 
                      src={prop.photos?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=150'} 
                      alt={prop.title}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-600 uppercase">
                          {prop.type}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${prop.is_available === 1 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                          {prop.is_available === 1 ? 'Available' : 'Occupied'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-800 truncate mt-1.5">{prop.title}</h4>
                      <p className="text-xs text-slate-400 truncate">{prop.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end sm:justify-start border-t sm:border-t-0 pt-3 sm:pt-0 border-amber-100/50">
                    <div className="text-right mr-3 hidden sm:block">
                      <p className="text-xs font-extrabold text-slate-800">₹{prop.rent.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400">Views: {prop.views}</p>
                    </div>

                    <button
                      onClick={() => handleToggleAvailable(prop.id, prop.is_available)}
                      className={`p-2.5 rounded-xl border transition-all ${prop.is_available === 1 ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
                      title={prop.is_available === 1 ? 'Mark as Occupied' : 'Mark as Available'}
                    >
                      {prop.is_available === 1 ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={() => handleEditOpen(prop)}
                      className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => deleteProperty(prop.id)}
                      className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Chats Sidebar */}
        <div className="space-y-6">
          <h3 className="font-extrabold text-xl">Recent Chats ({chats.length})</h3>
          
          <div className="bg-white/90 border border-amber-200/20 p-5 rounded-3xl space-y-3">
            {chats.length === 0 ? (
              <p className="text-xs text-center py-6 text-slate-400">No active seeker chats yet.</p>
            ) : (
              chats.map((c) => (
                <div 
                  key={c.id}
                  onClick={() => handleOpenChat(c.id)}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer transition-colors border-b border-slate-100/50 last:border-0"
                >
                  <img 
                    src={c.partner.profile_pic} 
                    alt={c.partner.name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-slate-800 truncate">{c.partner.name}</h5>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{c.lastMessage?.content || 'No messages yet.'}</p>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* --- ADD MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-amber-50/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-amber-200 max-w-lg w-full rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-lg text-slate-800">New Property</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Listing Title</label>
                <input 
                  type="text" 
                  required 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Spacious 2BHK flat near Sony Signal"
                  className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Property Type</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-sm"
                  >
                    <option value="1BHK">1BHK</option>
                    <option value="2BHK">2BHK</option>
                    <option value="PG">PG</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Shared Apartment">Shared Apartment</option>
                    <option value="Independent Room">Independent Room</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Rent / Month (₹)</label>
                  <input 
                    type="number" 
                    required 
                    value={rent} 
                    onChange={(e) => setRent(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Deposit Amount (₹)</label>
                  <input 
                    type="number" 
                    required 
                    value={deposit} 
                    onChange={(e) => setDeposit(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Available From</label>
                  <input 
                    type="date" 
                    required 
                    value={availableFrom} 
                    onChange={(e) => setAvailableFrom(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Total Rooms</label>
                  <input 
                    type="number" 
                    required 
                    value={rooms} 
                    onChange={(e) => setRooms(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Photos</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handlePhotosUpload(e)}
                  className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-white hover:file:bg-amber-600 file:cursor-pointer cursor-pointer"
                />
                {photos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {photos.map((photo, idx) => (
                      <div key={idx} className="relative group">
                        <img src={photo} alt={`Photo ${idx + 1}`} className="w-16 h-16 rounded-xl object-cover border border-amber-200" />
                        <button type="button" onClick={() => removePhoto(idx)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Exact Location</label>
                  <input 
                    type="text" 
                    required 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Koramangala 4th Block"
                    className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Nearby Landmarks</label>
                  <input 
                    type="text" 
                    value={landmark} 
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Sony Signal Starbucks"
                    className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Property Description</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe your property details, house rules, roommates..."
                  className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-sm focus:outline-none"
                />
              </div>

              {/* Amenities checklist */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Amenities Available</label>
                <div className="flex flex-wrap gap-2">
                  {allAmenitiesOptions.map((amen) => (
                    <button
                      key={amen}
                      type="button"
                      onClick={() => handleAmenitiesChange(amen)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${amenities.includes(amen) ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-700 border-amber-200'}`}
                    >
                      {amen}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-700 text-white font-extrabold rounded-2xl shadow-md"
              >
                Publish Listing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {showEditModal && editingProp && (
        <div className="fixed inset-0 bg-amber-50/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-amber-200 max-w-lg w-full rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-lg text-slate-800">Edit Property Listing</h3>
              <button 
                onClick={() => { setShowEditModal(false); setEditingProp(null); }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Listing Title</label>
                <input 
                  type="text" 
                  required 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Property Type</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-sm"
                  >
                    <option value="1BHK">1BHK</option>
                    <option value="2BHK">2BHK</option>
                    <option value="PG">PG</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Shared Apartment">Shared Apartment</option>
                    <option value="Independent Room">Independent Room</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Rent / Month (₹)</label>
                  <input 
                    type="number" 
                    required 
                    value={rent} 
                    onChange={(e) => setRent(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Deposit Amount (₹)</label>
                  <input 
                    type="number" 
                    required 
                    value={deposit} 
                    onChange={(e) => setDeposit(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Available From</label>
                  <input 
                    type="date" 
                    required 
                    value={availableFrom} 
                    onChange={(e) => setAvailableFrom(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Total Rooms</label>
                  <input 
                    type="number" 
                    required 
                    value={rooms} 
                    onChange={(e) => setRooms(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Photos</label>
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handlePhotosUpload(e)}
                  className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-white hover:file:bg-amber-600 file:cursor-pointer cursor-pointer"
                />
                {photos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {photos.map((photo, idx) => (
                      <div key={idx} className="relative group">
                        <img src={photo} alt={`Photo ${idx + 1}`} className="w-16 h-16 rounded-xl object-cover border border-amber-200" />
                        <button type="button" onClick={() => removePhoto(idx)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Exact Location</label>
                  <input 
                    type="text" 
                    required 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Nearby Landmarks</label>
                  <input 
                    type="text" 
                    value={landmark} 
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Property Description</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-white border border-amber-200/70 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Amenities Available</label>
                <div className="flex flex-wrap gap-2">
                  {allAmenitiesOptions.map((amen) => (
                    <button
                      key={amen}
                      type="button"
                      onClick={() => handleAmenitiesChange(amen)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${amenities.includes(amen) ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-700 border-amber-200'}`}
                    >
                      {amen}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-700 text-white font-extrabold rounded-2xl shadow-md"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
