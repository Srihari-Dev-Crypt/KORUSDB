'use client';

import React, { useEffect, useState } from 'react';
import { Wifi, RefreshCw } from 'lucide-react';

export function RealtimeStatusIndicator() {
  const [status, setStatus] = useState<'connected' | 'syncing' | 'offline'>('connected');
  const [lastSynced, setLastSynced] = useState<string>('Just now');

  useEffect(() => {
    const handleUpdate = () => {
      setStatus('syncing');
      setTimeout(() => {
        setStatus('connected');
        setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }, 400);
    };

    window.addEventListener('korus-data-updated', handleUpdate);
    window.addEventListener('online', () => setStatus('connected'));
    window.addEventListener('offline', () => setStatus('offline'));

    return () => {
      window.removeEventListener('korus-data-updated', handleUpdate);
    };
  }, []);

  const triggerManualSync = () => {
    setStatus('syncing');
    window.dispatchEvent(new Event('korus-data-updated'));
    setTimeout(() => {
      setStatus('connected');
      setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 500);
  };

  return (
    <div className="flex items-center gap-2.5 text-xs text-zinc-400 bg-zinc-900/80 border border-zinc-800/80 px-3 py-1.5 rounded-full shadow-inner">
      <span className="relative flex h-2 w-2">
        {status === 'connected' && (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </>
        )}
        {status === 'syncing' && (
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400 animate-pulse"></span>
        )}
        {status === 'offline' && (
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        )}
      </span>

      <span className="hidden sm:inline font-medium">
        {status === 'connected' && 'Live Sync Active'}
        {status === 'syncing' && 'Syncing...'}
        {status === 'offline' && 'Offline'}
      </span>

      <span className="text-zinc-600 hidden md:inline">|</span>
      <span className="text-zinc-500 text-[11px] hidden md:inline">{lastSynced}</span>

      <button
        onClick={triggerManualSync}
        title="Sync Database Now"
        className="text-zinc-400 hover:text-zinc-200 transition-colors p-0.5"
      >
        <RefreshCw className={`w-3 h-3 ${status === 'syncing' ? 'animate-spin text-purple-400' : ''}`} />
      </button>
    </div>
  );
}
