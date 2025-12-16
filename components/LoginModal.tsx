import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Fingerprint, ArrowRight, Mail, Lock, Chrome, Loader2 } from 'lucide-react';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulation logic for the demo:
    // If email contains "admin", log in as CEO. Otherwise, Developer.
    const role = email.toLowerCase().includes('admin') ? UserRole.ADMIN : UserRole.EMPLOYEE;

    setTimeout(() => {
      login(role);
      setLoading(false);
      onClose();
      if (role === UserRole.ADMIN) navigate('/admin');
      else navigate('/dashboard');
    }, 2000);
  };

  const handleSocialLogin = () => {
    setLoading(true);
    // Simulate social login default to User
    setTimeout(() => {
      login(UserRole.EMPLOYEE);
      setLoading(false);
      onClose();
      navigate('/dashboard');
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

            {loading ? (
              <div className="h-[400px] flex flex-col items-center justify-center space-y-6">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1], 
                    opacity: [0.5, 1, 0.5],
                    filter: ["blur(0px)", "blur(2px)", "blur(0px)"]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full"></div>
                  <Fingerprint size={80} className="text-amber-500 relative z-10" />
                </motion.div>
                <div className="text-center space-y-2">
                  <p className="text-white font-light tracking-widest text-lg">VERIFYING</p>
                  <p className="text-amber-500/60 text-xs font-mono uppercase">Biometric Handshake...</p>
                </div>
              </div>
            ) : (
              <div className="relative z-10">
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-medium text-white tracking-tight mb-2">Welcome Back</h2>
                  <p className="text-neutral-500 text-sm">Enter your credentials to access the lattice.</p>
                </div>

                <div className="space-y-4">
                  {/* Social Login */}
                  <button 
                    onClick={handleSocialLogin}
                    className="w-full bg-white text-black hover:bg-neutral-200 font-medium py-3 rounded-lg flex items-center justify-center gap-3 transition-all duration-300"
                  >
                    <Chrome size={18} />
                    <span className="text-sm">Continue with Google</span>
                  </button>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink mx-4 text-neutral-600 text-xs uppercase tracking-widest">Or</span>
                    <div className="flex-grow border-t border-white/10"></div>
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
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 text-white placeholder-neutral-600 pl-12 pr-4 py-3 rounded-lg outline-none transition-all duration-300 font-light text-sm"
                        />
                      </div>
                      
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-amber-500 transition-colors" size={18} />
                        <input
                          type="password"
                          placeholder="Password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 text-white placeholder-neutral-600 pl-12 pr-4 py-3 rounded-lg outline-none transition-all duration-300 font-light text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                       <button type="button" className="text-xs text-neutral-500 hover:text-amber-500 transition-colors">Forgot Password?</button>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all duration-300"
                    >
                      <span>Sign In</span>
                      <ArrowRight size={16} />
                    </button>
                  </form>
                </div>

                <div className="mt-8 text-center">
                   <p className="text-[10px] text-neutral-600">
                     <span className="block mb-1">DEMO CREDENTIALS:</span>
                     Type <span className="text-indigo-400 font-mono">admin</span> in email for CEO Dashboard.
                   </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
