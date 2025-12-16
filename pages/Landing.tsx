import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { LoginModal } from '../components/LoginModal';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export const Landing = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { scrollY } = useScroll();
  const { user } = useAuth();
  
  // Parallax transforms
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity1 = useTransform(scrollY, [0, 300], [1, 0]);
  
  const y2 = useTransform(scrollY, [200, 800], [100, 0]);
  const opacity2 = useTransform(scrollY, [200, 500, 800], [0, 1, 0]);

  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  }

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
      <section className="h-screen flex items-center justify-center sticky top-0 overflow-hidden">
        <motion.div style={{ y: y1, opacity: opacity1 }} className="text-center z-10 px-4">
          <p className="text-amber-500 font-mono text-sm tracking-[0.3em] mb-4">EST. 2024</p>
          <h1 className="text-7xl md:text-9xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-neutral-200 to-neutral-500 mb-6">
            Manee<span className="text-amber-500">&</span>Son
          </h1>
          <p className="text-xl text-neutral-400 font-light tracking-wide max-w-2xl mx-auto mb-8">
            Generations of logic. Bespoke software architecture.
          </p>
          <motion.button 
             whileHover={{ scale: 1.05 }}
             onClick={() => setIsLoginOpen(true)}
             className="px-10 py-4 bg-amber-500 text-black rounded-sm font-semibold tracking-wider hover:bg-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.3)] transition-all"
          >
            INITIALIZE
          </motion.button>
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
                <p className="text-neutral-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};
