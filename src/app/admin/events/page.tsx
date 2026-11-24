'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Plus, Trash2, Edit3, MapPin, Search } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import type { Event } from '@/lib/supabase/types';
import { formatDate } from '@/lib/utils';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add Event Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [category, setCategory] = useState('Cultural Fest');
  const [description, setDescription] = useState('');

  useEffect(() => {
    async function load() {
      const data = await dataService.getEvents(false);
      setEvents(data);
      setLoading(false);
    }
    load();

    const handleUpdate = () => load();
    window.addEventListener('korus-data-updated', handleUpdate);
    return () => window.removeEventListener('korus-data-updated', handleUpdate);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !eventDate) return;

    await dataService.createEvent({
      name: name.trim(),
      event_date: eventDate,
      venue: venue.trim() || null,
      category,
      description: description.trim() || null,
    });

    setName('');
    setEventDate('');
    setVenue('');
    setDescription('');
    setShowAddModal(false);
  };

  const handleSoftDelete = async (id: string, eventName: string) => {
    if (confirm(`Move event "${eventName}" to Trash?`)) {
      await dataService.softDeleteEvent(id);
    }
  };

  const filtered = events.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.venue && e.venue.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-100">
            Event Management
          </h1>
          <p className="text-xs text-zinc-400">
            Create events once and attach music and dance performances without data redundancy.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-600/25 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Event
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter events by name, venue..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center text-zinc-500">Loading events...</div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Event Name</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Date</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Category</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Venue</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="transition-colors">
                  <td className="font-semibold text-zinc-200 text-sm">
                    <Link href={`/events/${e.id}`} className="hover:text-purple-400">
                      {e.name}
                    </Link>
                  </td>
                  <td className="text-xs text-zinc-400 whitespace-nowrap">
                    {formatDate(e.event_date)}
                  </td>
                  <td>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {e.category}
                    </span>
                  </td>
                  <td className="text-xs text-zinc-400">
                    {e.venue || '—'}
                  </td>
                  <td className="text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        href={`/events/${e.id}`}
                        className="px-2.5 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-xs font-medium text-zinc-300 border border-zinc-750"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleSoftDelete(e.id, e.name)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-850 transition-colors"
                        title="Move to Trash"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-2xl">
            <h2 className="text-base font-bold text-zinc-100">Create New Event</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Event Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cultural Fest: Tarangini 2026"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Event Date</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none"
                  >
                    <option value="Annual Fest">Annual Fest</option>
                    <option value="Cultural Fest">Cultural Fest</option>
                    <option value="Freshers' Night">Freshers&apos; Night</option>
                    <option value="Showcase">Showcase</option>
                    <option value="Competition">Competition</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Venue (Optional)</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Main University Auditorium, Amphitheater..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Event background, organizing crew, or theme..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                />
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
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
