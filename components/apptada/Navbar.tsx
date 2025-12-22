import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Plus } from 'lucide-react';

interface NavbarProps {
  onOpenModal: () => void;
  userAvatar?: string;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenModal, userAvatar, onLogout }) => {
  const avatarUrl =
    userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=AppTada';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 rounded-b-3xl border-b border-gray-100 bg-white/95 px-2">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(112,0,255,0.5)] group-hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all duration-500">
                <Sparkles size={22} className="text-white" />
              </div>
              <span className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500 tracking-tight group-hover:from-cyan-500 group-hover:to-purple-500 transition-all duration-500">
                AppTada Store
              </span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <button
              onClick={onOpenModal}
              className="w-10 h-10 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-900/10 flex items-center justify-center text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/20 group relative overflow-hidden"
              title="เพิ่ม Web App"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="h-10 w-10 rounded-full p-[2px] bg-gradient-to-tr from-cyan-500 to-purple-600"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                title="Profile"
              >
                <div className="h-full w-full rounded-full overflow-hidden bg-white">
                  <img
                    src={avatarUrl}
                    alt="User"
                    className="opacity-90 hover:opacity-100 transition-opacity"
                  />
                </div>
              </button>

              {menuOpen && onLogout && (
                <div className="absolute right-0 mt-3 w-40 rounded-xl border border-white/10 bg-neutral-900/95 backdrop-blur-xl shadow-xl py-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-neutral-200 hover:bg-white/5 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
