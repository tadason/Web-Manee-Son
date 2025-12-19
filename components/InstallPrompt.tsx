import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share, Download } from 'lucide-react';

type InstallPromptProps = {
  variant?: 'floating' | 'inline';
  label?: string;
};

export const InstallPrompt = ({ variant = 'floating', label = 'ติดตั้งในเครื่อง' }: InstallPromptProps) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed/standalone
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone;
    setIsStandalone(standalone);
    if (standalone) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      if (variant === 'floating') {
        const timer = setTimeout(() => setShowPrompt(true), 3000);
        return () => clearTimeout(timer);
      }
      return;
    } else {
      // Handle Android/Desktop "Add to Home Screen" event
      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        if (variant === 'floating') {
          setShowPrompt(true);
        }
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }
  }, [variant]);

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

  if (variant === 'inline' && isStandalone) {
    return null;
  }

  if (variant === 'inline') {
    const canInstall = isIOS || !!deferredPrompt;
    return (
      <button
        type="button"
        onClick={isIOS ? () => setShowPrompt(false) : handleInstallClick}
        disabled={!canInstall}
        className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber-200 transition-colors hover:border-amber-400/60 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Install"
      >
        {isIOS ? <Share size={14} /> : <Download size={14} />}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 0.9 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", damping: 18, stiffness: 260 }}
          className="fixed bottom-5 right-5 z-50"
        >
          <div className="relative">
            {isIOS ? (
              <button
                onClick={() => setShowPrompt(false)}
                className="relative w-10 h-10 rounded-full bg-neutral-900/70 border border-white/10 backdrop-blur-xl flex items-center justify-center text-amber-400 hover:text-amber-300 hover:border-amber-400/40 transition-colors"
                aria-label="Install"
              >
                <Share size={16} />
              </button>
            ) : (
              <button
                onClick={handleInstallClick}
                className="relative w-10 h-10 rounded-full bg-neutral-900/70 border border-white/10 backdrop-blur-xl flex items-center justify-center text-amber-400 hover:text-amber-300 hover:border-amber-400/40 transition-colors"
                aria-label="Install"
              >
                <Download size={16} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
