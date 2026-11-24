'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Disc, Search, Music, Calendar, ArrowRight } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { Song, Performance } from '@/lib/supabase/types';

function SongArchiveContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get('search') || '';

  const [songs, setSongs] = useState<Song[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  useEffect(() => {
    async function load() {
      const [sList, pList] = await Promise.all([
        dataService.getSongs(),
        dataService.getPerformances(undefined, false),
      ]);
      setSongs(sList);
      setPerformances(pList);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.original_artist && s.original_artist.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.genre && s.genre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Disc className="w-4 h-4" /> Society Repertoire
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            Song Archive
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Complete catalogue of songs, medleys, and backing tracks performed by KORUS bands and dance crews.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search songs by title, original artist, genre..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
        />
      </div>

      {/* Songs Table */}
      {loading ? (
        <div className="py-20 text-center text-zinc-500">Loading song catalog...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-zinc-500">No songs found matching your search.</div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Song Title</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Original Artist</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Genre</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Release Year</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Times Performed</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Associated Routines / Bands</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((song) => {
                const associatedPerfs = performances.filter((p) =>
                  p.songs?.some((s) => s.id === song.id)
                );

                return (
                  <tr key={song.id} className="transition-colors">
                    <td className="font-semibold text-zinc-200 text-sm">
                      &ldquo;{song.title}&rdquo;
                    </td>
                    <td className="text-sm text-zinc-300">
                      {song.original_artist || 'Original Composition'}
                    </td>
                    <td>
                      {song.genre ? (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {song.genre}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500">—</span>
                      )}
                    </td>
                    <td className="text-xs text-zinc-400">
                      {song.release_year || '—'}
                    </td>
                    <td>
                      <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {associatedPerfs.length} {associatedPerfs.length === 1 ? 'time' : 'times'}
                      </span>
                    </td>
                    <td className="text-xs text-zinc-400">
                      {associatedPerfs.length > 0 ? (
                        <div className="space-y-1">
                          {associatedPerfs.map((p) => (
                            <Link
                              key={p.id}
                              href={`/${p.department}/${p.id}`}
                              className="block hover:text-purple-400 transition-colors line-clamp-1"
                            >
                              · {p.title} ({p.department})
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-600 italic">No stage records yet</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function SongArchivePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-zinc-500">Loading songs...</div>}>
      <SongArchiveContent />
    </Suspense>
  );
}
