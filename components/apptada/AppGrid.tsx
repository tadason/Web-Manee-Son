import React from 'react';
import { Ghost } from 'lucide-react';
import AppCard from './AppCard';
import { WebApp } from './types';

interface AppGridProps {
  apps: WebApp[];
  loading: boolean;
  onDeleteApp?: (id: string) => void;
}

const AppGrid: React.FC<AppGridProps> = ({ apps, loading, onDeleteApp }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 py-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded-3xl p-6 shadow-sm border border-white/5 h-96 animate-pulse">
            <div className="w-20 h-20 bg-white/10 rounded-2xl mb-4"></div>
            <div className="h-6 bg-white/10 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-white/5 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              <div className="h-2 bg-white/5 rounded w-full"></div>
              <div className="h-2 bg-white/5 rounded w-full"></div>
              <div className="h-2 bg-white/5 rounded w-2/3"></div>
            </div>
            <div className="mt-12 h-12 bg-white/10 rounded-xl w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center relative z-10">
        <div className="relative w-32 h-32 mb-8">
          <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full animate-pulse"></div>
          <div className="relative w-full h-full bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm">
            <Ghost size={48} className="text-gray-400" />
          </div>
        </div>
        <h3 className="text-3xl font-bold text-white mb-3">Space Empty</h3>
        <p className="text-gray-400 max-w-md font-light">
          เริ่มสร้าง Collection ของคุณโดยกดปุ่ม "เพิ่ม Web App" ด้านบน
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-8">
      {apps.map((app) => (
        <AppCard key={app.id} app={app} onDelete={onDeleteApp} />
      ))}
    </div>
  );
};

export default AppGrid;
