import React from 'react';
import { Sparkles, Home, UserCheck, MessageSquare, ArrowRight, Star } from 'lucide-react';

interface LandingPageProps {
  setView: (view: string) => void;
  isLoggedIn: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setView, isLoggedIn }) => {
  const features = [
    {
      icon: <Home className="w-6 h-6 text-amber-600" />,
      title: 'Verified Listings',
      desc: 'Browse rooms, PGs, hostels, and shared flats uploaded directly by verified owners.'
    },
    {
      icon: <Sparkles className="w-6 h-6 text-amber-500" />,
      title: 'AI Compatibility Matching',
      desc: 'Let our algorithm compare sleep, cleanliness, and lifestyle preferences to find the perfect roommate.'
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-emerald-500" />,
      title: 'Real-Time Secure Chat',
      desc: 'Chat directly with owners and prospective flatmates, share listings, and coordinate moves.'
    }
  ];

  const stats = [
    { num: '8,500+', label: 'Verified Properties' },
    { num: '24,000+', label: 'Active Roommates' },
    { num: '94%', label: 'Satisfaction Score' }
  ];

  const handleStart = () => {
    if (isLoggedIn) {
      setView('properties');
    } else {
      setView('signup');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-start bg-white text-slate-800 pt-6 pb-12 overflow-x-hidden">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto w-[92%] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-12 lg:py-20">
        
        {/* Left Intro Column */}
        <div className="flex flex-col space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/50 text-amber-600 border border-amber-200/40 text-xs font-bold w-fit animate-pulse">
            <Sparkles className="w-4 h-4" />
            AI-Powered Roommate Matching
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-amber-600 to-amber-500">
            Find Your Space.<br/>
            Meet Your Mate.
          </h1>
          
          <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg">
            Discover rental listings, meet compatible roommates, and coordinate shared housing all in one secure, student-friendly platform. Designed like Airbnb and Bumble combined.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-700 hover:opacity-95 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-amber-500/25 flex items-center justify-center gap-2 transform active:scale-95 transition-all duration-200"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView('properties')}
              className="px-8 py-4 border border-slate-200 hover:bg-slate-100 font-bold rounded-2xl text-slate-700 transition-colors"
            >
              Browse Rooms
            </button>
          </div>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-3 gap-4 border-t border-amber-100/50 pt-8 mt-4">
            {stats.map((s, idx) => (
              <div key={idx}>
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">{s.num}</p>
                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Graphical Column */}
        <div className="relative flex justify-center lg:justify-end animate-float">
          <div className="relative w-full max-w-md aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-amber-100">
            <img 
              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800" 
              alt="Shared Living Apartment"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/60 via-transparent to-transparent p-6 flex flex-col justify-end">
              <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-sm mb-1">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <p className="text-white font-bold text-sm italic">"I found both my Indiranagar apartment and my current flatmate Aanya here. The compatibility score was spot on!"</p>
              <p className="text-slate-300 text-xs mt-1.5 font-medium">— Vikram, Software Engineer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Showcase */}
      <div className="bg-amber-50/50 border-y border-amber-100/50 py-16">
        <div className="max-w-7xl mx-auto w-[92%]">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">How it works</h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Find Your Roommate simplifies housing discovery by bringing property listings, lifestyle compatibility screening, and secure messaging into a single platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, idx) => (
              <div 
                key={idx}
                className="bg-white p-8 border border-amber-100/50 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50/50 flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="font-bold text-lg text-slate-800">{f.title}</h3>
                <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto w-[92%] py-16 text-center">
        <div className="bg-white border border-amber-200/50 p-8 sm:p-12 md:p-16 rounded-[40px] flex flex-col items-center space-y-6 max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">Ready to find your perfect place?</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed">
            Create your account today, complete your lifestyle questionnaire, and browse verified listings or connect with compatible roommate seekers instantly.
          </p>
          <button
            onClick={handleStart}
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-700 hover:opacity-95 text-white font-extrabold rounded-2xl shadow-md hover:shadow-amber-500/20 transform active:scale-95 transition-all duration-200"
          >
            Create Free Account
          </button>
        </div>
      </div>
    </div>
  );
};
