'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, Trash2, ArrowLeft, Music, Flame, 
  Users, Calendar, Disc, Check, AlertCircle 
} from 'lucide-react';
import { dataService } from '@/lib/data-service';
import type { Event, Performer, DanceCrew, Song, Role } from '@/lib/supabase/types';

function NewPerformanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDept = (searchParams?.get('dept') as 'music' | 'dance') || 'music';

  const [department, setDepartment] = useState<'music' | 'dance'>(initialDept);
  const [events, setEvents] = useState<Event[]>([]);
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [crews, setCrews] = useState<DanceCrew[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

  // Form State
  const [selectedEventId, setSelectedEventId] = useState('');
  const [title, setTitle] = useState('');
  const [danceStyle, setDanceStyle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);
  const [selectedCrewId, setSelectedCrewId] = useState<string>('');

  // Participating Performers State
  const [participants, setParticipants] = useState<
    Array<{
      performer_id: string;
      crew_id?: string;
      roles: Array<{ role_name: string; instrument?: string }>;
    }>
  >([]);

  // Inline Quick Add Modals
  const [showNewPerformerModal, setShowNewPerformerModal] = useState(false);
  const [newPerformerName, setNewPerformerName] = useState('');
  const [newPerformerDept, setNewPerformerDept] = useState<'music' | 'dance'>('music');

  const [showNewSongModal, setShowNewSongModal] = useState(false);
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongArtist, setNewSongArtist] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [evList, pList, cList, sList, rList] = await Promise.all([
        dataService.getEvents(false),
        dataService.getPerformers(false),
        dataService.getCrews(false),
        dataService.getSongs(),
        dataService.getRoles(),
      ]);

      setEvents(evList);
      if (evList.length > 0) setSelectedEventId(evList[0].id);
      setPerformers(pList);
      setCrews(cList);
      setSongs(sList);
      setAvailableRoles(rList);
    }
    loadData();
  }, []);

  // When crew is selected in Dance mode, prefill its active members
  const handleCrewChange = async (crewId: string) => {
    setSelectedCrewId(crewId);
    if (!crewId) return;

    const crewStats = await dataService.getCrewStats(crewId);
    if (crewStats && crewStats.current_members.length > 0) {
      const prefilled = crewStats.current_members.map(m => ({
        performer_id: m.id,
        crew_id: crewId,
        roles: [{ role_name: 'Dancer' }],
      }));
      setParticipants(prefilled);
    }
  };

  const addParticipant = (performerId: string) => {
    if (!performerId) return;
    if (participants.some(p => p.performer_id === performerId)) return;

    setParticipants(prev => [
      ...prev,
      {
        performer_id: performerId,
        crew_id: selectedCrewId || undefined,
        roles: [{ role_name: department === 'music' ? 'Lead Vocalist' : 'Dancer' }],
      },
    ]);
  };

  const removeParticipant = (index: number) => {
    setParticipants(prev => prev.filter((_, i) => i !== index));
  };

  const addRoleToParticipant = (participantIndex: number) => {
    setParticipants(prev => {
      const copy = [...prev];
      copy[participantIndex].roles.push({
        role_name: department === 'music' ? 'Guitarist' : 'Dancer',
        instrument: '',
      });
      return copy;
    });
  };

  const removeRoleFromParticipant = (participantIndex: number, roleIndex: number) => {
    setParticipants(prev => {
      const copy = [...prev];
      copy[participantIndex].roles = copy[participantIndex].roles.filter((_, i) => i !== roleIndex);
      return copy;
    });
  };

  const handleCreatePerformerInline = async () => {
    if (!newPerformerName.trim()) return;
    const created = await dataService.createPerformer({
      full_name: newPerformerName.trim(),
      departments: [newPerformerDept],
    });
    setPerformers(prev => [...prev, created]);
    addParticipant(created.id);
    setNewPerformerName('');
    setShowNewPerformerModal(false);
  };

  const handleCreateSongInline = async () => {
    if (!newSongTitle.trim()) return;
    const created = await dataService.createSong({
      title: newSongTitle.trim(),
      original_artist: newSongArtist.trim() || undefined,
    });
    setSongs(prev => [...prev, created]);
    setSelectedSongIds(prev => [...prev, created.id]);
    setNewSongTitle('');
    setNewSongArtist('');
    setShowNewSongModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedEventId) {
      setError('Please select an event for this performance.');
      return;
    }
    if (!title.trim()) {
      setError('Performance title is required.');
      return;
    }
    if (participants.length === 0) {
      setError('Please assign at least one performing artist.');
      return;
    }

    setLoading(true);
    try {
      await dataService.createPerformance({
        event_id: selectedEventId,
        department,
        title: title.trim(),
        dance_style: department === 'dance' ? danceStyle.trim() : null,
        notes: notes.trim() || null,
        song_ids: selectedSongIds,
        participants,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push(department === 'music' ? '/music' : '/dance');
      }, 800);
    } catch {
      setError('Failed to record performance. Please check input parameters.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admin Console
        </Link>
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-10 space-y-8 shadow-2xl">
        <div className="border-b border-zinc-800 pb-4">
          <h1 className="text-xl sm:text-2xl font-black text-zinc-100">
            Record New Performance
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Authoritative creation form with multi-performer assignments, crew rosters, and multi-song routines.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>Performance successfully registered and synchronized across all clients! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Department Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Department
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDepartment('music')}
                className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  department === 'music'
                    ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/25'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                <Music className="w-4 h-4" /> Music Performance
              </button>
              <button
                type="button"
                onClick={() => setDepartment('dance')}
                className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  department === 'dance'
                    ? 'bg-pink-600 text-white border-pink-500 shadow-lg shadow-pink-600/25'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                <Flame className="w-4 h-4" /> Dance Routine
              </button>
            </div>
          </div>

          {/* Event and Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Associated Event / Fest</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
              >
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.event_date})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Performance Title {department === 'music' ? '(e.g. Yellow Band Set)' : '(e.g. Retro Cypher)'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title or routine name..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Dance-Specific Fields */}
          {department === 'dance' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-pink-950/15 border border-pink-500/20">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-pink-300">
                  Dance Crew (Prefills roster)
                </label>
                <select
                  value={selectedCrewId}
                  onChange={(e) => handleCrewChange(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-pink-500"
                >
                  <option value="">No Crew / Solo Performance</option>
                  {crews.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.dance_style || 'Urban'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-pink-300">Dance Style</label>
                <input
                  type="text"
                  value={danceStyle}
                  onChange={(e) => setDanceStyle(e.target.value)}
                  placeholder="Hip-Hop, Krump, Contemporary Fusion..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>
          )}

          {/* Songs Performed in Routine */}
          <div className="space-y-2 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Disc className="w-3.5 h-3.5 text-purple-400" />
                Songs Performed ({selectedSongIds.length} selected)
              </label>
              <button
                type="button"
                onClick={() => setShowNewSongModal(true)}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
              >
                + Add New Song
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1">
              {songs.map((s) => {
                const isSelected = selectedSongIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedSongIds(prev =>
                        isSelected ? prev.filter(id => id !== s.id) : [...prev, s.id]
                      );
                    }}
                    className={`p-2 rounded-xl text-left border text-xs transition-all ${
                      isSelected
                        ? 'bg-purple-600/20 text-purple-200 border-purple-500/40'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="font-semibold line-clamp-1">{s.title}</div>
                    <div className="text-[10px] text-zinc-500 line-clamp-1">{s.original_artist || 'Artist'}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Participating Artists & Roles Assignment */}
          <div className="space-y-3 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  Assigned Artists & Stage Roles ({participants.length})
                </label>
                <p className="text-[11px] text-zinc-500">
                  Multiple roles per performer do not inflate their distinct performance count.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewPerformerModal(true)}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
              >
                + Create Artist Inline
              </button>
            </div>

            {/* Quick Add Performer Dropdown */}
            <div className="flex gap-2">
              <select
                id="add-performer-select"
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    addParticipant(e.target.value);
                    e.target.value = '';
                  }
                }}
              >
                <option value="" disabled>Select an artist to add to performance...</option>
                {performers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.departments.join(', ')})
                  </option>
                ))}
              </select>
            </div>

            {/* Participants list */}
            <div className="space-y-3 pt-2">
              {participants.map((part, pIdx) => {
                const perfObj = performers.find(p => p.id === part.performer_id);
                return (
                  <div
                    key={part.performer_id}
                    className="p-3.5 rounded-xl border border-zinc-850 bg-zinc-900/60 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-zinc-200">
                        {perfObj?.full_name || 'Artist'}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeParticipant(pIdx)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                        title="Remove artist from performance"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Roles for this participant */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-zinc-500">
                          Assigned Roles & Instruments
                        </span>
                        <button
                          type="button"
                          onClick={() => addRoleToParticipant(pIdx)}
                          className="text-[11px] text-purple-400 hover:text-purple-300"
                        >
                          + Add Second Role
                        </button>
                      </div>

                      {part.roles.map((role, rIdx) => (
                        <div key={rIdx} className="flex items-center gap-2">
                          <select
                            value={role.role_name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setParticipants(prev => {
                                const copy = [...prev];
                                copy[pIdx].roles[rIdx].role_name = val;
                                return copy;
                              });
                            }}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300"
                          >
                            {availableRoles.map(r => (
                              <option key={r.id} value={r.name}>{r.name}</option>
                            ))}
                          </select>

                          {department === 'music' && (
                            <input
                              type="text"
                              value={role.instrument || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setParticipants(prev => {
                                  const copy = [...prev];
                                  copy[pIdx].roles[rIdx].instrument = val;
                                  return copy;
                                });
                              }}
                              placeholder="Instrument (e.g. Electric Guitar, Snare)..."
                              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300"
                            />
                          )}

                          {part.roles.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRoleFromParticipant(pIdx, rIdx)}
                              className="text-zinc-500 hover:text-rose-400 p-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Performance Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Additional Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Stage choreography cues, technical setup, or concert notes..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-xl border border-zinc-800 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50"
            >
              {loading ? 'Recording...' : 'Commit Performance to Archive'}
            </button>
          </div>
        </form>
      </div>

      {/* Inline Performer Creation Modal */}
      {showNewPerformerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-zinc-100">Quick Register Artist</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={newPerformerName}
                  onChange={(e) => setNewPerformerName(e.target.value)}
                  placeholder="Artist full name..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Primary Department</label>
                <select
                  value={newPerformerDept}
                  onChange={(e) => setNewPerformerDept(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none"
                >
                  <option value="music">Music</option>
                  <option value="dance">Dance</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewPerformerModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreatePerformerInline}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white"
              >
                Save & Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Song Creation Modal */}
      {showNewSongModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-zinc-100">Add Song to Archive</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Song Title</label>
                <input
                  type="text"
                  value={newSongTitle}
                  onChange={(e) => setNewSongTitle(e.target.value)}
                  placeholder="Title (e.g. Bohemian Rhapsody)..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Original Artist</label>
                <input
                  type="text"
                  value={newSongArtist}
                  onChange={(e) => setNewSongArtist(e.target.value)}
                  placeholder="Queen..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewSongModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateSongInline}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white"
              >
                Save Song
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewPerformancePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-zinc-500">Loading performance form...</div>}>
      <NewPerformanceContent />
    </Suspense>
  );
}
