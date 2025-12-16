import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Users, Briefcase, CreditCard, Activity, LogOut, Globe } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Tue', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Wed', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Thu', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Fri', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Sat', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Sun', uv: 3490, pv: 4300, amt: 2100 },
];

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="bg-neutral-900/80 backdrop-blur-xl border border-white/5 rounded-sm p-6 relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-bl-full group-hover:opacity-20 transition-opacity`} />
    <div className="flex justify-between items-start mb-4">
        <div className="text-neutral-400"><Icon size={20} /></div>
        <div className="text-xs font-mono text-green-400 bg-green-900/20 px-1 py-0.5 rounded">+4.2%</div>
    </div>
    <div className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</div>
    <div className="text-xs text-neutral-500 uppercase tracking-widest font-mono">{label}</div>
  </motion.div>
);

export const AdminPortal = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen w-full pt-32 px-8 pb-12 z-10 relative">
      <header className="mb-12 max-w-7xl mx-auto flex justify-between items-end border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-indigo-400">
             <Globe size={14} />
             <span className="text-xs font-mono uppercase tracking-widest">Global Access Granted</span>
          </div>
          <h1 className="text-4xl font-light text-white mb-2">
            CEO <span className="text-indigo-400 font-serif italic">Dashboard</span>
          </h1>
          <p className="text-neutral-500">Full visibility: Financials, Personnel, and Projects.</p>
        </div>
        <div className="flex items-center gap-4">
            <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm text-sm transition-colors shadow-lg shadow-indigo-500/20 font-medium tracking-wide">
            Download Report
            </button>
            <button 
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-sm border border-neutral-800 text-neutral-400 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-300 text-sm font-mono uppercase tracking-wider group"
            >
            <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
            Exit
            </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={CreditCard} label="Billable Hours" value="1,240h" color="from-indigo-500 to-purple-500" />
        <StatCard icon={Briefcase} label="Active Clients" value="14" color="from-amber-500 to-orange-500" />
        <StatCard icon={Users} label="Dev Utilization" value="88%" color="from-blue-500 to-cyan-500" />
        <StatCard icon={Activity} label="Server Health" value="100%" color="from-emerald-500 to-green-500" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-neutral-900/80 backdrop-blur-xl border border-white/5 rounded-sm p-8 h-[400px]">
          <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-4 bg-indigo-500"></span>
            Agency Revenue Flow
          </h3>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="name" stroke="#ffffff20" tick={{fontSize: 12, fill: '#737373'}} axisLine={false} tickLine={false} />
              <YAxis stroke="#ffffff20" tick={{fontSize: 12, fill: '#737373'}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                itemStyle={{ color: '#818cf8' }}
              />
              <Area type="monotone" dataKey="uv" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorUv)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Resource Allocation */}
        <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/5 rounded-sm p-8">
          <h3 className="text-lg font-medium text-white mb-6">Staff Allocation</h3>
          <div className="space-y-6">
            {[
                { role: "Backend Architects", count: 4, color: "bg-indigo-500" },
                { role: "Frontend Artisans", count: 3, color: "bg-amber-500" },
                { role: "DevOps", count: 2, color: "bg-emerald-500" }
            ].map((team, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm text-neutral-400 mb-2">
                    <span>{team.role}</span>
                    <span className="text-white">{team.count} active</span>
                </div>
                <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div className={`h-full ${team.color} opacity-80`} style={{ width: `${(team.count / 9) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-12 py-3 rounded-sm border border-neutral-800 text-neutral-500 text-xs hover:bg-neutral-800 hover:text-white transition-all uppercase tracking-widest">
            Manage Personnel
          </button>
        </div>
      </div>
    </div>
  );
};