'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Search, Flame, ArrowRight, Calendar, Sparkles } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { DanceCrew, CrewStats } from '@/lib/supabase/types';

export default function DanceCrewsIndexPage() {
  const [crews, setCrews] = useState<DanceCrew[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, CrewStats>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function load() {
      const data = await dataService.getCrews(false);
      setCrews(data);

      const statsObj: Record<string, CrewStats> = {};
      for (const c of data) {
        const s = await dataService.getCrewStats(c.id);
        if (s) statsObj[c.id] = s;
      }
      setStatsMap(statsObj);
      setLoading(false);
    }
    load();

    const handleUpdate = () => load();
    window.addEventListener('korus-data-updated', handleUpdate);
    return () => window.removeEventListener('korus-data-updated', handleUpdate);
  }, []);

  const filtered = crews.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.dance_style && c.dance_style.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-pink-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4" /> Society Dance Collectives
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            Dance Crews
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Official roster and performance histories of KORUS competitive and showcase dance teams.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/crews"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-medium text-xs shadow-lg shadow-pink-600/20 transition-all"
          >
            + Register Dance Crew
          </Link>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search crews by name, style (Hip-Hop, Street, Fusion)..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-pink-500/50"
        />
      </div>

      {/* Crews Grid */}
      {loading ? (
        <div className="py-20 text-center text-zinc-500">Loading dance crews...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-zinc-500">No dance crews found matching your query.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((crew) => {
            const stats = statsMap[crew.id];

            return (
              <div
                key={crew.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 hover:border-pink-500/40 hover:bg-zinc-900/70 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0">
                        {crew.avatar_url ? (
                          <img
                            src={crew.avatar_url}
                            alt={crew.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-pink-400">
                            {crew.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-zinc-100 group-hover:text-pink-300 transition-colors">
                          {crew.name}
                        </h3>
                        <span className="text-xs text-pink-400 font-medium block">
                          {crew.dance_style || 'Urban Dance'}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-pink-500/10 text-pink-300 border border-pink-500/20">
                      Active
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {crew.description || 'Official KORUS dance team.'}
                  </p>

                  {/* Aggregate Crew Statistics */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-zinc-950/70 border border-zinc-850 text-center">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block">Performances</span>
                      <span className="text-sm font-extrabold text-zinc-100">
                        {stats ? stats.total_performances : 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block">Events</span>
                      <span className="text-sm font-extrabold text-zinc-100">
                        {stats ? stats.unique_events_count : 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block">Dancers</span>
                      <span className="text-sm font-extrabold text-zinc-100">
                        {stats ? stats.current_members.length : 0}
                      </span>
                    </div>
                  </div>

                  {/* Current Dancers preview */}
                  {stats && stats.current_members.length > 0 && (
                    <div className="text-xs text-zinc-400 flex items-center gap-1.5 flex-wrap">
                      <span className="text-zinc-500">Roster:</span>
                      {stats.current_members.slice(0, 3).map((m) => (
                        <span key={m.id} className="text-zinc-300">
                          {m.full_name}
                        </span>
                      ))}
                      {stats.current_members.length > 3 && (
                        <span className="text-zinc-500">+{stats.current_members.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-6 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-zinc-600">
                    ID: {crew.id.slice(0, 8)}
                  </span>
                  <Link
                    href={`/crews/${crew.id}`}
                    className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1"
                  >
                    Crew Profile & History <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
