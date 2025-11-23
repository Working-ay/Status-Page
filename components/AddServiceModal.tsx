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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-[#09090b] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl pointer-events-auto overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-bold text-white">Add New Monitor</h2>
                <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Service Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., My Production VPS"
                    className="w-full glass-input rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">URL or IP Address</label>
                  <input 
                    type="text" 
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="e.g., 192.168.1.1 or myapi.com"
                    className="w-full glass-input rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Service Type</label>
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
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                            : 'bg-white/5 border-transparent hover:bg-white/10 text-zinc-400'
                        }`}
                      >
                        <t.icon size={20} />
                        <span className="text-xs font-medium">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  <Plus size={18} />
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
