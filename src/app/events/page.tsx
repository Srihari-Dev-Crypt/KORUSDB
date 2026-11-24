'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Search, MapPin, Music, Flame, Users, ArrowRight } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import type { Event, EventStats } from '@/lib/supabase/types';
import { formatDate } from '@/lib/utils';

export default function EventsIndexPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, EventStats>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function load() {
      const data = await dataService.getEvents(false);
      setEvents(data);

      const statsObj: Record<string, EventStats> = {};
      for (const ev of data) {
        const s = await dataService.getEventStats(ev.id);
        if (s) statsObj[ev.id] = s;
      }
      setStatsMap(statsObj);
      setLoading(false);
    }
    load();

    const handleUpdate = () => load();
    window.addEventListener('korus-data-updated', handleUpdate);
    return () => window.removeEventListener('korus-data-updated', handleUpdate);
  }, []);

  const filtered = events.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.venue && e.venue.toLowerCase().includes(searchTerm.toLowerCase())) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" /> Society Festivals & Concerts
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            Events Index
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Centralized index of cultural fests, annual galas, freshers concerts, and inter-collegiate showcases.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-600/20 transition-all"
          >
            + Create Event
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
          placeholder="Search events by fest name, venue, or category..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-sky-500/50"
        />
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-20 text-center text-zinc-500">Loading events index...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-zinc-500">No events found matching your search.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((event) => {
            const stats = statsMap[event.id];

            return (
              <div
                key={event.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 hover:border-sky-500/40 hover:bg-zinc-900/70 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1 font-medium text-sky-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(event.event_date)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {event.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-zinc-100 group-hover:text-sky-300 transition-colors">
                      {event.name}
                    </h3>
                    {event.venue && (
                      <span className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
                        <MapPin className="w-3 h-3" /> {event.venue}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {event.description || 'Official KORUS performance event.'}
                  </p>

                  {/* Aggregate Event Statistics */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-zinc-950/70 border border-zinc-850 text-center">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block">Performances</span>
                      <span className="text-sm font-extrabold text-zinc-100">
                        {stats ? stats.total_performances : 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block">Artists</span>
                      <span className="text-sm font-extrabold text-zinc-100">
                        {stats ? stats.total_unique_performers : 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block">Crews</span>
                      <span className="text-sm font-extrabold text-zinc-100">
                        {stats ? stats.total_unique_crews : 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1 text-purple-400 font-medium">
                      <Music className="w-3 h-3" /> {stats?.music_performances_count || 0}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-pink-400 font-medium">
                      <Flame className="w-3 h-3" /> {stats?.dance_performances_count || 0}
                    </span>
                  </div>
                  <Link
                    href={`/events/${event.id}`}
                    className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                  >
                    Event Details <ArrowRight className="w-3.5 h-3.5" />
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
