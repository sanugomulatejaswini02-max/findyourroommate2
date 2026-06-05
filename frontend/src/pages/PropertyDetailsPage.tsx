import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Calendar, BedDouble, Eye, Heart, MessageSquare, ArrowLeft, Phone, Mail, UserCheck, Shield } from 'lucide-react';

interface PropertyDetailsPageProps {
  property: any;
  setView: (view: string) => void;
}

export const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({ property, setView }) => {
  const { wishlist, toggleWishlist, user, createChatRoom, selectChat, incrementViews } = useApp();
  const [activePhoto, setActivePhoto] = useState(0);
  const [revealPhone, setRevealPhone] = useState(false);
  const [owner, setOwner] = useState<any>(null);

  const isSaved = wishlist.includes(property.id);

  useEffect(() => {
    incrementViews(property.id);
    loadOwnerDetails();
  }, [property.id]);

  const loadOwnerDetails = () => {
    const users = JSON.parse(localStorage.getItem('fyr_users') || '[]');
    const ownerInfo = users.find((u: any) => u.id === property.owner_id);
    if (ownerInfo) {
      setOwner(ownerInfo);
    }
  };

  const handleContactOwner = async () => {
    if (!user) {
      alert('Please sign in or create an account to message owners!');
      setView('login');
      return;
    }

    if (user.id === property.owner_id) {
      alert('This is your own listing!');
      return;
    }

    const chatId = await createChatRoom(property.owner_id);
    if (chatId !== -1) {
      selectChat(chatId);
      setView('chat');
    } else {
      alert('Could not start a conversation.');
    }
  };

  const amenitiesMap: Record<string, { icon: string; label: string }> = {
    WiFi: { icon: '📶', label: 'WiFi Included' },
    Parking: { icon: '🚗', label: 'Free Parking' },
    AC: { icon: '❄️', label: 'Air Conditioning' },
    Furnished: { icon: '🛋️', label: 'Fully Furnished' },
    Kitchen: { icon: '🍳', label: 'Modular Kitchen' },
    Laundry: { icon: '🧺', label: 'Washing Machine' },
    Security: { icon: '🛡️', label: '24/7 Security' },
  };

  const handleWishlistToggle = () => {
    if (!user) {
      alert('Please log in to add to wishlist!');
      return;
    }
    toggleWishlist(property.id);
  };

  return (
    <div className="min-h-screen bg-amber-50/30 text-slate-800 py-10 max-w-5xl mx-auto w-[92%]">

      <button
        onClick={() => setView('properties')}
        className="mb-6 font-bold text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to listings
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-6">

          <div className="relative rounded-[32px] overflow-hidden bg-slate-100 shadow-md">
            <div className="aspect-[16/10] w-full">
              <img
                src={property.photos?.[activePhoto] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>

            {user?.role !== 'owner' && (
              <button
                onClick={handleWishlistToggle}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md shadow-md transition-colors ${
                  isSaved ? 'bg-rose-500 text-white' : 'bg-white/40 text-white hover:bg-white hover:text-rose-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}

            {property.photos && property.photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 p-2 bg-white/50 backdrop-blur-md rounded-xl">
                {property.photos.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhoto(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      activePhoto === idx ? 'w-4 bg-amber-500' : 'bg-slate-300/60'
                    }`}
                    aria-label={`Go to photo ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/90 border border-amber-200/20 shadow-glass p-6 rounded-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-600 px-2.5 py-1 rounded-lg">
                {property.type}
              </span>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-600 px-2.5 py-1 rounded-lg flex items-center gap-0.5">
                <Shield className="w-3.5 h-3.5" /> Verified Listing
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight">
              {property.title}
            </h1>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>{property.location}</span>
            </div>

            {property.landmark && (
              <p className="text-xs text-slate-400">
                Landmarks: <span className="font-bold text-slate-600">{property.landmark}</span>
              </p>
            )}

            <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-5 mt-2">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Rent Amount</p>
                <p className="text-xl font-extrabold text-amber-500 mt-1">
                  ₹{property.rent.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-400">/mo</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Deposit</p>
                <p className="text-xl font-extrabold text-slate-800 mt-1">₹{property.deposit.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Rooms Available</p>
                <p className="text-xl font-extrabold text-slate-800 mt-1">{property.rooms} Bed</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 border border-amber-200/20 shadow-glass p-6 rounded-3xl space-y-3">
            <h3 className="font-extrabold text-base">About the property</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal whitespace-pre-wrap">
              {property.description}
            </p>
          </div>

          <div className="bg-white/90 border border-amber-200/20 shadow-glass p-6 rounded-3xl space-y-4">
            <h3 className="font-extrabold text-base">Amenities included</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {property.amenities && property.amenities.map((amen: string) => {
                const mapped = amenitiesMap[amen];
                return (
                  <div
                    key={amen}
                    className="p-3 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 bg-amber-50/50 flex items-center gap-2"
                  >
                    <span>{mapped?.icon || '✓'}</span>
                    <span>{mapped?.label || amen}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        <div className="space-y-6">
          <div className="bg-white/90 border border-amber-200/20 shadow-glass p-6 rounded-3xl text-center flex flex-col items-center space-y-4 sticky top-28">
            <h3 className="font-extrabold text-sm uppercase text-slate-400 tracking-wider">Contact Property Owner</h3>

            <img
              src={owner?.profile_pic || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
              alt={owner?.name || 'Owner'}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-amber-500/20"
            />

            <div>
              <h4 className="font-extrabold text-slate-800 text-base">{owner?.name || 'Rajesh Kumar'}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Verified Owner</p>
            </div>

            <p className="text-xs text-slate-400 leading-normal italic px-2">
              "{owner?.bio || 'Responsive property owner managing multiple student properties in Koramangala.'}"
            </p>

            <div className="w-full pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={handleContactOwner}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-700 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transform active:scale-95 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                Chat with Owner
              </button>

              {revealPhone ? (
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800 border border-slate-200">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <span>+91 98765 43210</span>
                </div>
              ) : (
                <button
                  onClick={() => setRevealPhone(true)}
                  className="w-full py-3 border border-slate-200 hover:bg-slate-100 font-bold text-xs text-slate-700 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-4 h-4" />
                  Show Phone Number
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-2 font-medium">
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{property.views} Views</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Listed {new Date(property.created_at).toLocaleDateString([], { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
