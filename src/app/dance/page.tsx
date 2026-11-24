'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, Search, Calendar, Users, Disc, ArrowRight, Filter } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { Performance } from '@/lib/supabase/types';
import { formatDate } from '@/lib/utils';

export default function DancePerformancesPage() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrew, setSelectedCrew] = useState('ALL');

  useEffect(() => {
    async function load() {
      const data = await dataService.getPerformances('dance', false);
      setPerformances(data);
      setLoading(false);
    }
    load();

    const handleUpdate = () => load();
    window.addEventListener('korus-data-updated', handleUpdate);
    return () => window.removeEventListener('korus-data-updated', handleUpdate);
  }, []);

  const crews = Array.from(
    new Set(
      performances.flatMap(p =>
        p.participants?.map(pt => pt.crew?.name).filter(Boolean) as string[] || []
      )
    )
  );

  const filtered = performances.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.event?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.dance_style && p.dance_style.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.participants?.some(pt => pt.performer?.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.songs?.some(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCrew =
      selectedCrew === 'ALL' ||
      p.participants?.some(pt => pt.crew?.name === selectedCrew);

    return matchesSearch && matchesCrew;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-pink-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4" /> Dance Section
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            Dance Performances & Routines
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Official digital registry of solo, duet, and crew dance routines, street battles, and cultural showcases.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/crews"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-all"
          >
            <Users className="w-3.5 h-3.5 text-pink-400" /> View Dance Crews
          </Link>
          <Link
            href="/admin/performances/new?dept=dance"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-medium text-xs shadow-lg shadow-pink-600/20 transition-all"
          >
            + Add Dance Performance
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
            placeholder="Search by routine title, dancer, crew, style, song..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-pink-500/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500" />
          <select
            value={selectedCrew}
            onChange={(e) => setSelectedCrew(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-pink-500/50"
          >
            <option value="ALL">All Crews</option>
            {crews.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-zinc-500">Loading dance performances...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-zinc-500">
          No dance routines matching your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((perf) => {
            const crew = perf.participants?.find(p => p.crew)?.crew;
            return (
              <div
                key={perf.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-pink-500/40 hover:bg-zinc-900/70 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-pink-400" />
                      {formatDate(perf.event?.event_date || perf.created_at)}
                    </span>
                    {perf.dance_style && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 font-medium">
                        {perf.dance_style}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-zinc-100 group-hover:text-pink-300 transition-colors line-clamp-2">
                      {perf.title}
                    </h3>
                    <Link
                      href={`/events/${perf.event_id}`}
                      className="text-xs text-pink-400/90 hover:underline block mt-0.5"
                    >
                      @ {perf.event?.name}
                    </Link>
                  </div>

                  {/* Associated Dance Crew */}
                  {crew && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950/50 border border-zinc-800 text-xs">
                      <Users className="w-4 h-4 text-pink-400 flex-shrink-0" />
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Crew:</span>
                        <Link href={`/crews/${crew.id}`} className="font-semibold text-zinc-200 hover:text-pink-400">
                          {crew.name}
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Multiple Songs in Routine */}
                  {perf.songs && perf.songs.length > 0 && (
                    <div className="text-xs text-zinc-400 space-y-1">
                      <span className="text-zinc-500 font-medium">Songs in Routine ({perf.songs.length}):</span>
                      <div className="flex flex-wrap gap-1">
                        {perf.songs.map((s) => (
                          <span
                            key={s.id}
                            className="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 text-[11px] border border-zinc-700/60"
                          >
                            &ldquo;{s.title}&rdquo;
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dancers in Routine */}
                  <div className="space-y-1.5 pt-2 border-t border-zinc-800/60">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
                      Participating Dancers ({perf.participants?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {perf.participants?.map((part) => (
                        <Link
                          key={part.id}
                          href={`/performers/${part.performer_id}`}
                          className="px-2 py-0.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-pink-300 text-xs transition-colors"
                        >
                          {part.performer?.full_name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 italic line-clamp-1">
                    {perf.notes || 'Dance showcase record'}
                  </span>
                  <Link
                    href={`/dance/${perf.id}`}
                    className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1"
                  >
                    View Routine <ArrowRight className="w-3.5 h-3.5" />
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
