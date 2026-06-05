import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { RoleSelectionPage } from './pages/RoleSelectionPage';
import { PropertyOwnerDashboard } from './pages/PropertyOwnerDashboard';
import { RoomSeekerDashboard } from './pages/RoomSeekerDashboard';
import { RoommateFinderDashboard } from './pages/RoommateFinderDashboard';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage';
import { AIMatchResultsPage } from './pages/AIMatchResultsPage';
import { WishlistPage } from './pages/WishlistPage';
import { ChatPage } from './pages/ChatPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AdminDashboard } from './pages/AdminDashboard';
const AppContent: React.FC = () => {
  const { user, loading } = useApp();
  const [view, setView] = useState<string>('landing');
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  // Sync dashboard views on auth changes
  useEffect(() => {
    if (user) {
      if (user.role === 'owner') {
        setView('dashboard-owner');
      } else if (user.role === 'admin') {
        setView('admin');
      } else if (user.role === 'seeker') {
        // Check if seeker onboarding is done (budget & preferred area set)
        if (!user.preferred_area || !user.budget) {
          setView('role-selection');
        } else {
          setView('dashboard-seeker');
        }
      } else if (user.role === 'finder') {
        setView('roommates');
      }
    } else {
      // Keep on landing or auth views if logged out
      if (view !== 'login' && view !== 'signup' && view !== 'properties') {
        setView('landing');
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 flex flex-col items-center justify-center text-slate-400">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold mt-4 tracking-wider uppercase">Loading RoomieMatch...</p>
      </div>
    );
  }

  // Direct Page Router
  const renderView = () => {
    switch (view) {
      case 'landing':
        return <LandingPage setView={setView} isLoggedIn={!!user} />;
      case 'login':
        return <LoginPage setView={setView} />;
      case 'signup':
        return <SignupPage setView={setView} />;
      case 'role-selection':
        return <RoleSelectionPage setView={setView} />;
      case 'dashboard-owner':
        return <PropertyOwnerDashboard setView={setView} />;
      case 'dashboard-seeker':
        return (
          <RoomSeekerDashboard
            setView={setView}
            setSelectedProperty={setSelectedProperty}
            setSelectedMatch={setSelectedMatch}
          />
        );
      case 'roommates':
        return <RoommateFinderDashboard setView={setView} setSelectedMatch={setSelectedMatch} />;
      case 'property-details':
        return <PropertyDetailsPage property={selectedProperty} setView={setView} />;
      case 'ai-match-details':
        return <AIMatchResultsPage match={selectedMatch} setView={setView} />;
      case 'wishlist':
        return <WishlistPage setView={setView} setSelectedProperty={setSelectedProperty} />;
      case 'chat':
        return <ChatPage />;
      case 'profile':
        return <UserProfilePage />;
      case 'admin':
        return <AdminDashboard />;
      case 'properties':
        // Reuse RoomSeekerDashboard on Property tab for non-logged in guests or seekers
        return (
          <RoomSeekerDashboard
            setView={setView}
            setSelectedProperty={setSelectedProperty}
            setSelectedMatch={setSelectedMatch}
          />
        );
      default:
        return <LandingPage setView={setView} isLoggedIn={!!user} />;
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 pb-12">
      {/* Dynamic Header Navbar */}
      <div className="pt-4">
        <Navbar currentView={view} setView={setView} />
      </div>

      {/* Main Page Content */}
      <main className="mt-4">
        {renderView()}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
