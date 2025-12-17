import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share, X, Download } from 'lucide-react';

export const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if app is already installed/standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      // Show iOS prompt after a small delay
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    } else {
      // Handle Android/Desktop "Add to Home Screen" event
      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
        setShowPrompt(false);
      });
    }
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 18, stiffness: 260 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
            {isIOS ? (
              <button
                onClick={() => setShowPrompt(false)}
                className="relative w-14 h-14 rounded-full bg-neutral-900/80 border border-amber-500/30 backdrop-blur-xl flex items-center justify-center text-amber-400 hover:text-amber-300 hover:border-amber-400/60 transition-all shadow-[0_0_25px_rgba(251,191,36,0.25)]"
                aria-label="Install"
              >
                <Share size={18} />
              </button>
            ) : (
              <button
                onClick={handleInstallClick}
                className="relative w-14 h-14 rounded-full bg-neutral-900/80 border border-amber-500/30 backdrop-blur-xl flex items-center justify-center text-amber-400 hover:text-amber-300 hover:border-amber-400/60 transition-all shadow-[0_0_25px_rgba(251,191,36,0.25)]"
                aria-label="Install"
              >
                <Download size={18} />
              </button>
            )}
            <button
              onClick={() => setShowPrompt(false)}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-neutral-900/90 border border-white/10 text-neutral-400 hover:text-white transition-colors flex items-center justify-center"
              aria-label="Dismiss"
            >
              <X size={12} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
