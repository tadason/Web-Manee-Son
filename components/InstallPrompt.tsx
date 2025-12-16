import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share, X, Download, ShieldCheck } from 'lucide-react';

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
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50"
        >
          <div className="bg-neutral-900/80 backdrop-blur-2xl border border-amber-500/20 rounded-xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

            <button 
              onClick={() => setShowPrompt(false)}
              className="absolute top-3 right-3 text-neutral-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center border border-white/10 shrink-0">
                 <ShieldCheck className="text-amber-500" size={24} />
              </div>
              
              <div className="flex-1">
                <h3 className="text-white font-medium text-sm mb-1">Install Application</h3>
                <p className="text-neutral-400 text-xs leading-relaxed mb-3">
                  {isIOS 
                    ? "For the full immersive experience, add this app to your home screen." 
                    : "Install Manee&Son for a faster, fullscreen experience."}
                </p>

                {isIOS ? (
                  <div className="flex flex-col gap-2 text-xs text-neutral-300 bg-white/5 p-3 rounded border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 flex items-center justify-center bg-neutral-700 rounded text-[10px]">1</span>
                      <span>Tap the <Share size={12} className="inline mx-1 text-blue-400" /> <strong>Share</strong> button</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 flex items-center justify-center bg-neutral-700 rounded text-[10px]">2</span>
                      <span>Select <strong>Add to Home Screen</strong></span>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={handleInstallClick}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold py-2.5 rounded transition-colors uppercase tracking-wider"
                  >
                    <Download size={14} />
                    Install App
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};