'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Calendar, MapPin, Music, Flame, Users, 
  ArrowLeft, ArrowRight, ShieldCheck, Tag 
} from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { EventStats } from '@/lib/supabase/types';
import { formatDate } from '@/lib/utils';

export default function EventDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const data = await dataService.getEventStats(id);
      setStats(data);
      setLoading(false);
    }
    load();

    const handleUpdate = () => load();
    window.addEventListener('korus-data-updated', handleUpdate);
    return () => window.removeEventListener('korus-data-updated', handleUpdate);
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-zinc-500">Loading festival record & line-up...</div>;
  }

  if (!stats) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-zinc-100">Event Not Found</h2>
        <Link href="/events" className="text-xs text-sky-400 hover:underline">
          Return to Events Index
        </Link>
      </div>
    );
  }

  const { event, performances } = stats;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Events Index
        </Link>
      </div>

      {/* Event Hero */}
      <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-sky-500/10 text-sky-300 border border-sky-500/25">
              {event.category}
            </span>
            <span className="text-xs text-zinc-500 font-mono">ID: {event.id}</span>
          </div>
          <span className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            {formatDate(event.event_date)}
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-100">
            {event.name}
          </h1>
          {event.venue && (
            <p className="text-xs sm:text-sm text-zinc-400 flex items-center gap-1.5 mt-2">
              <MapPin className="w-4 h-4 text-purple-400" />
              Venue: <strong className="text-zinc-200">{event.venue}</strong>
            </p>
          )}
        </div>

        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-3xl">
          {event.description || 'Official KORUS performance event.'}
        </p>

        {/* Aggregated Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Total Performances
            </span>
            <div className="text-2xl sm:text-3xl font-black text-zinc-100">
              {stats.total_performances}
            </div>
            <span className="text-[10px] text-zinc-500">At this event</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400">
              Music Performances
            </span>
            <div className="text-2xl sm:text-3xl font-black text-purple-300">
              {stats.music_performances_count}
            </div>
            <span className="text-[10px] text-zinc-500">Live band sets</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-pink-400">
              Dance Routines
            </span>
            <div className="text-2xl sm:text-3xl font-black text-pink-300">
              {stats.dance_performances_count}
            </div>
            <span className="text-[10px] text-zinc-500">Street & fusion</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">
              Unique Artists
            </span>
            <div className="text-2xl sm:text-3xl font-black text-sky-300">
              {stats.total_unique_performers}
            </div>
            <span className="text-[10px] text-zinc-500">On stage</span>
          </div>
        </div>
      </div>

      {/* Line-up & Associated Performances */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100">
            Event Performance Line-up ({performances.length})
          </h2>
          <span className="text-xs text-zinc-400">
            Distinct performances recorded
          </span>
        </div>

        <div className="space-y-4">
          {performances.map((perf) => (
            <div
              key={perf.id}
              className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      perf.department === 'music'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                    }`}
                  >
                    {perf.department === 'music' ? <Music className="w-3 h-3" /> : <Flame className="w-3 h-3" />}
                    {perf.department}
                  </span>
                  {perf.dance_style && (
                    <span className="text-[11px] text-zinc-400">· {perf.dance_style}</span>
                  )}
                </div>

                <h3 className="text-base font-bold text-zinc-100">
                  {perf.title}
                </h3>

                {/* Dancers / Musicians participating */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-400">
                  <span className="text-zinc-500 font-medium">Artists:</span>
                  {perf.participants?.map((p) => (
                    <Link
                      key={p.id}
                      href={`/performers/${p.performer_id}`}
                      className="text-zinc-300 hover:text-purple-400 transition-colors font-medium"
                    >
                      {p.performer?.full_name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/${perf.department}/${perf.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 hover:text-white border border-zinc-750 transition-all flex items-center gap-1"
                >
                  View Performance <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
