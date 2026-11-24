'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Users, Music, Flame, Calendar, Award, 
  ArrowLeft, Clock, Disc, ShieldCheck, MapPin 
} from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { PerformerStats } from '@/lib/supabase/types';
import { formatDate } from '@/lib/utils';

export default function PerformerProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const [stats, setStats] = useState<PerformerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const data = await dataService.getPerformerStats(id);
      setStats(data);
      setLoading(false);
    }
    load();

    const handleUpdate = () => load();
    window.addEventListener('korus-data-updated', handleUpdate);
    return () => window.removeEventListener('korus-data-updated', handleUpdate);
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-zinc-500">Loading artist profile & database statistics...</div>;
  }

  if (!stats) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-zinc-100">Performer Not Found</h2>
        <p className="text-xs text-zinc-500">No active performer profile matching this identifier.</p>
        <Link href="/performers" className="text-xs text-purple-400 hover:underline">
          Return to Performers Registry
        </Link>
      </div>
    );
  }

  const { performer, history } = stats;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/performers"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Performers
        </Link>
      </div>

      {/* Artist Hero Profile Card */}
      <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-zinc-800 border-2 border-purple-500/30 shadow-xl flex-shrink-0">
            {performer.avatar_url ? (
              <img
                src={performer.avatar_url}
                alt={performer.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-black text-2xl text-purple-400">
                {performer.full_name.charAt(0)}
              </div>
            )}
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {performer.departments.map((dept) => (
                <span
                  key={dept}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    dept === 'music'
                      ? 'bg-purple-500/10 text-purple-300 border border-purple-500/25'
                      : 'bg-pink-500/10 text-pink-300 border border-pink-500/25'
                  }`}
                >
                  {dept === 'music' ? <Music className="w-3 h-3" /> : <Flame className="w-3 h-3" />}
                  {dept}
                </span>
              ))}
              <span className="text-xs font-mono text-zinc-500">ID: {performer.id}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-100 uppercase">
              {performer.full_name}
            </h1>

            {performer.stage_name && (
              <p className="text-sm font-medium text-purple-400">
                Stage Alias: &ldquo;{performer.stage_name}&rdquo;
              </p>
            )}

            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              {performer.bio || 'Official artist of KORUS Music and Dance Society.'}
            </p>
          </div>
        </div>

        {/* Core Mathematical Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Total Performances
            </span>
            <div className="text-2xl sm:text-3xl font-black text-zinc-100">
              {stats.total_performances}
            </div>
            <span className="text-[10px] text-zinc-500 block">Distinct performances</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-1">
              <Music className="w-3 h-3" /> Music Shows
            </span>
            <div className="text-2xl sm:text-3xl font-black text-purple-300">
              {stats.total_music_performances}
            </div>
            <span className="text-[10px] text-zinc-500 block">Concerts & sets</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-pink-400 flex items-center gap-1">
              <Flame className="w-3 h-3" /> Dance Routines
            </span>
            <div className="text-2xl sm:text-3xl font-black text-pink-300">
              {stats.total_dance_performances}
            </div>
            <span className="text-[10px] text-zinc-500 block">Crew & solo pieces</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Unique Events
            </span>
            <div className="text-2xl sm:text-3xl font-black text-sky-300">
              {stats.unique_events_count}
            </div>
            <span className="text-[10px] text-zinc-500 block">Festivals attended</span>
          </div>
        </div>

        {/* Roles & Associated Crews Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 space-y-2">
            <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[11px] block">
              Stage Roles & Instruments
            </span>
            <div className="flex flex-wrap gap-1.5">
              {stats.roles.length > 0 ? (
                stats.roles.map((r, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-zinc-850 text-zinc-300 border border-zinc-700/60"
                  >
                    {r}
                  </span>
                ))
              ) : (
                <span className="text-zinc-500">No specific roles logged.</span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 space-y-2">
            <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[11px] block">
              Associated Dance Crews
            </span>
            <div className="flex flex-wrap gap-1.5">
              {stats.associated_crews.length > 0 ? (
                stats.associated_crews.map((c) => (
                  <Link
                    key={c.id}
                    href={`/crews/${c.id}`}
                    className="px-2.5 py-1 rounded-lg bg-pink-950/20 text-pink-300 border border-pink-500/30 hover:bg-pink-900/30 transition-colors font-medium"
                  >
                    {c.name}
                  </Link>
                ))
              ) : (
                <span className="text-zinc-500">Individual Solo Artist (No crew affiliations)</span>
              )}
            </div>
          </div>
        </div>

        {/* Career Span Dates */}
        <div className="flex flex-wrap items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-850">
          <span>First Recorded Performance: <strong className="text-zinc-300">{formatDate(stats.first_performance_date)}</strong></span>
          <span>Most Recent Performance: <strong className="text-zinc-300">{formatDate(stats.latest_performance_date)}</strong></span>
        </div>
      </div>

      {/* Complete Chronological Performance History (As specified in prompt Section 7) */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              Complete Chronological Performance History
            </h2>
            <p className="text-xs text-zinc-400">
              Verified archive entries for {performer.full_name}
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
            {history.length} Verified Entries
          </span>
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs">
            No published performances currently on record for this performer.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th className="text-xs font-semibold text-zinc-400 uppercase">Event</th>
                  <th className="text-xs font-semibold text-zinc-400 uppercase">Date</th>
                  <th className="text-xs font-semibold text-zinc-400 uppercase">Department</th>
                  <th className="text-xs font-semibold text-zinc-400 uppercase">Role / Crew</th>
                  <th className="text-xs font-semibold text-zinc-400 uppercase">Song</th>
                  <th className="text-xs font-semibold text-zinc-400 uppercase text-right">Performance</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.performance_id} className="transition-colors">
                    <td className="font-semibold text-zinc-200 text-sm">
                      <Link
                        href={`/events/${h.event_id}`}
                        className="hover:text-purple-400 transition-colors"
                      >
                        {h.event_name}
                      </Link>
                    </td>
                    <td className="text-xs text-zinc-400 whitespace-nowrap">
                      {formatDate(h.event_date)}
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          h.department === 'music'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                        }`}
                      >
                        {h.department === 'music' ? <Music className="w-3 h-3" /> : <Flame className="w-3 h-3" />}
                        {h.department}
                      </span>
                    </td>
                    <td className="text-xs text-zinc-300">
                      {h.crew_name ? (
                        <span className="font-medium text-pink-300">{h.crew_name}</span>
                      ) : (
                        <span>{h.roles.join(', ') || 'Performer'}</span>
                      )}
                    </td>
                    <td className="text-xs text-zinc-300 italic">
                      {h.songs.length > 0 ? h.songs.join(', ') : 'Instrumental / Routine'}
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/${h.department}/${h.performance_id}`}
                        className="text-xs font-medium text-purple-400 hover:text-purple-300"
                      >
                        View Record →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
