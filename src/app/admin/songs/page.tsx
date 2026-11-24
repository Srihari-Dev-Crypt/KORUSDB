'use client';

import React, { useEffect, useState } from 'react';
import { Disc, Plus, Search } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { Song } from '@/lib/supabase/types';

export default function AdminSongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add Song Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [originalArtist, setOriginalArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [releaseYear, setReleaseYear] = useState<number | ''>('');

  useEffect(() => {
    async function load() {
      const data = await dataService.getSongs();
      setSongs(data);
      setLoading(false);
    }
    load();

    const handleUpdate = () => load();
    window.addEventListener('korus-data-updated', handleUpdate);
    return () => window.removeEventListener('korus-data-updated', handleUpdate);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await dataService.createSong({
      title: title.trim(),
      original_artist: originalArtist.trim() || undefined,
      genre: genre.trim() || undefined,
      release_year: typeof releaseYear === 'number' ? releaseYear : undefined,
    });

    setTitle('');
    setOriginalArtist('');
    setGenre('');
    setReleaseYear('');
    setShowAddModal(false);
  };

  const filtered = songs.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.original_artist && s.original_artist.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-100">
            Song & Track Management
          </h1>
          <p className="text-xs text-zinc-400">
            Standardized catalog of performed music tracks, mashups, and dance cypher mixes.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-600/25 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Song
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter songs by title, artist, genre..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center text-zinc-500">Loading songs...</div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Title</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Original Artist</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Genre</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Release Year</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Identifier</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="transition-colors">
                  <td className="font-semibold text-zinc-200 text-sm">
                    &ldquo;{s.title}&rdquo;
                  </td>
                  <td className="text-sm text-zinc-300">
                    {s.original_artist || '—'}
                  </td>
                  <td>
                    {s.genre ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {s.genre}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="text-xs text-zinc-400">
                    {s.release_year || '—'}
                  </td>
                  <td className="text-xs font-mono text-zinc-500">
                    {s.id.slice(0, 8)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Song Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-2xl">
            <h2 className="text-base font-bold text-zinc-100">Add Song to Repertoire</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Song Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Fix You"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Original Artist (Optional)</label>
                <input
                  type="text"
                  value={originalArtist}
                  onChange={(e) => setOriginalArtist(e.target.value)}
                  placeholder="Coldplay, Queen, A.R. Rahman..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Genre</label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="Rock, Pop, Funk..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Release Year</label>
                  <input
                    type="number"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(e.target.value ? parseInt(e.target.value) : '')}
                    placeholder="2005"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-md shadow-purple-600/25"
                >
                  Save Song
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
