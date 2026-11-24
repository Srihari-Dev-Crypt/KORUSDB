'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line 
} from 'recharts';
import { 
  BarChart3, TrendingUp, Users, Calendar, 
  Flame, Music, Disc, Filter, ArrowRight 
} from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { SocietyAnalytics } from '@/lib/supabase/types';

const COLORS = ['#8B5CF6', '#EC4899', '#38BDF8', '#34D399', '#FBBF24', '#F43F5E'];

export default function AnalyticsDashboardPage() {
  const [analytics, setAnalytics] = useState<SocietyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState<'ALL' | 'music' | 'dance'>('ALL');

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

  if (loading) {
    return <div className="py-20 text-center text-zinc-500">Calculating society statistics and charts...</div>;
  }

  if (!analytics) return null;

  // Prepare Pie data
  const pieData = [
    { name: 'Music Performances', value: analytics.total_music_performances, color: '#8B5CF6' },
    { name: 'Dance Performances', value: analytics.total_dance_performances, color: '#EC4899' },
  ];

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" /> Comprehensive Society Intelligence
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            Analytics & Performance Insights
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Authoritative dynamic metrics derived mathematically from immutable performance and participant records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500" />
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value as any)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-purple-500/50"
          >
            <option value="ALL">All Departments</option>
            <option value="music">Music Focus</option>
            <option value="dance">Dance Focus</option>
          </select>
        </div>
      </div>

      {/* Top Level Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-1">
          <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Registered Artists</span>
          <div className="text-2xl font-black text-zinc-100">{analytics.total_performers}</div>
        </div>
        <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-1">
          <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Documented Events</span>
          <div className="text-2xl font-black text-sky-400">{analytics.total_events}</div>
        </div>
        <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-1">
          <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Total Performances</span>
          <div className="text-2xl font-black text-zinc-100">{analytics.total_performances}</div>
        </div>
        <div className="p-4 rounded-2xl border border-purple-500/20 bg-purple-950/15 space-y-1">
          <span className="text-[10px] uppercase font-semibold text-purple-400 block">Music Concerts</span>
          <div className="text-2xl font-black text-purple-300">{analytics.total_music_performances}</div>
        </div>
        <div className="p-4 rounded-2xl border border-pink-500/20 bg-pink-950/15 space-y-1">
          <span className="text-[10px] uppercase font-semibold text-pink-400 block">Dance Routines</span>
          <div className="text-2xl font-black text-pink-300">{analytics.total_dance_performances}</div>
        </div>
        <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/15 space-y-1">
          <span className="text-[10px] uppercase font-semibold text-emerald-400 block">Active Crews</span>
          <div className="text-2xl font-black text-emerald-300">{analytics.total_crews}</div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performances by Month Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Performances By Month
              </h3>
              <p className="text-xs text-zinc-500">Distribution across academic calendar</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-500"></span> Music
              </span>
              <span className="flex items-center gap-1.5 text-pink-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-pink-500"></span> Dance
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.performances_by_month} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '0.75rem',
                    color: '#f4f4f5',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="music" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Music" />
                <Bar dataKey="dance" fill="#EC4899" radius={[4, 4, 0, 0]} name="Dance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Music vs Dance Pie Chart */}
        <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Disc className="w-4 h-4 text-pink-400" />
              Music vs Dance Distribution
            </h3>
            <p className="text-xs text-zinc-500">Total society performance breakdown</p>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '0.75rem',
                    color: '#f4f4f5',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val) => <span className="text-xs text-zinc-300">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center text-[11px] text-zinc-500 pt-2 border-t border-zinc-800">
            Music: {analytics.total_music_performances} ({Math.round((analytics.total_music_performances / (analytics.total_performances || 1)) * 100)}%) ·
            Dance: {analytics.total_dance_performances} ({Math.round((analytics.total_dance_performances / (analytics.total_performances || 1)) * 100)}%)
          </div>
        </div>
      </div>

      {/* Leaderboards and Deep Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Most Active Performers */}
        <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 space-y-4">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            Most Active Performers
          </h3>
          <div className="space-y-3">
            {analytics.top_performers.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-400 font-bold flex items-center justify-center text-[10px]">
                    {i + 1}
                  </span>
                  <Link
                    href={`/performers/${p.id}`}
                    className="font-medium text-zinc-200 hover:text-purple-400 transition-colors"
                  >
                    {p.name}
                  </Link>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-bold">
                  {p.count} shows
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active Dance Crews */}
        <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 space-y-4">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Flame className="w-4 h-4 text-pink-400" />
            Most Active Dance Crews
          </h3>
          <div className="space-y-3">
            {analytics.top_crews.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-400 font-bold flex items-center justify-center text-[10px]">
                    {i + 1}
                  </span>
                  <Link
                    href={`/crews/${c.id}`}
                    className="font-medium text-zinc-200 hover:text-pink-400 transition-colors"
                  >
                    {c.name}
                  </Link>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 font-bold">
                  {c.count} routines
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Performed Songs */}
        <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 space-y-4">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Disc className="w-4 h-4 text-emerald-400" />
            Most Performed Songs
          </h3>
          <div className="space-y-3">
            {analytics.top_songs.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-400 font-bold flex items-center justify-center text-[10px]">
                    {i + 1}
                  </span>
                  <div>
                    <div className="font-medium text-zinc-200 line-clamp-1">&ldquo;{s.title}&rdquo;</div>
                    <div className="text-[10px] text-zinc-500">{s.artist}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                  {s.count}x
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
