import React from 'react';
import { useApp } from '../context/AppContext';
import { Heart, MapPin, BedDouble, Calendar, ArrowRight } from 'lucide-react';

interface Property {
  id: number;
  owner_id: number;
  title: string;
  type: string;
  rent: number;
  deposit: number;
  location: string;
  landmark: string;
  description: string;
  amenities: string[];
  available_from: string;
  rooms: number;
  photos: string[];
  is_available: number;
  views: number;
  created_at: string;
}

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
  const { wishlist, toggleWishlist, user } = useApp();
  const isWishlisted = wishlist.includes(property.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert('Please log in to add properties to your wishlist!');
      return;
    }
    toggleWishlist(property.id);
  };

  const defaultPhoto = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600';
  const displayPhoto = property.photos && property.photos.length > 0 ? property.photos[0] : defaultPhoto;

  return (
    <div 
      onClick={onClick}
      className="group relative flex flex-col bg-white border border-amber-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
    >
      {/* Property Thumbnail */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img 
          src={displayPhoto} 
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Rent Tag */}
        <div className="absolute bottom-4 left-4 bg-white/90 text-amber-700 font-extrabold text-sm py-1.5 px-3 rounded-xl shadow-md">
          ₹{property.rent.toLocaleString('en-IN')}<span className="text-[10px] text-amber-500 font-normal"> / mo</span>
        </div>

        {/* Type Badge */}
        <div className="absolute top-4 left-4 bg-amber-500 text-white font-bold text-[10px] uppercase tracking-wide py-1 px-2.5 rounded-lg shadow-sm">
          {property.type}
        </div>

        {/* Wishlist Toggle Button */}
        {user?.role !== 'owner' && (
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md shadow-md transition-all duration-200 ${isWishlisted ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-white/90 text-amber-700 border border-amber-200/20 hover:bg-amber-50'}`}
            aria-label="Add to wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Property Details */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{property.location.split(',')[0]}</span>
        </div>

        <h3 className="font-bold text-slate-800 text-base mt-1.5 line-clamp-1 group-hover:text-amber-500 transition-colors">
          {property.title}
        </h3>

        {property.landmark && (
          <p className="text-xs text-slate-500 mt-1 truncate">
            Near {property.landmark}
          </p>
        )}

        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
          {property.description}
        </p>

        {/* Footer Meta */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 sm:gap-4 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1">
                <BedDouble className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                <span className="whitespace-nowrap">{property.rooms} {property.rooms > 1 ? 'Rooms' : 'Room'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                <span className="whitespace-nowrap">{new Date(property.available_from).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>

            <div className="text-amber-500 group-hover:translate-x-1.5 transition-transform duration-300 shrink-0">
              <ArrowRight className="w-4 h-4" />
            </div>
        </div>
      </div>
    </div>
  );
};
