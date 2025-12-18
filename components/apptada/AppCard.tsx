import React from 'react';
import { ArrowUpRight, Share2, Trash2 } from 'lucide-react';
import { WebApp } from './types';

interface AppCardProps {
  app: WebApp;
  onDelete?: (id: string) => void;
}

const AppCard: React.FC<AppCardProps> = ({ app, onDelete }) => {
  return (
    <div className="group relative bg-[#151725]/60 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/5 hover:border-cyan-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(0,240,255,0.2)] flex flex-col h-full overflow-hidden">
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-gray-900 flex-shrink-0 relative group-hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all">
            <img
              src={app.iconUrl}
              alt={app.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/5">
              <Share2 size={18} />
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(app.id)}
                className="p-2.5 text-gray-500 hover:text-white hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/40"
                title="ลบออกจาก Firestore"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold tracking-wider uppercase rounded-lg">
              {app.category}
            </span>
          </div>

          <h3 className="text-xl font-bold text-white mb-1 line-clamp-1 group-hover:text-cyan-300 transition-colors">
            {app.name}
          </h3>
          <p className="text-sm text-gray-400 font-medium mb-3">{app.tagline}</p>
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-6 font-light">
            {app.description}
          </p>
        </div>

        <div className="mt-auto pt-5 border-t border-white/5">
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex items-center justify-center w-full bg-white text-black font-bold py-3 px-4 rounded-xl transition-all duration-300 hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] overflow-hidden group/btn"
          >
            <span className="relative z-10 flex items-center">
              เปิดแอป
              <ArrowUpRight
                size={18}
                className="ml-2 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1"
              />
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AppCard;
