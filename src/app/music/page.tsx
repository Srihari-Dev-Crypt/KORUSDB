'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Music, Search, Calendar, User, Mic2, ArrowRight, Filter } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { Performance } from '@/lib/supabase/types';
import { formatDate } from '@/lib/utils';

export default function MusicPerformancesPage() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');

  useEffect(() => {
    async function load() {
      const data = await dataService.getPerformances('music', false);
      setPerformances(data);
      setLoading(false);
    }
    load();

    const handleUpdate = () => load();
    window.addEventListener('korus-data-updated', handleUpdate);
    return () => window.removeEventListener('korus-data-updated', handleUpdate);
  }, []);

  const roles = Array.from(
    new Set(
      performances.flatMap(p =>
        p.participants?.flatMap(pt => pt.roles?.map(r => r.role_name) || []) || []
      )
    )
  );

  const filtered = performances.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.event?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.participants?.some(pt => pt.performer?.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.songs?.some(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole =
      selectedRole === 'ALL' ||
      p.participants?.some(pt => pt.roles?.some(r => r.role_name === selectedRole));

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Music className="w-4 h-4" /> Music Section
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            Music Performances
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Complete digital registry of live bands, acoustic sets, choir performances, and multi-instrumentalists.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/performances/new?dept=music"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-600/20 transition-all"
          >
            + Add Music Performance
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by song, artist name, event, instrument..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500" />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500/50"
          >
            <option value="ALL">All Roles</option>
            {roles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Performance Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-zinc-500">Loading music archive...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-zinc-500">
          No music performances matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((perf) => (
            <div
              key={perf.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-purple-500/40 hover:bg-zinc-900/70 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    {formatDate(perf.event?.event_date || perf.created_at)}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    ID: {perf.id.slice(0, 8)}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-zinc-100 group-hover:text-purple-300 transition-colors line-clamp-2">
                    {perf.title}
                  </h3>
                  <Link
                    href={`/events/${perf.event_id}`}
                    className="text-xs text-purple-400/90 hover:underline block mt-0.5"
                  >
                    @ {perf.event?.name}
                  </Link>
                </div>

                {/* Performed Songs */}
                {perf.songs && perf.songs.length > 0 && (
                  <div className="text-xs text-zinc-400 flex items-center gap-1.5 flex-wrap">
                    <span className="text-zinc-400">Song:</span>
                    {perf.songs.map((s) => (
                      <span key={s.id} className="text-zinc-300 font-medium">
                        &ldquo;{s.title}&rdquo; {s.original_artist ? `(${s.original_artist})` : ''}
                      </span>
                    ))}
                  </div>
                )}

                {/* Musicians and Roles */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-800/60">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                    Musicians ({perf.participants?.length || 0})
                  </span>
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {perf.participants?.map((part) => (
                      <div key={part.id} className="flex items-center justify-between text-xs">
                        <Link
                          href={`/performers/${part.performer_id}`}
                          className="font-medium text-zinc-300 hover:text-purple-400 transition-colors"
                        >
                          {part.performer?.full_name}
                        </Link>
                        <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                          {part.roles?.map(r => (
                            <span key={r.id} className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                              {r.role_name} {r.instrument ? `· ${r.instrument}` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 italic line-clamp-1">
                  {perf.notes || 'Official concert archive'}
                </span>
                <Link
                  href={`/music/${perf.id}`}
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
