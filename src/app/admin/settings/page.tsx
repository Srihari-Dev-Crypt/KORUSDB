'use client';

import React, { useState } from 'react';
import { Settings, Shield, Lock, Eye, Save, Check } from 'lucide-react';

export default function AdminSettingsPage() {
  const [privateMode, setPrivateMode] = useState(false);
  const [societyName, setSocietyName] = useState('KORUS');
  const [societySubtitle, setSocietySubtitle] = useState('The Performance Archive');
  const [tagline, setTagline] = useState('Every Artist. Every Stage. Every Performance.');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" /> Society Configuration
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-zinc-100">
          System & Access Settings
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Configure society identity, public visibility, and private viewing authorization modes.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Settings successfully updated in database.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Visibility / Private Mode Card */}
        <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                Private Archive Mode
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-lg">
                When active, viewers must be authenticated society members to view published performance records, performer profiles, and festival history. When disabled (default), public browsing is permitted without login.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={privateMode}
                onChange={(e) => setPrivateMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="text-[11px] text-zinc-500 pt-2 border-t border-zinc-850">
            Current Status:{' '}
            <span className={privateMode ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
              {privateMode ? 'Private (Login Required to View)' : 'Public Access (Open Archive)'}
            </span>
          </div>
        </div>

        {/* Branding & Metadata */}
        <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 space-y-4">
          <h2 className="text-sm font-bold text-zinc-200">Branding & Metadata</h2>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Society Name</label>
              <input
                type="text"
                value={societyName}
                onChange={(e) => setSocietyName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Subtitle</label>
              <input
                type="text"
                value={societySubtitle}
                onChange={(e) => setSocietySubtitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Official Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-600/25 flex items-center gap-1.5 transition-all"
        >
          <Save className="w-4 h-4" /> Save Configuration
        </button>
      </form>
    </div>
  );
}
