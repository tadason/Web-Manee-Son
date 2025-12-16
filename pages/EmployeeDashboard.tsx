import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Terminal, GitPullRequest, Layout, MoreHorizontal } from 'lucide-react';
import { Project } from '../types';

const projects: Project[] = [
  { id: 1, name: "Core API Migration", status: "In Progress", progress: 78 },
  { id: 2, name: "Client: Stark Industries", status: "Review", progress: 95 },
  { id: 3, name: "Internal Tooling", status: "Completed", progress: 100 },
];

export const EmployeeDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen w-full pt-32 px-8 pb-12 z-10 relative">
      <header className="mb-12 max-w-7xl mx-auto border-b border-white/5 pb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-amber-500 font-mono text-xs uppercase tracking-widest">System Online</span>
          </div>
          <h1 className="text-4xl font-light text-white mb-2">Developer Console</h1>
          <p className="text-neutral-500">Logged in as {user?.name}. Sprint 42 Active.</p>
        </motion.div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Project Cards */}
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="group relative bg-neutral-900/60 hover:bg-neutral-800/80 backdrop-blur-md border border-white/5 hover:border-amber-500/30 rounded-lg p-6 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-8">
              <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-amber-500/20 transition-colors">
                <Terminal className="text-neutral-400 group-hover:text-amber-500 transition-colors" size={20} />
              </div>
              <button className="text-neutral-600 hover:text-white transition-colors">
                <MoreHorizontal size={20} />
              </button>
            </div>
            
            <h3 className="text-lg font-mono text-white mb-1">{project.name}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider ${
              project.status === 'Completed' ? 'bg-green-500/5 border-green-500/20 text-green-400' :
              project.status === 'Review' ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-400' :
              'bg-amber-500/5 border-amber-500/20 text-amber-500'
            }`}>
              {project.status}
            </span>

            <div className="mt-8">
              <div className="flex justify-between text-xs text-neutral-500 mb-2 font-mono">
                <span>Compiling...</span>
                <span>{project.progress}%</span>
              </div>
              <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 shadow-[0_0_10px_#fbbf24]" 
                  style={{ width: `${project.progress}%` }} 
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="bg-neutral-900/40 backdrop-blur-md border border-white/5 rounded-lg p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <GitPullRequest className="text-neutral-500" size={18} />
            <h3 className="text-lg font-medium text-white">Recent Commits</h3>
          </div>
          <div className="space-y-4">
             {[1,2,3].map((_, i) => (
               <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0 font-mono text-xs">
                 <span className="text-amber-500">#{Math.floor(Math.random() * 9000) + 1000}</span>
                 <p className="text-neutral-400 flex-1">Refactored main layout component</p>
                 <span className="text-neutral-600">12m ago</span>
               </div>
             ))}
          </div>
        </motion.div>

        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
           className="bg-gradient-to-br from-neutral-900/80 to-neutral-900/0 backdrop-blur-md border border-white/5 rounded-lg p-8 flex flex-col justify-center items-center text-center"
        >
           <Layout size={40} className="text-indigo-500 mb-4" />
           <h3 className="text-xl font-medium text-white">Ticket Queue Empty</h3>
           <p className="text-neutral-500 mt-2 max-w-xs text-sm">All urgent logic has been implemented. Ready for next architectural review.</p>
        </motion.div>
      </div>
    </div>
  );
};
