import React from 'react';
import { Activity } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-slate-800 bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary blur opacity-50 rounded-full"></div>
            <div className="relative bg-background p-2 rounded-lg border border-slate-700">
              <Activity className="text-primary w-6 h-6" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              NexStatus
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">System Monitor</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-emerald-400">Systems Operational</span>
           </div>
        </div>
      </div>
    </header>
  );
};