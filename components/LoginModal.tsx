import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Fingerprint, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { useNavigate } from 'react-router-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = (role: UserRole) => {
    setLoading(true);
    setTimeout(() => {
      login(role);
      setLoading(false);
      onClose();
      if (role === UserRole.ADMIN) navigate('/admin');
      else navigate('/dashboard');
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-neutral-900/90 backdrop-blur-2xl border border-amber-500/20 shadow-[0_0_50px_rgba(251,191,36,0.1)] rounded-xl p-8 overflow-hidden"
          >
            {/* Subtle Industrial Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-10 text-center relative z-10">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full mx-auto mb-6 flex items-center justify-center border border-amber-500/30">
                <ShieldCheck className="text-amber-500" size={24} />
              </div>
              <h2 className="text-2xl font-light text-white tracking-wide mb-2">Manee<span className="text-amber-500">&</span>Son</h2>
              <p className="text-neutral-400 text-sm">Authorized Personnel Only</p>
            </div>

            {loading ? (
              <div className="h-48 flex flex-col items-center justify-center space-y-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Fingerprint size={64} className="text-amber-500" />
                </motion.div>
                <p className="text-amber-500/60 text-xs tracking-widest uppercase animate-pulse">Authenticating Identity...</p>
              </div>
            ) : (
              <div className="space-y-4 relative z-10">
                <button
                  onClick={() => handleLogin(UserRole.EMPLOYEE)}
                  className="group relative w-full bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/50 text-white p-4 rounded-lg flex items-center justify-between transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-neutral-800 flex items-center justify-center">
                      <span className="text-xs font-mono font-bold text-amber-500">{`</>`}</span>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium group-hover:text-amber-400 transition-colors">Developer Access</div>
                      <div className="text-xs text-neutral-500">Engineering & QA</div>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-neutral-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => handleLogin(UserRole.ADMIN)}
                  className="group relative w-full bg-white/5 hover:bg-indigo-500/10 border border-white/10 hover:border-indigo-500/50 text-white p-4 rounded-lg flex items-center justify-between transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-neutral-800 flex items-center justify-center">
                      <span className="text-xs font-mono font-bold text-indigo-400">EXE</span>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium group-hover:text-indigo-400 transition-colors">Executive Portal</div>
                      <div className="text-xs text-neutral-500">Administration</div>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-neutral-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            )}
            
            <div className="mt-8 text-center">
               <p className="text-[10px] text-neutral-600 uppercase tracking-[0.2em]">System v2.4.0 • Encrypted</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
