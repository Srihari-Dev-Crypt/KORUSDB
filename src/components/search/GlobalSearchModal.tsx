'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, User, Calendar, Users, Music, ArrowRight, X, Sparkles } from 'lucide-react';
import { dataService } from '@/lib/data-service';

export function GlobalSearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    performers: any[];
    events: any[];
    crews: any[];
    songs: any[];
  }>({ performers: [], events: [], crews: [], songs: [] });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ performers: [], events: [], crews: [], songs: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      const res = await dataService.searchGlobal(query);
      setResults(res);
      setLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const totalResults =
    results.performers.length + results.events.length + results.crews.length + results.songs.length;

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onClose={onClose}
      aria-labelledby="global-search-title"
      className="p-0 bg-transparent backdrop:bg-black/75 backdrop:backdrop-blur-sm max-w-2xl w-full mx-auto my-auto rounded-2xl shadow-2xl border border-zinc-800 text-zinc-100 open:animate-in open:fade-in-0 open:zoom-in-95"
    >
      <div className="bg-zinc-950/95 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-zinc-800/80 bg-zinc-900/40">
          <Search className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by artist, event, crew, song, instrument, or role (e.g. Arjun, Guitarist)..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
            aria-label="Global search input"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-zinc-500 hover:text-zinc-300 p-1 mr-2"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-zinc-400 bg-zinc-800 border border-zinc-700 rounded shadow-sm">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-4 max-h-[60vh]">
          {loading && (
            <div className="py-8 text-center text-zinc-500 flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></span>
              Searching the KORUS archive...
            </div>
          )}

          {!loading && !query && (
            <div className="py-10 text-center text-zinc-500 space-y-2">
              <Sparkles className="w-8 h-8 text-purple-400/50 mx-auto" />
              <p className="text-sm font-medium text-zinc-400">Search the Central Performance Archive</p>
              <p className="text-xs text-zinc-600 max-w-sm mx-auto">
                Find individual performers, multi-song dance routines, events, crew histories, or songs performed by KORUS artists.
              </p>
            </div>
          )}

          {!loading && query && totalResults === 0 && (
            <div className="py-10 text-center text-zinc-500">
              <p className="text-sm">No records found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-zinc-600 mt-1">Try searching by instrument, crew, or partial name.</p>
            </div>
          )}

          {/* Performers Section */}
          {results.performers.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2 px-2">
                <User className="w-3.5 h-3.5" />
                Performers ({results.performers.length})
              </div>
              <div className="space-y-1">
                {results.performers.map((p) => (
                  <Link
                    key={p.id}
                    href={p.url}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-850 hover:bg-purple-950/20 border border-transparent hover:border-purple-500/20 transition-all group"
                  >
                    <div>
                      <div className="text-sm font-medium text-zinc-200 group-hover:text-purple-300">
                        {p.name}
                      </div>
                      <div className="text-xs text-zinc-500">{p.subtitle}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Events Section */}
          {results.events.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2 px-2">
                <Calendar className="w-3.5 h-3.5" />
                Events ({results.events.length})
              </div>
              <div className="space-y-1">
                {results.events.map((e) => (
                  <Link
                    key={e.id}
                    href={e.url}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-850 hover:bg-sky-950/20 border border-transparent hover:border-sky-500/20 transition-all group"
                  >
                    <div>
                      <div className="text-sm font-medium text-zinc-200 group-hover:text-sky-300">{e.name}</div>
                      <div className="text-xs text-zinc-500">{e.subtitle}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Dance Crews Section */}
          {results.crews.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-pink-400 uppercase tracking-wider mb-2 px-2">
                <Users className="w-3.5 h-3.5" />
                Dance Crews ({results.crews.length})
              </div>
              <div className="space-y-1">
                {results.crews.map((c) => (
                  <Link
                    key={c.id}
                    href={c.url}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-850 hover:bg-pink-950/20 border border-transparent hover:border-pink-500/20 transition-all group"
                  >
                    <div>
                      <div className="text-sm font-medium text-zinc-200 group-hover:text-pink-300">{c.name}</div>
                      <div className="text-xs text-zinc-500">{c.subtitle}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-pink-400 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Songs Section */}
          {results.songs.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 px-2">
                <Music className="w-3.5 h-3.5" />
                Songs ({results.songs.length})
              </div>
              <div className="space-y-1">
                {results.songs.map((s) => (
                  <Link
                    key={s.id}
                    href={s.url}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-850 hover:bg-emerald-950/20 border border-transparent hover:border-emerald-500/20 transition-all group"
                  >
                    <div>
                      <div className="text-sm font-medium text-zinc-200 group-hover:text-emerald-300">{s.name}</div>
                      <div className="text-xs text-zinc-500">{s.subtitle}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-zinc-900/60 border-t border-zinc-850 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Search case-insensitive with partial & typo matching</span>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}
