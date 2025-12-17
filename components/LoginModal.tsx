import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Mail, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, redirectTo }) => {
  const { loginWithEmail, user, authError, authLoading } = useAuth();
  const navigate = useNavigate();
  const redirectTarget = redirectTo || '/apptada.tsx';
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<'email' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isBusy = loading || authLoading;

  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage(null);
    setLoading(false);
    setActiveAction(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !user) return;
    onClose();
    navigate(redirectTarget);
  }, [isOpen, user, navigate, onClose, redirectTarget]);

  useEffect(() => {
    if (authError) {
      setErrorMessage(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActiveAction('email');
    setLoading(true);
    setErrorMessage(null);

    try {
      await loginWithEmail(email, password);
    } catch (error: any) {
      setErrorMessage(error?.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
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
            className="relative w-full max-w-sm bg-neutral-900/90 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(251,191,36,0.1)] rounded-2xl p-8 overflow-hidden"
          >
            {/* Subtle Industrial Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors z-20"
            >
              <X size={20} />
            </button>

            <div className="relative z-10">
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-medium text-white tracking-tight mb-2">Sign In</h2>
                  <p className="text-neutral-500 text-sm">Use the account registered in Firebase Authentication.</p>
                </div>

              <div className="space-y-6">
                {errorMessage && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-200">
                    {errorMessage}
                  </div>
                )}
                <div className="flex items-center justify-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-amber-200">
                  <ShieldCheck size={14} />
                  Email & Password
                </div>

                {/* Email / Password Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-4">
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-amber-500 transition-colors" size={18} />
                      <input
                        type="email"
                        placeholder="Email Address"
                        required
                        disabled={isBusy}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 text-white placeholder-neutral-600 pl-12 pr-4 py-3 rounded-lg outline-none transition-all duration-300 font-light text-sm disabled:opacity-60"
                      />
                    </div>
                    
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-amber-500 transition-colors" size={18} />
                      <input
                        type="password"
                        placeholder="Password"
                        required
                        disabled={isBusy}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 text-white placeholder-neutral-600 pl-12 pr-4 py-3 rounded-lg outline-none transition-all duration-300 font-light text-sm disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isBusy}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span>
                      {isBusy && activeAction === 'email'
                        ? 'กำลังเข้าสู่ระบบ...'
                        : 'Sign In'}
                    </span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              </div>

              <div className="mt-8 text-center">
                <p className="text-[10px] text-neutral-600">
                  Use a Firebase user account to sign in.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
