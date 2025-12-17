import React from 'react';
import { Sparkles, Search, Plus } from 'lucide-react';

interface NavbarProps {
  onOpenModal: () => void;
  userAvatar?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenModal, userAvatar }) => {
  const avatarUrl =
    userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=AppTada';

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0C15]/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(112,0,255,0.5)] group-hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all duration-500">
                <Sparkles size={22} className="text-white" />
              </div>
              <span className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight group-hover:from-cyan-400 group-hover:to-purple-400 transition-all duration-500">
                AppTada Store
              </span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden md:flex relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
              </div>
              <input
                type="text"
                placeholder="Search apps..."
                className="pl-11 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent focus:bg-white/10 outline-none transition-all w-64 backdrop-blur-sm"
              />
            </div>

            <button
              onClick={onOpenModal}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md flex items-center justify-center text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-black/20 group relative overflow-hidden"
              title="เพิ่ม Web App"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <div className="h-10 w-10 rounded-full p-[2px] bg-gradient-to-tr from-cyan-500 to-purple-600">
              <div className="h-full w-full rounded-full overflow-hidden bg-black">
                <img
                  src={avatarUrl}
                  alt="User"
                  className="opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
