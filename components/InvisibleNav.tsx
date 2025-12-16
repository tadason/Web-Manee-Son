import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Code2, ShieldAlert } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { UserRole } from '../types';

export const InvisibleNav = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-24 z-50 flex justify-center group pointer-events-none hover:pointer-events-auto">
      
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: -80, opacity: 0.5 }}
        whileHover={{ y: 20, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="bg-neutral-900/80 backdrop-blur-xl border border-amber-500/20 px-8 py-4 rounded-full shadow-[0_0_30px_rgba(251,191,36,0.1)] flex items-center gap-8 pointer-events-auto cursor-default"
      >
        {/* Brand Identity */}
        <div className="text-amber-500/80 text-xs font-mono tracking-widest uppercase border-r border-amber-500/20 pr-6 mr-2 font-bold">
          Manee<span className="text-white/40">&</span>Son
        </div>

        <Link to="/" className={`p-2 rounded-full transition-colors ${location.pathname === '/' ? 'text-amber-400 bg-amber-900/20' : 'text-white/60 hover:text-amber-400'}`}>
           <Home size={20} />
        </Link>

        {user.role === UserRole.EMPLOYEE && (
           <Link to="/dashboard" className={`p-2 rounded-full transition-colors ${location.pathname === '/dashboard' ? 'text-amber-400 bg-amber-900/20' : 'text-white/60 hover:text-amber-400'}`}>
             <Code2 size={20} />
           </Link>
        )}

        {user.role === UserRole.ADMIN && (
           <Link to="/admin" className={`p-2 rounded-full transition-colors ${location.pathname === '/admin' ? 'text-indigo-400 bg-indigo-900/20' : 'text-white/60 hover:text-indigo-400'}`}>
             <ShieldAlert size={20} />
           </Link>
        )}

        <button 
          onClick={logout}
          className="ml-4 flex items-center gap-2 text-neutral-400 hover:text-white text-sm font-medium transition-colors"
        >
          <LogOut size={16} />
          <span>Eject</span>
        </button>
      </motion.div>
    </div>
  );
};
