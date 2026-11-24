'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Music, Flame, Users, Calendar, Disc, 
  ArrowRight, Sparkles, TrendingUp, ShieldCheck, 
  Play, Radio, Activity, Search
} from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { Performance, SocietyAnalytics } from '@/lib/supabase/types';
import { formatDate } from '@/lib/utils';
import { GlobalSearchModal } from '@/components/search/GlobalSearchModal';

export default function HomePage() {
  const [analytics, setAnalytics] = useState<SocietyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await dataService.getSocietyAnalytics();
      setAnalytics(data);
      setLoading(false);
    }
    load();

    const handleUpdate = () => load();
    window.addEventListener('korus-data-updated', handleUpdate);
    return () => window.removeEventListener('korus-data-updated', handleUpdate);
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section with Awwwards-tier craft and artistic energy */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/70 via-zinc-950 to-zinc-950 p-6 sm:p-10 lg:p-14 shadow-2xl">
        {/* Ambient atmospheric glows */}
        <div className="absolute top-0 right-1/4 -z-10 h-72 w-72 rounded-full bg-purple-600/15 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 -z-10 h-80 w-80 rounded-full bg-pink-600/10 blur-[120px] pointer-events-none" />

        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold tracking-wide">
            <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            Official Centralized Digital Archive
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-100 leading-[1.1]">
            Every Artist.{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
              Every Stage.
            </span>{' '}
            Every Performance.
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 font-normal leading-relaxed max-w-2xl">
            Welcome to <strong className="text-zinc-200">KORUS</strong> — the permanent living archive of college music concerts, rock ensembles, urban street dance battles, and cultural showcases. Discover registered artists, song histories, and multi-disciplinary crews.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-purple-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Search className="w-4 h-4" />
              Search Archive (⌘K)
            </button>
            <Link
              href="/music"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 font-medium text-xs sm:text-sm transition-all"
            >
              <Music className="w-4 h-4 text-purple-400" />
              Music Archive
            </Link>
            <Link
              href="/dance"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 font-medium text-xs sm:text-sm transition-all"
            >
              <Flame className="w-4 h-4 text-pink-400" />
              Dance Crews
            </Link>
          </div>
        </div>

        {/* Live Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-8 border-t border-zinc-800/60">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-400" /> Registered Performers
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
              {loading ? '...' : analytics?.total_performers}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" /> Events Documented
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
              {loading ? '...' : analytics?.total_events}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Total Performances
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
              {loading ? '...' : analytics?.total_performances}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-pink-400" /> Active Crews
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
              {loading ? '...' : analytics?.total_crews}
            </div>
          </div>
        </div>
      </section>

      {/* Dual Highlights: Music & Dance Sections */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Music Highlight Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8 hover:border-purple-500/40 transition-all flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Music className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100 group-hover:text-purple-300 transition-colors">
                Music Performance Database
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Explore band performances, lead & backing vocalists, multi-instrumentalists, rhythm sections, and custom stage roles.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-zinc-400">
              <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">Lead Vocalists</span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">Guitarists</span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">Drummers</span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">Beatboxers</span>
            </div>
          </div>
          <div className="pt-6 mt-6 border-t border-zinc-800/80 flex items-center justify-between">
            <span className="text-xs text-purple-400 font-medium">
              {analytics?.total_music_performances || 0} Music Showcases
            </span>
            <Link
              href="/music"
              className="text-xs font-semibold text-zinc-200 hover:text-purple-300 flex items-center gap-1 group-hover:translate-x-1 transition-all"
            >
              Browse Music <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Dance Highlight Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8 hover:border-pink-500/40 transition-all flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100 group-hover:text-pink-300 transition-colors">
                Dance Performance Database
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Discover multi-dancer routines, multi-song medleys, street cyphers, and historical dance crew rosters.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-zinc-400">
              <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">Rhythm Collective</span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">Urban Pulse</span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">Desi Fusion</span>
            </div>
          </div>
          <div className="pt-6 mt-6 border-t border-zinc-800/80 flex items-center justify-between">
            <span className="text-xs text-pink-400 font-medium">
              {analytics?.total_dance_performances || 0} Dance Routines
            </span>
            <Link
              href="/dance"
              className="text-xs font-semibold text-zinc-200 hover:text-pink-300 flex items-center gap-1 group-hover:translate-x-1 transition-all"
            >
              Browse Dance <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Chronological Performances Table */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Recent Archive Records
            </h3>
            <p className="text-xs text-zinc-400">Chronological history across Music and Dance departments</p>
          </div>
          <Link
            href="/analytics"
            className="text-xs font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            Full Analytics <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Performance Title</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Department</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Event</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Date</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Performers / Crew</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.recent_performances.map((perf) => (
                <tr key={perf.id} className="transition-colors">
                  <td className="font-medium text-zinc-200 text-sm">
                    {perf.title}
                  </td>
                  <td>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                        perf.department === 'music'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                      }`}
                    >
                      {perf.department === 'music' ? <Music className="w-3 h-3" /> : <Flame className="w-3 h-3" />}
                      {perf.department}
                    </span>
                  </td>
                  <td className="text-sm text-zinc-300">
                    <Link
                      href={`/events/${perf.event_id}`}
                      className="hover:text-purple-400 transition-colors"
                    >
                      {perf.event?.name || 'KORUS Showcase'}
                    </Link>
                  </td>
                  <td className="text-xs text-zinc-400 whitespace-nowrap">
                    {formatDate(perf.event?.event_date || perf.created_at)}
                  </td>
                  <td className="text-xs text-zinc-400">
                    {perf.participants && perf.participants.length > 0 ? (
                      <span>
                        {perf.participants.map(p => p.performer?.full_name).filter(Boolean).slice(0, 2).join(', ')}
                        {perf.participants.length > 2 ? ` +${perf.participants.length - 2} more` : ''}
                      </span>
                    ) : (
                      'KORUS Artists'
                    )}
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/${perf.department}/${perf.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-purple-400 hover:text-purple-300"
                    >
                      Details <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Global Search Dialog Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
