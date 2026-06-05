import React from 'react';
import { HeroSection } from '@/components/ui/hero-section-2';
import { SlideUp, SlideLeft, SlideRight, ScaleIn, StaggerGrid } from '@/components/AnimatedSection';
import { Sparkles, Home, MessageSquare, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      <HeroSection
        logo={{
          url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=50&h=50&fit=crop",
          alt: "RoomieMatch",
          text: "RoomieMatch"
        }}
        slogan="AI-POWERED ROOMMATE MATCHING"
        title={
          <>
            Find Your Space.<br />
            <span className="text-primary">Meet Your Mate.</span>
          </>
        }
        subtitle="Discover rental listings, meet compatible roommates, and coordinate shared housing all in one secure, student-friendly platform. Designed like Airbnb and Bumble combined."
        callToAction={{
          text: "GET STARTED NOW",
          href: "#start",
        }}
        backgroundImage="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&auto=format&fit=crop&q=80"
        onCtaClick={(e) => { e.preventDefault(); handleStart(); }}
      />

      <SlideUp>
        <div className="flex justify-center -mt-12 relative z-10">
          <motion.div
            className="bg-white/90 backdrop-blur-md border border-amber-200/30 shadow-glass rounded-2xl px-4 sm:px-16 py-6 flex flex-wrap justify-center gap-6 sm:gap-16"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {stats.map((s, idx) => (
              <div key={idx} className="text-center">
                <motion.p
                  className="text-2xl sm:text-3xl font-extrabold text-primary"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + idx * 0.2, type: 'spring', stiffness: 200 }}
                >
                  {s.num}
                </motion.p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </SlideUp>

      <div className="bg-muted/50 border-y border-amber-100/50 py-20 mt-12">
        <div className="max-w-7xl mx-auto w-[92%]">
          <SlideUp>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">How it works</h2>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Find Your Roommate simplifies housing discovery by bringing property listings, lifestyle compatibility screening, and secure messaging into a single platform.
              </p>
            </div>
          </SlideUp>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, idx) => (
              <motion.div
                key={idx}
                className="bg-white p-4 sm:p-8 border border-amber-100/50 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50/50 flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="font-bold text-lg text-slate-800">{f.title}</h3>
                <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </StaggerGrid>
        </div>
      </div>

      <ScaleIn>
        <div className="max-w-7xl mx-auto w-[92%] py-20 text-center">
          <motion.div
            className="bg-white border border-amber-200/50 p-8 sm:p-12 md:p-16 rounded-[40px] flex flex-col items-center space-y-6 max-w-4xl mx-auto"
            whileHover={{ boxShadow: '0 20px 60px rgba(217,119,6,0.12)' }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight text-foreground">Ready to find your perfect place?</h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed">
              Create your account today, complete your lifestyle questionnaire, and browse verified listings or connect with compatible roommate seekers instantly.
            </p>
            <motion.button
              onClick={handleStart}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-700 hover:opacity-95 text-white font-extrabold rounded-2xl shadow-md hover:shadow-amber-500/20 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create Free Account
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </motion.button>
          </motion.div>
        </div>
      </ScaleIn>
    </div>
  );
};
