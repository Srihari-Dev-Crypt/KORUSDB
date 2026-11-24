'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Flame, Calendar, MapPin, Users, ArrowLeft, 
  Disc, Info, Clock, ShieldCheck 
} from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { Performance } from '@/lib/supabase/types';
import { formatDate } from '@/lib/utils';

export default function DancePerformanceDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const data = await dataService.getPerformanceById(id);
      setPerformance(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-zinc-500">Loading dance performance...</div>;
  }

  if (!performance) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-zinc-100">Performance Not Found</h2>
        <Link href="/dance" className="text-xs text-pink-400 hover:underline">
          Return to Dance Section
        </Link>
      </div>
    );
  }

  const crew = performance.participants?.find(p => p.crew)?.crew;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link
          href="/dance"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dance Performances
        </Link>
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-10 space-y-8 shadow-xl">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase bg-pink-500/10 text-pink-300 border border-pink-500/20">
                <Flame className="w-3.5 h-3.5" /> Dance Section
              </span>
              {performance.dance_style && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {performance.dance_style}
                </span>
              )}
            </div>
            <span className="text-xs font-mono text-zinc-500">
              ID: {performance.id}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            {performance.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-2">
            <Link
              href={`/events/${performance.event_id}`}
              className="flex items-center gap-1.5 text-pink-400 hover:underline font-medium"
            >
              <Calendar className="w-3.5 h-3.5" />
              {performance.event?.name}
            </Link>
            <span>·</span>
            <span>{formatDate(performance.event?.event_date || performance.created_at)}</span>
            {performance.event?.venue && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1 text-zinc-400">
                  <MapPin className="w-3.5 h-3.5" />
                  {performance.event.venue}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Dance Crew association */}
        {crew && (
          <div className="p-4 rounded-2xl border border-pink-500/20 bg-pink-950/15 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-pink-400 font-semibold block">
                  Associated Dance Crew
                </span>
                <Link
                  href={`/crews/${crew.id}`}
                  className="text-base font-bold text-zinc-100 hover:text-pink-300 transition-colors"
                >
                  {crew.name}
                </Link>
              </div>
            </div>
            <Link
              href={`/crews/${crew.id}`}
              className="text-xs text-pink-400 hover:text-pink-300 font-medium"
            >
              Crew Profile →
            </Link>
          </div>
        )}

        {/* Songs in Routine */}
        {performance.songs && performance.songs.length > 0 && (
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Disc className="w-4 h-4 text-pink-400" />
              Songs & Audio Mix Used in Routine ({performance.songs.length})
            </h3>
            <p className="text-xs text-zinc-500">
              Counting rule: Routines using multiple tracks are counted as a single distinct performance.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {performance.songs.map((song, i) => (
                <div
                  key={song.id}
                  className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 flex items-center gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-zinc-200">&ldquo;{song.title}&rdquo;</div>
                    <div className="text-xs text-zinc-500">{song.original_artist || 'Artist'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Participating Dancers Roster */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Users className="w-4 h-4 text-pink-400" />
            Participating Dancers ({performance.participants?.length || 0})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {performance.participants?.map((part) => (
              <div
                key={part.id}
                className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/40 hover:border-pink-500/30 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300 font-bold text-sm">
                    {part.performer?.full_name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <Link
                      href={`/performers/${part.performer_id}`}
                      className="text-sm font-bold text-zinc-200 hover:text-pink-300 transition-colors"
                    >
                      {part.performer?.full_name}
                    </Link>
                    {part.roles && part.roles.length > 0 && (
                      <span className="text-xs text-zinc-500 block">
                        {part.roles.map(r => r.role_name).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/performers/${part.performer_id}`}
                  className="text-xs text-pink-400 hover:text-pink-300"
                >
                  Profile →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {performance.notes && (
          <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/40 space-y-1 text-xs">
            <span className="font-semibold text-zinc-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-zinc-500" /> Routine Notes
            </span>
            <p className="text-zinc-400 leading-relaxed">{performance.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-6 border-t border-zinc-800 text-[11px] text-zinc-500 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> Logged: {new Date(performance.created_at).toLocaleDateString()}
            </span>
            <span>·</span>
            <span>Historical Membership Preserved</span>
          </div>
          <Link
            href="/admin"
            className="text-pink-400 hover:text-pink-300 font-medium flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Edit via Admin Console
          </Link>
        </div>
      </div>
    </div>
  );
}
