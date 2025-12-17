import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { LoginModal } from '../components/LoginModal';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { MapPin, ArrowUpRight } from 'lucide-react';

export const Landing = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { scrollY } = useScroll();
  const { user } = useAuth();
  const location = useLocation();
  const redirectState = location.state as { redirectTo?: string } | null;
  let storedRedirect: string | null = null;
  if (typeof window !== 'undefined') {
    try {
      storedRedirect = sessionStorage.getItem('postLoginRedirect');
    } catch (error) {
      console.warn('Unable to read post-login redirect.', error);
      storedRedirect = null;
    }
  }
  const redirectTo = redirectState?.redirectTo || storedRedirect || '/apptada.tsx';
  const redirectToFromState = redirectState?.redirectTo;
  
  // Parallax transforms
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity1 = useTransform(scrollY, [0, 300], [1, 0]);
  
  const y2 = useTransform(scrollY, [200, 800], [100, 0]);
  const opacity2 = useTransform(scrollY, [200, 500, 800], [0, 1, 0]);

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  React.useEffect(() => {
    if (redirectState?.redirectTo && !user) {
      setIsLoginOpen(true);
    }
  }, [redirectState?.redirectTo, user]);

  React.useEffect(() => {
    if (!user || !storedRedirect) return;
    try {
      sessionStorage.removeItem('postLoginRedirect');
    } catch (error) {
      console.warn('Unable to clear post-login redirect.', error);
    }
  }, [user, storedRedirect]);

  return (
    <div className="relative w-full min-h-[200vh] text-white selection:bg-amber-500/30">
      {/* Login Orb - Amber Glow */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsLoginOpen(true)}
        className="fixed top-8 right-8 z-40 w-14 h-14 rounded-full bg-neutral-900/30 backdrop-blur-xl border border-amber-500/20 shadow-[0_0_20px_rgba(251,191,36,0.1)] flex items-center justify-center group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="sr-only">Access System</span>
        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_10px_#fbbf24] animate-pulse" />
      </motion.button>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center sticky top-0 overflow-hidden py-20">
        <motion.div style={{ y: y1, opacity: opacity1 }} className="text-center z-10 px-4 w-full max-w-4xl mx-auto flex flex-col items-center">
          <p className="text-amber-500 font-mono text-sm tracking-[0.3em] mb-4">EST. 2024</p>
          {/* Main Title - Adjusted for mobile fit */}
          <div className="relative inline-block group mb-6">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-neutral-200 to-neutral-500 uppercase">
              MANEE<span className="text-amber-500">&</span>SON LIMITED
            </h1>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-[2px] bg-white/20 group-hover:w-full group-hover:bg-amber-500 transition-all duration-500"></span>
          </div>
          {/* Subtitle - Corporate Consultancy Services */}
          <p className="text-xl md:text-2xl text-neutral-300 font-light tracking-wide max-w-3xl mx-auto mb-20 leading-relaxed capitalize">
            corporate consultancy services
          </p>
          
          {/* Company Info - Frameless Design */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="w-full flex flex-col items-center relative z-20"
          >
             <div className="flex flex-col items-center">
                <div className="flex items-baseline gap-4 mb-3">
                   <h3 className="text-4xl md:text-5xl font-light text-white tracking-tight">66 TOWER</h3>
                   <span className="text-amber-500 font-mono text-xs uppercase tracking-[0.2em] font-bold">Level 4</span>
                </div>

                <p className="text-base md:text-lg text-neutral-400 font-light leading-relaxed mb-10 text-center">
                  No. 2556 Sukhumvit Road, Bangna<br/>
                  Bangkok, 10260, Thailand
                </p>

                <a 
                  href="https://maps.app.goo.gl/gXgALhY3P4pjpouMA" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group/btn relative flex items-center justify-center gap-3 px-10 py-4 mb-14 overflow-hidden"
                >
                   {/* Minimal underline hover effect */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-[1px] bg-white/20 group-hover/btn:w-full group-hover/btn:bg-amber-500 transition-all duration-500"></div>
                  
                  <MapPin size={16} className="text-neutral-500 group-hover/btn:text-amber-500 transition-colors" />
                  <span className="text-sm font-bold text-neutral-300 group-hover/btn:text-white tracking-widest uppercase transition-colors">Locate HQ</span>
                  <ArrowUpRight size={14} className="text-neutral-500 opacity-50 group-hover/btn:opacity-100 group-hover/btn:text-amber-500 transition-all" />
                </a>

                {/* Technical Footer - Enhanced Visibility */}
                <div className="flex flex-col gap-2 items-center mt-4">
                   <div className="text-sm md:text-base font-mono text-neutral-300 tracking-widest font-semibold border-b border-white/10 pb-1">
                      REG NO. 0105567249062
                   </div>
                   <div className="text-xs md:text-sm font-mono text-neutral-400">
                      © MANEE & SON LIMITED 2024
                   </div>
                </div>
             </div>
          </motion.div>

        </motion.div>
      </section>

      {/* Value Prop Section */}
      <section className="h-screen flex items-center justify-center relative z-10 pointer-events-none">
        <motion.div style={{ y: y2, opacity: opacity2 }} className="max-w-5xl text-center px-4">
          <h2 className="text-4xl md:text-6xl font-light tracking-tight leading-tight text-neutral-200">
            We don't just write code. <br /> We craft <span className="text-indigo-400 font-normal">digital heritage</span>.
          </h2>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Architectural Precision", desc: "Scalable backend systems designed to outlast trends." },
              { title: "Seamless Integration", desc: "Connecting legacy logic with next-gen frameworks." },
              { title: "Algorithmic Design", desc: "Efficiency interwoven with aesthetic excellence." }
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-sm bg-neutral-900/40 backdrop-blur-md border border-white/5 hover:border-amber-500/30 transition-colors">
                <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-wider">{item.title}</h3>
                <p className="text-neutral-300 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        redirectTo={redirectTo}
      />
    </div>
  );
};
