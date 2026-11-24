'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, Search, Music, Flame, ArrowRight, Filter, Calendar } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { Performer, PerformerStats } from '@/lib/supabase/types';

export default function AllPerformersPage() {
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, PerformerStats>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  useEffect(() => {
    async function load() {
      const perfs = await dataService.getPerformers(false);
      setPerformers(perfs);

      // Hydrate stats for each performer
      const statsObj: Record<string, PerformerStats> = {};
      for (const p of perfs) {
        const s = await dataService.getPerformerStats(p.id);
        if (s) statsObj[p.id] = s;
      }
      setStatsMap(statsObj);
      setLoading(false);
    }
    load();

    const handleUpdate = () => load();
    window.addEventListener('korus-data-updated', handleUpdate);
    return () => window.removeEventListener('korus-data-updated', handleUpdate);
  }, []);

  const filtered = performers.filter((p) => {
    const matchesSearch =
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.stage_name && p.stage_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept =
      departmentFilter === 'ALL' ||
      p.departments.includes(departmentFilter);

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" /> Centralized Artist Registry
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            Society Performers
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Shared digital database of all musicians, singers, dancers, and choreographers affiliated with KORUS.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/performers"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-600/20 transition-all"
          >
            Manage Performers & Merging
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
            placeholder="Search performer by real name, stage name..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500" />
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500/50"
          >
            <option value="ALL">All Departments</option>
            <option value="music">Music</option>
            <option value="dance">Dance</option>
          </select>
        </div>
      </div>

      {/* Performers Grid */}
      {loading ? (
        <div className="py-20 text-center text-zinc-500">Loading performer profiles & statistics...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-zinc-500">No performers found matching your search.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((performer) => {
            const stats = statsMap[performer.id];
            const isMultiDept = performer.departments.includes('music') && performer.departments.includes('dance');

            return (
              <div
                key={performer.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-purple-500/40 hover:bg-zinc-900/70 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0">
                        {performer.avatar_url ? (
                          <img
                            src={performer.avatar_url}
                            alt={performer.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-purple-400">
                            {performer.full_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-zinc-100 group-hover:text-purple-300 transition-colors">
                          {performer.full_name}
                        </h3>
                        {performer.stage_name && (
                          <span className="text-xs text-zinc-500 block">
                            &ldquo;{performer.stage_name}&rdquo;
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isMultiDept ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30">
                          Music & Dance
                        </span>
                      ) : performer.departments.includes('music') ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          Music
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-pink-500/10 text-pink-400 border border-pink-500/20">
                          Dance
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {performer.bio || 'Registered KORUS artist.'}
                  </p>

                  {/* Derived Invariant Statistics */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-zinc-950/60 border border-zinc-850 text-center">
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
                      <span className="text-[10px] text-zinc-500 uppercase block">Music/Dance</span>
                      <span className="text-xs font-semibold text-zinc-300">
                        {stats ? `${stats.total_music_performances}/${stats.total_dance_performances}` : '0/0'}
                      </span>
                    </div>
                  </div>

                  {/* Associated Crews or Roles */}
                  {stats && stats.roles.length > 0 && (
                    <div className="flex flex-wrap gap-1 text-[11px]">
                      {stats.roles.slice(0, 3).map((r, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {r}
                        </span>
                      ))}
                      {stats.roles.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
                          +{stats.roles.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-zinc-600">
                    ID: {performer.id.slice(0, 8)}
                  </span>
                  <Link
                    href={`/performers/${performer.id}`}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    View Profile & History <ArrowRight className="w-3.5 h-3.5" />
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
