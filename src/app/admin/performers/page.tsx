'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, Search, Plus, GitMerge, Trash2, 
  Edit3, AlertTriangle, Check, ShieldCheck 
} from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { Performer } from '@/lib/supabase/types';
import { findPotentialDuplicates } from '@/lib/security';

export default function AdminPerformersPage() {
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // New Performer Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [stageName, setStageName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [departments, setDepartments] = useState<string[]>(['music']);

  // Duplicate Merging State
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [duplicateSuggestions, setDuplicateSuggestions] = useState<Array<{ id: string; full_name: string; score: number }>>([]);
  const [mergeFeedback, setMergeFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const data = await dataService.getPerformers(false);
      setPerformers(data);
      setLoading(false);
    }
    load();

    const handleUpdate = () => load();
    window.addEventListener('korus-data-updated', handleUpdate);
    return () => window.removeEventListener('korus-data-updated', handleUpdate);
  }, []);

  const handleCreatePerformer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    await dataService.createPerformer({
      full_name: fullName.trim(),
      stage_name: stageName.trim() || null,
      bio: bio.trim() || null,
      avatar_url: avatarUrl.trim() || null,
      departments,
    });

    setFullName('');
    setStageName('');
    setBio('');
    setAvatarUrl('');
    setShowAddModal(false);
  };

  const handleCheckDuplicates = (performer: Performer) => {
    setSelectedSourceId(performer.id);
    const existing = performers.filter(p => p.id !== performer.id);
    const matches = findPotentialDuplicates(performer.full_name, existing);
    setDuplicateSuggestions(matches);
    if (matches.length > 0) setSelectedTargetId(matches[0].id);
    setShowMergeModal(true);
  };

  const handleMergeSubmit = async () => {
    if (!selectedSourceId || !selectedTargetId) return;
    setMergeFeedback('Processing merge transaction...');
    const success = await dataService.mergePerformers(selectedSourceId, selectedTargetId);
    if (success) {
      setMergeFeedback('Records merged successfully! Source performer has been archived.');
      setTimeout(() => {
        setShowMergeModal(false);
        setMergeFeedback(null);
      }, 1000);
    }
  };

  const handleSoftDelete = async (id: string, name: string) => {
    if (confirm(`Move performer "${name}" to Trash? (Can be restored from Trash)`)) {
      await dataService.softDeletePerformer(id);
    }
  };

  const filtered = performers.filter(p =>
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.stage_name && p.stage_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-100">
            Performer Directory & Merging
          </h1>
          <p className="text-xs text-zinc-400">
            Maintain unique artist identifiers, detect duplicate spelling entries, and merge records.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-600/25 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Performer
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter performers by name or stage alias..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Performers Table */}
      {loading ? (
        <div className="py-20 text-center text-zinc-500">Loading performer list...</div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Artist</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Permanent ID</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Departments</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Registered Date</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="transition-colors">
                  <td className="font-semibold text-zinc-200 text-sm">
                    <Link href={`/performers/${p.id}`} className="hover:text-purple-400">
                      {p.full_name}
                    </Link>
                    {p.stage_name && (
                      <span className="text-xs text-zinc-500 block">
                        &ldquo;{p.stage_name}&rdquo;
                      </span>
                    )}
                  </td>
                  <td className="text-xs font-mono text-zinc-500">
                    {p.id}
                  </td>
                  <td>
                    <div className="flex gap-1">
                      {p.departments.map(d => (
                        <span
                          key={d}
                          className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-zinc-800 text-zinc-300 border border-zinc-700"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="text-xs text-zinc-400">
                    {p.join_date || new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleCheckDuplicates(p)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-purple-300 text-xs font-medium border border-zinc-750 transition-colors flex items-center gap-1"
                        title="Scan for duplicate records and merge"
                      >
                        <GitMerge className="w-3.5 h-3.5" /> Merge
                      </button>
                      <button
                        onClick={() => handleSoftDelete(p.id, p.full_name)}
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

      {/* Add Performer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-2xl">
            <h2 className="text-base font-bold text-zinc-100">Add New Performer</h2>
            <form onSubmit={handleCreatePerformer} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Full Legal / Display Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Arjun Sharma"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Stage Alias (Optional)</label>
                <input
                  type="text"
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  placeholder="e.g. Arjun"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Associated Departments</label>
                <div className="flex gap-4 text-xs">
                  <label className="flex items-center gap-1.5 text-zinc-300">
                    <input
                      type="checkbox"
                      checked={departments.includes('music')}
                      onChange={(e) => {
                        if (e.target.checked) setDepartments(prev => [...prev, 'music']);
                        else if (departments.length > 1) setDepartments(prev => prev.filter(d => d !== 'music'));
                      }}
                      className="rounded bg-zinc-900 border-zinc-700"
                    />
                    Music
                  </label>
                  <label className="flex items-center gap-1.5 text-zinc-300">
                    <input
                      type="checkbox"
                      checked={departments.includes('dance')}
                      onChange={(e) => {
                        if (e.target.checked) setDepartments(prev => [...prev, 'dance']);
                        else if (departments.length > 1) setDepartments(prev => prev.filter(d => d !== 'dance'));
                      }}
                      className="rounded bg-zinc-900 border-zinc-700"
                    />
                    Dance
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Bio / Instrument Specialties</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Lead vocalist, acoustic guitarist..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Profile Photo URL (Optional)</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
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
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-md shadow-purple-600/25"
                >
                  Create Artist Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Duplicate Merging Modal */}
      {showMergeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <GitMerge className="w-4 h-4" />
              Duplicate Detection & Record Merging
            </div>
            <p className="text-xs text-zinc-400">
              Select the source performer to merge and the target surviving performer. All past performances and crew history will be safely reassigned to the survivor, preserving distinct counting invariants.
            </p>

            {mergeFeedback && (
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{mergeFeedback}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  Source Performer (Will be merged and archived)
                </label>
                <select
                  value={selectedSourceId}
                  onChange={(e) => setSelectedSourceId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none"
                >
                  {performers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.id.slice(0, 8)}...)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  Target Surviving Performer
                </label>
                <select
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none"
                >
                  <option value="">Select Target Performer...</option>
                  {performers
                    .filter((p) => p.id !== selectedSourceId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name} ({p.id.slice(0, 8)}...)
                      </option>
                    ))}
                </select>
              </div>

              {duplicateSuggestions.length > 0 && (
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                  <span className="text-[11px] font-semibold text-purple-400 block">
                    Algorithmic Similarity Matches:
                  </span>
                  {duplicateSuggestions.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedTargetId(m.id)}
                      className="cursor-pointer flex items-center justify-between text-xs p-1.5 rounded hover:bg-zinc-800"
                    >
                      <span className="text-zinc-200">{m.full_name}</span>
                      <span className="text-[10px] text-purple-400 font-bold">{m.score}% Match</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
              <button
                type="button"
                onClick={() => setShowMergeModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMergeSubmit}
                disabled={!selectedTargetId}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs font-semibold text-white shadow-md shadow-purple-600/25"
              >
                Execute Record Merge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
