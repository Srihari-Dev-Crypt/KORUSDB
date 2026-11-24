'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Users, Flame, Calendar, Disc, Award, 
  ArrowLeft, ArrowRight, ShieldCheck, Clock 
} from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { CrewStats } from '@/lib/supabase/types';
import { formatDate } from '@/lib/utils';

export default function CrewDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [stats, setStats] = useState<CrewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const data = await dataService.getCrewStats(id);
      setStats(data);
      setLoading(false);
    }
    load();

    const handleUpdate = () => load();
    window.addEventListener('korus-data-updated', handleUpdate);
    return () => window.removeEventListener('korus-data-updated', handleUpdate);
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-zinc-500">Loading crew record & performance history...</div>;
  }

  if (!stats) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-zinc-100">Dance Crew Not Found</h2>
        <Link href="/crews" className="text-xs text-pink-400 hover:underline">
          Return to Dance Crews
        </Link>
      </div>
    );
  }

  const { crew, history, current_members, songs_used } = stats;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <Link
          href="/crews"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dance Crews
        </Link>
      </div>

      {/* Crew Hero */}
      <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-zinc-800 border-2 border-pink-500/30 shadow-xl flex-shrink-0">
            {crew.avatar_url ? (
              <img
                src={crew.avatar_url}
                alt={crew.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-black text-2xl text-pink-400">
                {crew.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-pink-500/10 text-pink-300 border border-pink-500/25">
                {crew.dance_style || 'Urban Dance Crew'}
              </span>
              <span className="text-xs font-mono text-zinc-500">ID: {crew.id}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-100">
              {crew.name}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              {crew.description || 'Official KORUS dance team.'}
            </p>
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Total Performances
            </span>
            <div className="text-2xl sm:text-3xl font-black text-zinc-100">
              {stats.total_performances}
            </div>
            <span className="text-[10px] text-zinc-500">Stage routines</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-pink-400">
              Events Participated
            </span>
            <div className="text-2xl sm:text-3xl font-black text-pink-300">
              {stats.unique_events_count}
            </div>
            <span className="text-[10px] text-zinc-500">Festivals & cyphers</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400">
              Current Dancers
            </span>
            <div className="text-2xl sm:text-3xl font-black text-purple-300">
              {current_members.length}
            </div>
            <span className="text-[10px] text-zinc-500">Active roster</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              Songs Used
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-300">
              {songs_used.length}
            </div>
            <span className="text-[10px] text-zinc-500">Track repertoire</span>
          </div>
        </div>
      </div>

      {/* Dancers Roster */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-pink-400" />
          Crew Roster ({current_members.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {current_members.map((dancer) => (
            <div
              key={dancer.id}
              className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/40 flex items-center justify-between hover:border-pink-500/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center font-bold text-sm">
                  {dancer.full_name.charAt(0)}
                </div>
                <div>
                  <Link
                    href={`/performers/${dancer.id}`}
                    className="text-sm font-bold text-zinc-200 hover:text-pink-300 transition-colors"
                  >
                    {dancer.full_name}
                  </Link>
                  <span className="text-xs text-zinc-500 block">Dancer</span>
                </div>
              </div>
              <Link
                href={`/performers/${dancer.id}`}
                className="text-xs text-pink-400 hover:text-pink-300"
              >
                Profile →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Complete Performance History */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-pink-400" />
            Complete Performance History ({history.length})
          </h2>
          <span className="text-xs text-zinc-400">
            Historical records preserved regardless of membership updates
          </span>
        </div>

        {history.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs">
            No routines logged for this crew yet.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th className="text-xs font-semibold text-zinc-400 uppercase">Routine Title</th>
                  <th className="text-xs font-semibold text-zinc-400 uppercase">Event</th>
                  <th className="text-xs font-semibold text-zinc-400 uppercase">Date</th>
                  <th className="text-xs font-semibold text-zinc-400 uppercase">Songs Used</th>
                  <th className="text-xs font-semibold text-zinc-400 uppercase">Dancers</th>
                  <th className="text-xs font-semibold text-zinc-400 uppercase text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.performance_id} className="transition-colors">
                    <td className="font-semibold text-zinc-200 text-sm">
                      {h.title}
                    </td>
                    <td className="text-sm text-zinc-300">
                      {h.event_name}
                    </td>
                    <td className="text-xs text-zinc-400 whitespace-nowrap">
                      {formatDate(h.event_date)}
                    </td>
                    <td className="text-xs text-zinc-300 italic">
                      {h.songs.length > 0 ? h.songs.join(', ') : 'Audio Track'}
                    </td>
                    <td className="text-xs text-zinc-400">
                      {h.dancers_count} Dancers
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/dance/${h.performance_id}`}
                        className="text-xs font-medium text-pink-400 hover:text-pink-300"
                      >
                        View Routine →
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
