'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, Plus, Trash2, Edit3, Users, Search } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { DanceCrew } from '@/lib/supabase/types';

export default function AdminCrewsPage() {
  const [crews, setCrews] = useState<DanceCrew[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add Crew State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [danceStyle, setDanceStyle] = useState('');
  const [description, setDescription] = useState('');
  const [formedDate, setFormedDate] = useState('');

  useEffect(() => {
    async function load() {
      const data = await dataService.getCrews(false);
      setCrews(data);
      setLoading(false);
    }
    load();

    const handleUpdate = () => load();
    window.addEventListener('korus-data-updated', handleUpdate);
    return () => window.removeEventListener('korus-data-updated', handleUpdate);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await dataService.createCrew({
      name: name.trim(),
      dance_style: danceStyle.trim() || 'Urban Dance',
      description: description.trim() || null,
      formed_date: formedDate || undefined,
    });

    setName('');
    setDanceStyle('');
    setDescription('');
    setFormedDate('');
    setShowAddModal(false);
  };

  const handleSoftDelete = async (id: string, crewName: string) => {
    if (confirm(`Move crew "${crewName}" to Trash? (Past performance records remain intact)`)) {
      await dataService.softDeleteCrew(id);
    }
  };

  const filtered = crews.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.dance_style && c.dance_style.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-100">
            Dance Crew Management
          </h1>
          <p className="text-xs text-zinc-400">
            Maintain dance collectives, style categorizations, and historical rosters.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs shadow-md shadow-pink-600/25 transition-all"
        >
          <Plus className="w-4 h-4" /> Register Crew
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter crews by name or style..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-pink-500"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center text-zinc-500">Loading crews...</div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Crew Name</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Dance Style</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Formed Date</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Permanent ID</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="transition-colors">
                  <td className="font-semibold text-zinc-200 text-sm">
                    <Link href={`/crews/${c.id}`} className="hover:text-pink-400">
                      {c.name}
                    </Link>
                  </td>
                  <td>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-500/10 text-pink-300 border border-pink-500/20">
                      {c.dance_style || 'Urban'}
                    </span>
                  </td>
                  <td className="text-xs text-zinc-400">
                    {c.formed_date || '—'}
                  </td>
                  <td className="text-xs font-mono text-zinc-500">
                    {c.id.slice(0, 8)}...
                  </td>
                  <td className="text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        href={`/crews/${c.id}`}
                        className="px-2.5 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-xs font-medium text-zinc-300 border border-zinc-750"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => handleSoftDelete(c.id, c.name)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-850 transition-colors"
                        title="Move to Trash"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Crew Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-2xl">
            <h2 className="text-base font-bold text-zinc-100">Register Dance Crew</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Crew Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rhythm Collective"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Dance Style</label>
                <input
                  type="text"
                  value={danceStyle}
                  onChange={(e) => setDanceStyle(e.target.value)}
                  placeholder="Urban Hip-Hop, Popping & Locking, Contemporary..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Formed Date (Optional)</label>
                <input
                  type="date"
                  value={formedDate}
                  onChange={(e) => setFormedDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Founding history, signature choreo styles..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-xs font-semibold text-white shadow-md shadow-pink-600/25"
                >
                  Register Crew
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
