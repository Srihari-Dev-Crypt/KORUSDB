'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Music, Calendar, MapPin, User, ArrowLeft, 
  Disc, Info, Clock, ShieldCheck, Edit3 
} from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { Performance } from '@/lib/supabase/types';
import { formatDate } from '@/lib/utils';

export default function MusicPerformanceDetailPage() {
  const params = useParams();
  const router = useRouter();
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
    return <div className="py-20 text-center text-zinc-500">Loading performance record...</div>;
  }

  if (!performance) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-zinc-100">Performance Not Found</h2>
        <p className="text-xs text-zinc-500">This record may have been soft-deleted or does not exist.</p>
        <Link href="/music" className="text-xs text-purple-400 hover:underline">
          Return to Music Archive
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/music"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Music Performances
        </Link>
      </div>

      {/* Main Performance Card */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-10 space-y-8 shadow-xl">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20">
              <Music className="w-3.5 h-3.5" /> Music Section
            </span>
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
              className="flex items-center gap-1.5 text-purple-400 hover:underline font-medium"
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

        {/* Songs performed */}
        {performance.songs && performance.songs.length > 0 && (
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Disc className="w-4 h-4 text-purple-400" />
              Performed Songs ({performance.songs.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {performance.songs.map((song) => (
                <div
                  key={song.id}
                  className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-semibold text-zinc-200">&ldquo;{song.title}&rdquo;</div>
                    <div className="text-xs text-zinc-500">{song.original_artist || 'Original Composition'}</div>
                  </div>
                  {song.genre && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                      {song.genre}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Participating Musicians Roster */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <User className="w-4 h-4 text-purple-400" />
            Musicians & Multi-Role Stage Assignments ({performance.participants?.length || 0})
          </h3>
          <p className="text-xs text-zinc-500">
            Performer counting invariants: Musicians with multiple roles or multiple songs are counted exactly once for this performance.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {performance.participants?.map((part) => (
              <div
                key={part.id}
                className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/40 hover:border-purple-500/30 transition-all space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-sm">
                    {part.performer?.full_name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <Link
                      href={`/performers/${part.performer_id}`}
                      className="text-sm font-bold text-zinc-200 hover:text-purple-300 transition-colors"
                    >
                      {part.performer?.full_name}
                    </Link>
                    {part.performer?.stage_name && (
                      <span className="text-xs text-zinc-500 block">
                        &ldquo;{part.performer.stage_name}&rdquo;
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-zinc-850">
                  <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
                    Assigned Roles & Instruments
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {part.roles?.map((r) => (
                      <span
                        key={r.id}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-800 border border-zinc-700 text-zinc-300"
                      >
                        {r.role_name}
                        {r.instrument ? ` (${r.instrument})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        {performance.notes && (
          <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/40 space-y-1 text-xs">
            <span className="font-semibold text-zinc-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-zinc-500" /> Performance Notes
            </span>
            <p className="text-zinc-400 leading-relaxed">{performance.notes}</p>
          </div>
        )}

        {/* Metadata Footer */}
        <div className="pt-6 border-t border-zinc-800 text-[11px] text-zinc-500 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> Logged: {new Date(performance.created_at).toLocaleDateString()}
            </span>
            <span>·</span>
            <span>RLS Protected Record</span>
          </div>
          <Link
            href="/admin"
            className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Edit via Admin Console
          </Link>
        </div>
      </div>
    </div>
  );
}
