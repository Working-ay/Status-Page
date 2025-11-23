import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Server, Activity, Link, ShieldCheck, XOctagon, Loader2, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ServiceConfig, ServiceData } from '../types';

interface StatusCardProps {
  config: ServiceConfig;
  data?: ServiceData;
  isLoading: boolean;
  onDelete?: (id: string) => void;
}

export const StatusCard: React.FC<StatusCardProps> = ({ config, data, isLoading, onDelete }) => {
  const [expanded, setExpanded] = React.useState(false);
  
  // Determine logic states
  const isOnline = data?.status === 'online';
  const isOffline = data?.status === 'offline';
  const hasData = !!data;
  
  const Icon = config.type === 'vps' ? Server : config.type === 'api' ? Activity : Globe;

  // Generate visual bars
  const historyBars = React.useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => {
      const isLast = i === 44;
      if (isLast) {
        if (!hasData || isLoading) return 'animate-pulse bg-zinc-700';
        if (isOffline) return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]';
        return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
      }
      return 'bg-zinc-800/50';
    });
  }, [isOnline, isOffline, isLoading, hasData]);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-xl overflow-hidden mb-4 transition-all duration-300 hover:bg-white/[0.03]"
    >
      <div 
        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-5">
          {/* Icon Box */}
          <div className={clsx(
            "relative w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-500",
            hasData && isOnline ? "bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20" : 
            hasData && isOffline ? "bg-red-500/10 text-red-500 ring-1 ring-red-500/20" : "bg-zinc-900 text-zinc-600"
          )}>
             {hasData && isOnline && <div className="absolute inset-0 bg-emerald-500/10 blur-md rounded-full" />}
             {(!hasData && isLoading) ? (
                <Loader2 size={22} className="animate-spin text-zinc-600" />
             ) : (
                <Icon size={22} className="relative z-10" />
             )}
          </div>

          <div>
            <h3 className="font-bold text-zinc-200 text-lg leading-tight tracking-tight">{config.name}</h3>
            <a 
               href={config.url} 
               target="_blank" 
               rel="noreferrer"
               onClick={(e) => e.stopPropagation()}
               className="text-xs text-zinc-600 hover:text-emerald-500 transition-colors flex items-center gap-1 mt-1 font-medium"
            >
              {config.displayUrl} <Link size={10} />
            </a>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
           <div className="flex items-center gap-3">
              {hasData && isOnline && (
                <div className="flex items-center gap-1.5 bg-black/40 rounded-full px-3 py-1 border border-white/5">
                  <Activity size={12} className="text-zinc-600" />
                  <span className={clsx("text-xs font-mono font-medium", 
                    data.latency < 150 ? "text-emerald-500" : "text-amber-500"
                  )}>
                    {data.latency}ms
                  </span>
                </div>
              )}
              <div className={clsx(
                "px-3 py-1 rounded-full text-xs font-bold tracking-wide border transition-colors duration-300",
                hasData && isOnline ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500" : 
                hasData && isOffline ? "bg-red-500/5 border-red-500/10 text-red-500" : 
                "bg-zinc-900 border-zinc-800 text-zinc-500"
              )}>
                {(!hasData && isLoading) ? 'CHECKING...' : (!hasData) ? 'NO DATA' : isOnline ? 'OPERATIONAL' : 'OFFLINE'}
              </div>
           </div>

           {/* History Bar */}
           <div className="hidden sm:flex items-center gap-[3px] h-6 opacity-60">
             {historyBars.map((className, idx) => (
                <div key={idx} className={twMerge("w-1.5 h-full rounded-[1px] transition-colors duration-500", className)} />
             ))}
           </div>
        </div>
      </div>
      
      {/* Expanded Details */}
      <motion.div 
        initial={false}
        animate={{ height: expanded ? 'auto' : 0 }}
        className="overflow-hidden border-t border-white/5 bg-black/40"
      >
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
           <div className="space-y-4">
             <div>
                <span className="text-zinc-600 text-[10px] uppercase tracking-widest font-bold">Endpoint Status</span>
                <div className="mt-1 flex items-center gap-2 text-zinc-400">
                   {(!hasData) ? (
                      isLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin text-zinc-600" />
                          <span className="text-zinc-500">Verifying endpoint...</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={16} className="text-amber-600" />
                          <span className="text-amber-600">Monitor Unavailable</span>
                        </>
                      )
                   ) : isOnline ? (
                      <>
                        <ShieldCheck size={16} className="text-emerald-500" />
                        <span>Secure & Reachable</span>
                      </>
                   ) : (
                      <>
                        <XOctagon size={16} className="text-red-500" />
                        <span className="text-red-500">Connection Failed (Offline)</span>
                      </>
                   )}
                </div>
             </div>
             <div>
                <span className="text-zinc-600 text-[10px] uppercase tracking-widest font-bold">Last Checked</span>
                <div className="mt-1 text-zinc-400 font-mono text-xs">
                   {hasData ? new Date(data.lastChecked).toLocaleString() : 'Pending first check...'}
                </div>
             </div>
           </div>
           
           <div className="flex items-end justify-end">
              {onDelete && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(config.id);
                  }}
                  className="text-red-900 hover:text-red-500 text-xs font-semibold tracking-wide opacity-60 hover:opacity-100 transition-all uppercase"
                >
                  Remove Monitor
                </button>
              )}
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
};