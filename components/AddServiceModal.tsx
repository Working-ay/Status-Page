import React, { useState } from 'react';
import { X, Plus, Globe, Server, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ServiceConfig } from '../types';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (service: ServiceConfig) => void;
}

export const AddServiceModal: React.FC<AddServiceModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<'website' | 'vps' | 'api'>('website');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic URL formatting
    let formattedUrl = url;
    if (!url.startsWith('http')) {
      formattedUrl = `https://${url}`;
    }

    const newService: ServiceConfig = {
      id: name.replace(/\s+/g, '-').toLowerCase() + '-' + Date.now(),
      name,
      url: formattedUrl,
      displayUrl: formattedUrl.replace(/^https?:\/\//, ''),
      type
    };

    onAdd(newService);
    setName('');
    setUrl('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="glass-panel w-full max-w-md rounded-2xl shadow-2xl pointer-events-auto overflow-hidden bg-black/90">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h2 className="text-lg font-bold text-white tracking-tight">Add New Monitor</h2>
                <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Service Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Production VPS"
                    className="w-full glass-input rounded-lg px-4 py-3 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm placeholder:text-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">URL or IP Address</label>
                  <input 
                    type="text" 
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="e.g., 192.168.1.1"
                    className="w-full glass-input rounded-lg px-4 py-3 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm placeholder:text-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Service Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'website', icon: Globe, label: 'Website' },
                      { id: 'vps', icon: Server, label: 'VPS' },
                      { id: 'api', icon: Activity, label: 'API' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setType(t.id as any)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                          type === t.id 
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' 
                            : 'bg-zinc-900/50 border-transparent hover:bg-zinc-800 text-zinc-600'
                        }`}
                      >
                        <t.icon size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-wide">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4 text-sm tracking-wide"
                >
                  <Plus size={16} />
                  Start Monitoring
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};