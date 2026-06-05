import React from 'react';
import { useApp } from '../context/AppContext';
import { PropertyCard } from '../components/PropertyCard';
import { Heart, Search } from 'lucide-react';

interface WishlistPageProps {
  setView: (view: string) => void;
  setSelectedProperty: (prop: any) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ setView, setSelectedProperty }) => {
  const { wishlist, properties } = useApp();

  // Find properties that are saved
  const wishlistedItems = properties.filter((p) => wishlist.includes(p.id));

  const handlePropertyClick = (prop: any) => {
    setSelectedProperty(prop);
    setView('property-details');
  };

  return (
    <div className="min-h-screen bg-amber-50/30  text-slate-800  py-10 max-w-7xl mx-auto w-[92%]">
      
      {/* Title */}
      <div className="mb-8 flex items-center gap-2">
        <Heart className="w-8 h-8 text-rose-500 fill-current shrink-0 animate-pulse" />
        <div>
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-amber-600 to-amber-500   ">
            My Wishlist
          </h2>
          <p className="text-xs text-slate-400  mt-1">Saved rental properties and flat shares of interest.</p>
        </div>
      </div>

      {/* Grid */}
      {wishlistedItems.length === 0 ? (
        <div className="glass-panel bg-white/90 border border-amber-200/20 shadow-glass p-16 text-center text-slate-400 rounded-3xl max-w-xl mx-auto mt-12 flex flex-col items-center">
          <Heart className="w-16 h-16 text-slate-300  mb-4" />
          <h3 className="font-extrabold text-slate-800  text-lg">Your Wishlist is Empty</h3>
          <p className="text-xs text-slate-400 leading-relaxed mt-2 max-w-sm">
            Save rooms and shared apartments to review them later or share them in chat with prospective roommates.
          </p>
          <button
            onClick={() => setView('properties')}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transform active:scale-95 transition-all"
          >
            <Search className="w-4 h-4" />
            Explore Properties
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistedItems.map((prop) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              onClick={() => handlePropertyClick(prop)}
            />
          ))}
        </div>
      )}

    </div>
  );
};
