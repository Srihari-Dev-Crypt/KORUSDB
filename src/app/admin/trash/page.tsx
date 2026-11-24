'use client';

import React, { useEffect, useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle, Check, ShieldAlert } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { Performance, Performer, Event, DanceCrew } from '@/lib/supabase/types';

export default function AdminTrashRecoveryPage() {
  const [trash, setTrash] = useState<{
    performances: Performance[];
    performers: Performer[];
    events: Event[];
    crews: DanceCrew[];
  }>({ performances: [], performers: [], events: [], crews: [] });

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadTrash = async () => {
    const data = await dataService.getTrashRecords();
    setTrash(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTrash();
    const handleUpdate = () => loadTrash();
    window.addEventListener('korus-data-updated', handleUpdate);
    return () => window.removeEventListener('korus-data-updated', handleUpdate);
  }, []);

  const handleRestore = async (type: 'performance' | 'performer' | 'event' | 'crew', id: string, name: string) => {
    let ok = false;
    if (type === 'performance') ok = await dataService.restorePerformance(id);
    else if (type === 'performer') ok = await dataService.restorePerformer(id);
    else if (type === 'event') ok = await dataService.restoreEvent(id);
    else if (type === 'crew') ok = await dataService.restoreCrew(id);

    if (ok) {
      setFeedback(`Restored "${name}" successfully.`);
      setTimeout(() => setFeedback(null), 2500);
      loadTrash();
    }
  };

  const handlePermanentDelete = async (type: 'performance' | 'performer' | 'event' | 'crew', id: string, name: string) => {
    if (!confirm(`CAUTION: Permanently delete "${name}"? This action cannot be undone.`)) return;

    let ok = false;
    if (type === 'performance') ok = await dataService.permanentDeletePerformance(id);
    else if (type === 'performer') ok = await dataService.permanentDeletePerformer(id);
    else if (type === 'event') ok = await dataService.permanentDeleteEvent(id);
    else if (type === 'crew') ok = await dataService.permanentDeleteCrew(id);

    if (ok) {
      setFeedback(`Permanently destroyed record "${name}".`);
      setTimeout(() => setFeedback(null), 2500);
      loadTrash();
    }
  };

  const totalTrash =
    trash.performances.length + trash.performers.length + trash.events.length + trash.crews.length;

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Trash2 className="w-4 h-4" /> Data Recovery & Retention
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-zinc-100">
          Trash & Soft-Delete Recovery
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Recover accidentally deleted performances, artists, events, and crews without data loss.
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-zinc-500">Scanning trash repository...</div>
      ) : totalTrash === 0 ? (
        <div className="p-12 text-center border border-zinc-850 rounded-3xl bg-zinc-950/40 space-y-2">
          <ShieldAlert className="w-10 h-10 text-emerald-400 mx-auto opacity-80" />
          <h3 className="text-base font-bold text-zinc-200">Trash is Empty</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            All records in the society database are actively published. Soft-deleted items will appear here for 30-day recovery.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Deleted Performances */}
          {trash.performances.length > 0 && (
            <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-3">
              <h2 className="text-sm font-bold text-zinc-200">
                Soft-Deleted Performances ({trash.performances.length})
              </h2>
              <div className="space-y-2">
                {trash.performances.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-zinc-850 bg-zinc-950/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-zinc-200">{p.title}</div>
                      <div className="text-[11px] text-zinc-500">
                        {p.department.toUpperCase()} · Deleted: {p.deleted_at ? new Date(p.deleted_at).toLocaleDateString() : 'Recently'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestore('performance', p.id, p.title)}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDelete('performance', p.id, p.title)}
                        className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 font-medium text-xs border border-rose-500/20 transition-colors"
                      >
                        Destroy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deleted Performers */}
          {trash.performers.length > 0 && (
            <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-3">
              <h2 className="text-sm font-bold text-zinc-200">
                Soft-Deleted Performers ({trash.performers.length})
              </h2>
              <div className="space-y-2">
                {trash.performers.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-zinc-850 bg-zinc-950/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-zinc-200">{p.full_name}</div>
                      <div className="text-[11px] text-zinc-500">
                        ID: {p.id.slice(0, 8)}... · {p.departments.join(', ')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestore('performer', p.id, p.full_name)}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDelete('performer', p.id, p.full_name)}
                        className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 font-medium text-xs border border-rose-500/20 transition-colors"
                      >
                        Destroy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deleted Events */}
          {trash.events.length > 0 && (
            <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-3">
              <h2 className="text-sm font-bold text-zinc-200">
                Soft-Deleted Events ({trash.events.length})
              </h2>
              <div className="space-y-2">
                {trash.events.map((e) => (
                  <div
                    key={e.id}
                    className="p-3 rounded-xl border border-zinc-850 bg-zinc-950/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-zinc-200">{e.name}</div>
                      <div className="text-[11px] text-zinc-500">{e.event_date} · {e.category}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestore('event', e.id, e.name)}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDelete('event', e.id, e.name)}
                        className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 font-medium text-xs border border-rose-500/20 transition-colors"
                      >
                        Destroy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
