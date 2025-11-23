import React, { useEffect, useState, useCallback } from 'react';
import { StatusCard } from './components/StatusCard';
import { AddServiceModal } from './components/AddServiceModal';
import { StatusResponse, ServiceConfig } from './types';
import { CheckCircle, AlertTriangle, Plus, Activity, History, Server, WifiOff, RefreshCw, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

// Default configuration
const DEFAULT_SERVICES: ServiceConfig[] = [
  { 
    id: 'AyrixMC',
    name: 'AyrixMC', 
    url: 'https://ayrixmc.fun', 
    displayUrl: 'ayrixmc.fun', 
    type: 'website' 
  },
  { 
    id: 'KS Cloud Host',
    name: 'KS Cloud Host', 
    url: 'https://kscloudhost.net', 
    displayUrl: 'kscloudhost.net', 
    type: 'website' 
  },
  { 
    id: 'KS Console',
    name: 'KS Console', 
    url: 'https://console.kscloudhost.net', 
    displayUrl: 'console.kscloudhost.net', 
    type: 'api' 
  }
];

const FETCH_INTERVAL = 15000; // Check every 15 seconds

// Mock Data Generator for Demo Mode
const generateMockData = (services: ServiceConfig[]): StatusResponse => {
  const now = Date.now();
  const result: StatusResponse = {};
  services.forEach(s => {
    // Randomize slightly for live effect
    const isOnline = Math.random() > 0.05; 
    result[s.id] = {
        status: isOnline ? 'online' : 'offline',
        latency: isOnline ? Math.floor(Math.random() * 80) + 20 : 0,
        lastChecked: now
    };
  });
  return result;
};

function App() {
  // Merge defaults with local storage
  const [services, setServices] = useState<ServiceConfig[]>(() => {
    const saved = localStorage.getItem('nexstatus_services');
    if (saved) {
      return JSON.parse(saved);
    }
    return DEFAULT_SERVICES;
  });

  const [statusData, setStatusData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [connectionError, setConnectionError] = useState<boolean>(false);

  // Persist services when they change
  useEffect(() => {
    localStorage.setItem('nexstatus_services', JSON.stringify(services));
  }, [services]);

  const handleAddService = (newService: ServiceConfig) => {
    setServices(prev => [...prev, newService]);
    // Allow state update to propagate before fetching
    setTimeout(() => {
        setLoading(true); 
        fetchStatus([...services, newService]); 
    }, 100);
  };

  const handleDeleteService = (id: string) => {
    if (confirm('Are you sure you want to stop monitoring this service?')) {
      setServices(prev => prev.filter(s => s.id !== id));
    }
  };

  const fetchStatus = useCallback(async (currentServices = services) => {
    if (currentServices.length === 0) {
        setLoading(false);
        return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout for frontend fetch

    try {
      // Prepare payload for backend
      const targets = currentServices.map(s => ({ id: s.id, url: s.url }));
      
      const response = await fetch('/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targets }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.status === 404) {
          throw new Error("API_NOT_FOUND");
      }

      if (!response.ok) {
          throw new Error(`HTTP_ERROR_${response.status}`);
      }
      
      const data: StatusResponse = await response.json();
      setStatusData(data);
      setIsUsingMock(false);
      setConnectionError(false);
    } catch (err: any) {
      console.warn("Monitor Fetch Error (Switching to Mock Data):", err.message);
      
      // FALLBACK TO MOCK DATA IMMEDIATELY
      // This ensures the UI never gets stuck on "Verifying..."
      setStatusData(generateMockData(currentServices));
      setIsUsingMock(true);
      setConnectionError(true);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, [services]);

  // Interval check
  useEffect(() => {
    fetchStatus();
    const intervalId = setInterval(() => fetchStatus(), FETCH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchStatus]);

  const allSystemsNormal = !statusData || Object.values(statusData).every(s => s.status === 'online');

  return (
    <div className="min-h-screen font-sans pb-20 relative overflow-x-hidden bg-black text-zinc-300">
      
      {/* Navbar */}
      <nav className="w-full border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group">
               <div className="absolute inset-0 bg-emerald-500 blur-md opacity-20 rounded-full group-hover:opacity-40 transition-opacity" />
               <Zap className="relative text-emerald-400 w-5 h-5" fill="currentColor" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">NexStatus</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
               onClick={() => setIsModalOpen(true)}
               className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 text-sm font-medium transition-all text-emerald-400 hover:text-emerald-300"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Monitor</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-12">
        
        {/* Header Status */}
        <div className="text-center py-12 relative">
           {/* Background glow */}
           <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 blur-[120px] rounded-full pointer-events-none transition-colors duration-700 ${allSystemsNormal ? 'bg-emerald-500/5' : 'bg-red-500/5'}`} />

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <div className={`inline-flex items-center justify-center p-4 rounded-full mb-6 border shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-md transition-colors duration-500 ${
                allSystemsNormal 
                ? 'bg-black/40 border-emerald-500/20 shadow-emerald-500/5' 
                : 'bg-black/40 border-red-500/20 shadow-red-500/5'
            }`}>
              {loading && !statusData ? (
                  <RefreshCw className="w-10 h-10 text-zinc-500 animate-spin" strokeWidth={1.5} />
              ) : allSystemsNormal ? (
                <CheckCircle className="w-10 h-10 text-emerald-500" strokeWidth={1.5} />
              ) : (
                <AlertTriangle className="w-10 h-10 text-red-500" strokeWidth={1.5} />
              )}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4 drop-shadow-2xl">
              {loading && !statusData ? "Initializing..." : allSystemsNormal ? "All systems operational" : "Service disruption detected"}
            </h1>
            <div className="flex items-center justify-center gap-3 text-sm">
              <p className="text-zinc-500 flex items-center gap-2">
                 <span>Last updated {lastUpdated.toLocaleTimeString()}</span>
              </p>
              
              {isUsingMock && (
                <span className="flex items-center gap-1.5 text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 text-xs font-medium">
                  <WifiOff size={12} /> Demo Mode
                </span>
              )}
              
              {connectionError && !isUsingMock && (
                  <span className="text-red-500 text-xs bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">
                      Backend Unreachable
                  </span>
              )}
            </div>
          </motion.div>
        </div>

        {/* Services Grid */}
        <div className="mb-16 relative z-10">
           {services.map((service) => (
             <StatusCard 
               key={service.id}
               config={service}
               data={statusData ? statusData[service.id] : undefined}
               isLoading={loading && !statusData}
               onDelete={handleDeleteService}
             />
           ))}
           
           {services.length === 0 && (
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 glass-panel rounded-xl border-dashed border-zinc-800"
             >
               <Server className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
               <p className="text-zinc-600 text-lg">No services are being monitored.</p>
               <button onClick={() => setIsModalOpen(true)} className="text-emerald-500 hover:text-emerald-400 font-medium mt-2 transition-colors">
                 Add your first service
               </button>
             </motion.div>
           )}
        </div>

        {/* Incidents Section */}
        {services.length > 0 && (
            <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                <History className="text-zinc-600" />
                Recent Activity
            </h2>

            <div className="relative pl-8 border-l border-white/5 space-y-10">
                <div className="relative">
                <div className="absolute -left-[37px] top-1 h-5 w-5 rounded-full border-4 border-[#000000] bg-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                <div className="text-zinc-500 text-sm font-medium mb-2">Live Feed</div>
                <div className="glass-panel rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
                    <div className="flex items-center gap-3 mb-2">
                    <Activity className="text-emerald-500 w-5 h-5" />
                    <h3 className="font-semibold text-zinc-200">Monitoring Active</h3>
                    </div>
                    <p className="text-zinc-500 leading-relaxed text-sm">
                    Real-time checks are currently running for {services.length} services. 
                    Next update in {FETCH_INTERVAL / 1000} seconds.
                    </p>
                </div>
                </div>
            </div>
            </div>
        )}

      </main>

      <AddServiceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddService} 
      />

      <footer className="text-center py-12 text-zinc-800 text-xs tracking-[0.2em] uppercase font-medium">
        <p className="hover:text-zinc-600 transition-colors">NexStatus Engine &bull; Developer AyrixMC</p>
      </footer>
    </div>
  );
}

export default App;