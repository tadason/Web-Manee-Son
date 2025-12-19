import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { LoginModal } from '../components/LoginModal';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { MapPin, ArrowUpRight } from 'lucide-react';
import { UserRole } from '../types';
import { ThreeBackground } from '../components/ThreeBackground';

export const Landing = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { scrollY } = useScroll();
  const { user } = useAuth();
  const location = useLocation();
  const redirectState = location.state as { redirectTo?: string } | null;
  const mapUrl = 'https://www.google.com/maps?q=66%20Tower%20Sukhumvit%20Road%20Bangkok';
  
  // Parallax transforms
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity1 = useTransform(scrollY, [0, 300], [1, 0]);
  
  const y2 = useTransform(scrollY, [200, 800], [100, 0]);
  const opacity2 = useTransform(scrollY, [200, 500, 800], [0, 1, 0]);

  // --- LOGIC การแยกหน้า ADMIN / USER (แก้ไขตามโจทย์) ---
  if (user) {
    // 1. ถ้ามี Redirect เดิมค้างอยู่ ให้ไปหน้านั้นก่อน
    if (redirectState?.redirectTo) {
        return <Navigate to={redirectState.redirectTo} replace />;
    }

    // 2. ถ้า Login ปกติ ให้แยกตาม Role
    if (user.role === UserRole.ADMIN) {
        return <Navigate to="/admin" replace />; // CEO Dashboard
    } else {
        // User ทั่วไป ให้ไปหน้า AppTada
        return <Navigate to="/apptada" replace />; 
    }
  }
  // ---------------------------------------------------


  return (
    <div className="relative w-full min-h-[200vh] text-white selection:bg-amber-500/30">
      <ThreeBackground />
      {/* Login Orb */}
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
          <div className="relative inline-block group mb-6">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-neutral-200 to-neutral-500 uppercase">
              MANEE<span className="text-amber-500">&</span>SON LIMITED
            </h1>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-[2px] bg-white/20 group-hover:w-full group-hover:bg-amber-500 transition-all duration-500"></span>
          </div>
          <p className="text-xl md:text-2xl text-neutral-300 font-light tracking-wide max-w-3xl mx-auto mb-20 leading-relaxed capitalize">
            corporate consultancy services
          </p>
          
          {/* Company Info */}
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
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-amber-200/80 transition-colors duration-300 hover:text-amber-200"
                >
                  <MapPin size={14} className="text-amber-400/80" />
                  <span className="relative inline-block">
                    Locate HQ
                    <span className="absolute -bottom-1 left-1/2 h-px w-8 -translate-x-1/2 bg-amber-400/50 transition-all duration-300 group-hover:w-full group-hover:bg-amber-400" />
                  </span>
                  <ArrowUpRight size={14} className="opacity-60 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>

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

      {/* Login Modal Component */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </div>
  );
};
