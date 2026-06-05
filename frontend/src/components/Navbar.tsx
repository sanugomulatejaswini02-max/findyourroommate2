import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, MessageSquare, Heart, User, LogOut, Menu, X, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';

interface NavbarProps {
  currentView: string;
  setView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const { user, signOut, notifications, markNotificationsRead, respondToConnection, sendConnectionRequest } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [cursorPos, setCursorPos] = useState({ left: 0, width: 0, opacity: 0 });

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

  const navItems = [
    { label: 'Home', view: 'landing', show: true },
    { label: 'Explore Rooms', view: 'properties', show: true },
    { label: 'Roommates', view: 'roommates', show: user && (user.role === 'seeker' || user.role === 'finder') },
    { label: 'Chat', view: 'chat', show: user !== null, icon: MessageSquare },
    { label: 'Wishlist', view: 'wishlist', show: user !== null && user.role !== 'admin', icon: Heart },
    { label: 'Admin Portal', view: 'admin', show: user !== null && user.role === 'admin', icon: ShieldAlert },
  ];

  const visibleDesktop = navItems.filter(n => n.show);

  return (
    <nav className="sticky top-4 z-50 max-w-7xl mx-auto w-[92%] glass-navbar rounded-2xl px-6 py-4 transition-all duration-300">
      <div className="flex items-center justify-between">
        {/* Brand Logo */}
        <motion.div
          onClick={() => handleNavClick('landing')}
          className="flex items-center gap-2 cursor-pointer shrink-0"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Logo />
        </motion.div>

        {/* Desktop Navigation with animated cursor */}
        <ul
          className="relative hidden md:flex items-center"
          onMouseLeave={() => setCursorPos((pv) => ({ ...pv, opacity: 0 }))}
        >
          {visibleDesktop.map((item) => (
            <NavTab
              key={item.view}
              isActive={currentView === item.view || (item.view === 'landing' && currentView === 'landing')}
              setCursorPos={setCursorPos}
              onClick={() => handleNavClick(item.view)}
            >
              {item.icon && <item.icon className="w-4 h-4" />}
              {item.label}
            </NavTab>
          ))}
          <CursorAnimator position={cursorPos} />
        </ul>

        {/* Right side items */}
        <div className="flex items-center gap-3 shrink-0">
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
                  <div className="fixed left-4 right-4 top-20 md:absolute md:left-auto md:right-0 md:top-full md:mt-3 max-h-96 overflow-y-auto z-50 rounded-2xl border border-amber-200/60 bg-white shadow-xl p-4 transition-all duration-200">
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
                                  onClick={async () => {
                                    const accepted = await respondToConnection(notif, 'accepted');
                                    if (accepted) setView('chat');
                                  }}
                                  className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-[10px] rounded-lg shadow-sm hover:opacity-90"
                                >
                                  Accept
                                </button>
                                <button 
                                  onClick={() => respondToConnection(notif, 'rejected')}
                                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg"
                                >
                                  Decline
                                </button>
                              </div>
                            )}

                            {/* Action items for match suggestions */}
                            {notif.type === 'match' && notif.metadata?.matchUserId && (
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={async () => {
                                    const success = await sendConnectionRequest(notif.metadata.matchUserId);
                                    if (success) {
                                      // Visual feedback: disable the button
                                      (document.activeElement as HTMLButtonElement)?.blur();
                                    }
                                  }}
                                  className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-[10px] rounded-lg shadow-sm hover:opacity-90 flex items-center gap-1"
                                >
                                  <UserCheck className="w-3 h-3" />
                                  Send Request
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
                  <div className="fixed right-4 left-4 top-20 md:absolute md:left-auto md:right-0 md:top-full md:mt-3 md:w-56 rounded-2xl border border-amber-200/60 bg-white shadow-xl py-2 z-50">
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

const NavTab = ({
  children,
  setCursorPos,
  onClick,
  isActive,
}: {
  children: React.ReactNode;
  setCursorPos: (pos: { left: number; width: number; opacity: number }) => void;
  onClick: () => void;
  isActive: boolean;
}) => {
  const ref = useRef<HTMLLIElement>(null);

  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setCursorPos({
          width,
          opacity: 1,
          left: ref.current.offsetLeft,
        });
      }}
      onClick={onClick}
      className={`relative z-10 block cursor-pointer px-3 py-1.5 text-xs uppercase md:px-4 md:py-2 md:text-sm font-semibold transition-colors duration-200 flex items-center gap-1.5 ${
        isActive ? 'text-amber-600' : 'text-slate-500 hover:text-amber-600'
      }`}
    >
      {children}
    </li>
  );
};

const CursorAnimator = ({ position }: { position: { left: number; width: number; opacity: number } }) => {
  return (
    <motion.li
      animate={position}
      className="absolute z-0 h-8 rounded-lg bg-amber-100 md:h-10"
      style={{ top: '50%', transform: 'translateY(-50%)' }}
    />
  );
};
