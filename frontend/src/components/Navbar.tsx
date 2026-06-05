import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, MessageSquare, Heart, User, LogOut, Menu, X, ShieldAlert, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const { user, signOut, notifications, markNotificationsRead, respondToConnection } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadNotifications = notifications.filter(n => n.is_read === 0);

  const handleNavClick = (view: string) => {
    setView(view);
    setMobileMenuOpen(false);
  };

  const handleNotificationsClick = () => {
    setNotificationsOpen(!notificationsOpen);
    setProfileDropdownOpen(false);
    if (!notificationsOpen) {
      markNotificationsRead();
    }
  };

  const handleProfileClick = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
    setNotificationsOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setView('landing');
    setProfileDropdownOpen(false);
  };

  return (
    <nav className="sticky top-4 z-50 max-w-7xl mx-auto w-[92%] glass-navbar rounded-2xl px-6 py-4 transition-all duration-300">
      <div className="flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('landing')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-serif font-extrabold text-xl shadow-gold transform group-hover:scale-105 transition-all duration-300">
            R
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-amber-600">
            RoomieMatch
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => handleNavClick('landing')}
            className={`font-semibold transition-colors duration-200 ${currentView === 'landing' ? 'text-amber-600' : 'text-slate-500 hover:text-amber-600'}`}
          >
            Home
          </button>
          
          <button 
            onClick={() => handleNavClick('properties')}
            className={`font-semibold transition-colors duration-200 ${currentView === 'properties' ? 'text-amber-600' : 'text-slate-500 hover:text-amber-600'}`}
          >
            Explore Rooms
          </button>

          {user && (user.role === 'seeker' || user.role === 'finder') && (
            <button 
              onClick={() => handleNavClick('roommates')}
              className={`font-semibold transition-colors duration-200 ${currentView === 'roommates' ? 'text-amber-600' : 'text-slate-500 hover:text-amber-600'}`}
            >
              Roommates
            </button>
          )}

          {user && (
            <button 
              onClick={() => handleNavClick('chat')}
              className={`flex items-center gap-1.5 font-semibold transition-colors duration-200 ${currentView === 'chat' ? 'text-amber-600' : 'text-slate-500 hover:text-amber-600'}`}
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </button>
          )}

          {user && user.role !== 'admin' && (
            <button 
              onClick={() => handleNavClick('wishlist')}
              className={`flex items-center gap-1.5 font-semibold transition-colors duration-200 ${currentView === 'wishlist' ? 'text-amber-600' : 'text-slate-500 hover:text-amber-600'}`}
            >
              <Heart className="w-4 h-4" />
              Wishlist
            </button>
          )}

          {user && user.role === 'admin' && (
            <button 
              onClick={() => handleNavClick('admin')}
              className={`flex items-center gap-1 font-semibold text-rose-500 hover:opacity-80`}
            >
              <ShieldAlert className="w-4 h-4" />
              Admin Portal
            </button>
          )}
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Notifications bell */}
              <div className="relative">
                <button
                  onClick={handleNotificationsClick}
                  className="relative p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition-all duration-200"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5.5 h-5.5 bg-rose-500 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center border-2 border-white ring-1 ring-rose-300 animate-pulse">
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>

                {/* Notifications dropdown menu */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto z-50 rounded-2xl border border-amber-200/60 bg-white shadow-xl p-4 transition-all duration-200">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                        Notifications
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-center py-4 text-slate-400">No notifications yet.</p>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id}
                            className={`p-3 rounded-xl transition-all duration-200 border ${notif.is_read === 0 ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50/50 border-slate-200'}`}
                          >
                            <div className="flex items-start gap-2 justify-between">
                              <span className="font-bold text-xs text-amber-700 flex items-center gap-1">
                                {notif.type === 'match' && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                                {notif.title}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
                            
                            {/* Action items for connection requests */}
                            {notif.type === 'connection' && notif.metadata && (
                              <div className="flex items-center gap-2 mt-2">
                                <button 
                                  onClick={() => respondToConnection(notif.id, 'accepted')}
                                  className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-[10px] rounded-lg shadow-sm hover:opacity-90"
                                >
                                  Accept
                                </button>
                                <button 
                                  onClick={() => respondToConnection(notif.id, 'rejected')}
                                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg"
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <img
                    src={user.profile_pic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={user.name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-amber-400/50 hover:scale-105 transition-all duration-200"
                  />
                </button>

                {/* Profile menu dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-amber-200/60 bg-white shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-800 truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 capitalize truncate">{user.role.replace('_', ' ')}</p>
                    </div>

                    <button
                      onClick={() => handleNavClick(user.role === 'owner' ? 'dashboard-owner' : user.role === 'admin' ? 'admin' : 'dashboard-seeker')}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-amber-500" />
                      My Dashboard
                    </button>
                    
                    <button
                      onClick={() => handleNavClick('profile')}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-amber-500" />
                      Edit Profile
                    </button>

                    <hr className="border-slate-100 my-1" />

                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 flex items-center gap-2 font-bold"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setView('login')}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-amber-600 transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => setView('signup')}
                className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 rounded-xl shadow-gold hover:shadow-lg transform active:scale-95 transition-all duration-200"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-slate-200/50 flex flex-col gap-3 transition-all duration-300">
          <button
            onClick={() => handleNavClick('landing')}
            className={`w-full text-left py-2 px-3 rounded-lg font-semibold ${currentView === 'landing' ? 'bg-amber-50 text-amber-600' : 'text-slate-600 hover:bg-amber-50'}`}
          >
            Home
          </button>
          
          <button
            onClick={() => handleNavClick('properties')}
            className={`w-full text-left py-2 px-3 rounded-lg font-semibold ${currentView === 'properties' ? 'bg-amber-50 text-amber-600' : 'text-slate-600 hover:bg-amber-50'}`}
          >
            Explore Rooms
          </button>

          {user && (user.role === 'seeker' || user.role === 'finder') && (
            <button
              onClick={() => handleNavClick('roommates')}
              className={`w-full text-left py-2 px-3 rounded-lg font-semibold ${currentView === 'roommates' ? 'bg-amber-50 text-amber-600' : 'text-slate-600 hover:bg-amber-50'}`}
            >
              Roommates
            </button>
          )}

          {user && (
            <button
              onClick={() => handleNavClick('chat')}
              className={`w-full text-left py-2 px-3 rounded-lg font-semibold ${currentView === 'chat' ? 'bg-amber-50 text-amber-600' : 'text-slate-600 hover:bg-amber-50'}`}
            >
              Chat
            </button>
          )}

          {user && user.role !== 'admin' && (
            <button
              onClick={() => handleNavClick('wishlist')}
              className={`w-full text-left py-2 px-3 rounded-lg font-semibold ${currentView === 'wishlist' ? 'bg-amber-50 text-amber-600' : 'text-slate-600 hover:bg-amber-50'}`}
            >
              Wishlist
            </button>
          )}

          {user && user.role === 'admin' && (
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full text-left py-2 px-3 rounded-lg font-semibold text-rose-500 hover:bg-rose-50"
            >
              Admin Dashboard
            </button>
          )}

          {!user && (
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleNavClick('login')}
                className="w-full text-center py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Log In
              </button>
              <button
                onClick={() => handleNavClick('signup')}
                className="w-full text-center py-2.5 bg-gradient-to-r from-amber-500 to-amber-700 text-white font-semibold rounded-xl"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};