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
        if (!hasData || isLoading) return 'animate-pulse bg-zinc-600';
        if (isOffline) return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
        return 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]';
      }
      return 'bg-emerald-500/30';
    });
  }, [isOnline, isOffline, isLoading, hasData]);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-xl overflow-hidden mb-4 transition-all duration-300 hover:bg-white/[0.06]"
    >
      <div 
        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-5">
          {/* Icon Box */}
          <div className={clsx(
            "relative w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-500",
            hasData && isOnline ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40" : 
            hasData && isOffline ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/40" : "bg-zinc-800/50 text-zinc-500"
          )}>
             {hasData && isOnline && <div className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-full" />}
             {(!hasData && isLoading) ? (
                <Loader2 size={22} className="animate-spin text-zinc-400" />
             ) : (
                <Icon size={22} className="relative z-10" />
             )}
          </div>

          <div>
            <h3 className="font-bold text-zinc-100 text-lg leading-tight">{config.name}</h3>
            <a 
               href={config.url} 
               target="_blank" 
               rel="noreferrer"
               onClick={(e) => e.stopPropagation()}
               className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors flex items-center gap-1 mt-1"
            >
              {config.displayUrl} <Link size={10} />
            </a>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
           <div className="flex items-center gap-3">
              {hasData && isOnline && (
                <div className="flex items-center gap-1.5 bg-black/40 rounded-full px-3 py-1 border border-white/5">
                  <Activity size={12} className="text-zinc-500" />
                  <span className={clsx("text-xs font-mono font-medium", 
                    data.latency < 150 ? "text-emerald-400" : "text-amber-400"
                  )}>
                    {data.latency}ms
                  </span>
                </div>
              )}
              <div className={clsx(
                "px-3 py-1 rounded-full text-xs font-bold tracking-wide border transition-colors duration-300",
                hasData && isOnline ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : 
                hasData && isOffline ? "bg-red-500/10 border-red-500/20 text-red-400" : 
                "bg-zinc-800 border-zinc-700 text-zinc-400"
              )}>
                {(!hasData && isLoading) ? 'CHECKING...' : (!hasData) ? 'NO DATA' : isOnline ? 'OPERATIONAL' : 'OFFLINE'}
              </div>
           </div>

           {/* History Bar */}
           <div className="hidden sm:flex items-center gap-[3px] h-6 opacity-80">
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
        className="overflow-hidden border-t border-white/5 bg-black/20"
      >
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
           <div className="space-y-4">
             <div>
                <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Endpoint Status</span>
                <div className="mt-1 flex items-center gap-2 text-zinc-300">
                   {(!hasData) ? (
                      isLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin text-zinc-500" />
                          <span className="text-zinc-500">Verifying endpoint...</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={16} className="text-amber-500" />
                          <span className="text-amber-500">Monitor Unavailable</span>
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
                        <span className="text-red-400">Connection Failed (Offline)</span>
                      </>
                   )}
                </div>
             </div>
             <div>
                <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Last Checked</span>
                <div className="mt-1 text-zinc-300 font-mono">
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
                  className="text-red-400 hover:text-red-300 text-xs underline underline-offset-4 opacity-60 hover:opacity-100 transition-opacity"
                >
                  Remove from Monitor
                </button>
              )}
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
};