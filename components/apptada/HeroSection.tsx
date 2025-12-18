import React from 'react';
import { Plus, Zap } from 'lucide-react';

interface HeroSectionProps {
  onOpenModal: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onOpenModal }) => {
  return (
    <div className="relative overflow-hidden pt-24 pb-20 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-fade-in-up">
          <Zap size={14} className="text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-semibold tracking-wider uppercase text-gray-300">
            Web App Explorer
          </span>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-5">
          <button
            onClick={onOpenModal}
            className="group relative px-8 py-4 bg-white text-black text-lg font-bold rounded-2xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-300 to-purple-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
            <span className="relative flex items-center justify-center">
              <Plus className="mr-2" size={24} />
              เพิ่ม Web App
            </span>
          </button>

          <a
            href="#browse"
            className="px-8 py-4 border border-white/20 text-lg font-medium rounded-2xl text-white hover:bg-white/10 hover:border-white/40 transition-all backdrop-blur-sm"
          >
            สำรวจแอป
          </a>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
