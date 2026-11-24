'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  PlusCircle, Users, Calendar, Flame, Disc, 
  Upload, Download, FileText, Trash2, ShieldCheck, 
  ArrowRight, Activity, AlertTriangle 
} from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { SocietyAnalytics, AuditLog } from '@/lib/supabase/types';
import { formatDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<SocietyAnalytics | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [trashCount, setTrashCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [a, l, t] = await Promise.all([
        dataService.getSocietyAnalytics(),
        dataService.getAuditLogs(),
        dataService.getTrashRecords(),
      ]);
      setAnalytics(a);
      setLogs(l.slice(0, 5));
      const totalTrash = t.performances.length + t.performers.length + t.events.length + t.crews.length;
      setTrashCount(totalTrash);
      setLoading(false);
    }
    load();

    const handleUpdate = () => load();
    window.addEventListener('korus-data-updated', handleUpdate);
    return () => window.removeEventListener('korus-data-updated', handleUpdate);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-100">
            Administrative Operations Center
          </h1>
          <p className="text-xs text-zinc-400">
            Manage society archive records, performer duplicates, crew rosters, and system governance.
          </p>
        </div>
        <Link
          href="/admin/performances/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-md shadow-purple-600/25 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Add New Performance
        </Link>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/admin/performances/new?dept=music"
          className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-850 hover:border-purple-500/40 transition-all space-y-1.5 group"
        >
          <span className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
            +M
          </span>
          <div className="text-xs font-bold text-zinc-200 group-hover:text-purple-300">Add Music Show</div>
          <div className="text-[11px] text-zinc-500">Bands & instrumentalists</div>
        </Link>

        <Link
          href="/admin/performances/new?dept=dance"
          className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-850 hover:border-pink-500/40 transition-all space-y-1.5 group"
        >
          <span className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
            +D
          </span>
          <div className="text-xs font-bold text-zinc-200 group-hover:text-pink-300">Add Dance Routine</div>
          <div className="text-[11px] text-zinc-500">Crew battles & routines</div>
        </Link>

        <Link
          href="/admin/import"
          className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-850 hover:border-sky-500/40 transition-all space-y-1.5 group"
        >
          <span className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
            <Upload className="w-4 h-4" />
          </span>
          <div className="text-xs font-bold text-zinc-200 group-hover:text-sky-300">Import CSV Records</div>
          <div className="text-[11px] text-zinc-500">Bulk upload & validate</div>
        </Link>

        <Link
          href="/admin/trash"
          className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-850 hover:border-amber-500/40 transition-all space-y-1.5 group"
        >
          <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
            <Trash2 className="w-4 h-4" />
          </span>
          <div className="text-xs font-bold text-zinc-200 group-hover:text-amber-300">Trash & Recovery</div>
          <div className="text-[11px] text-zinc-500">{trashCount} soft-deleted items</div>
        </Link>
      </div>

      {/* Aggregate Database Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-3xl bg-zinc-900/40 border border-zinc-800">
        <div>
          <span className="text-[10px] text-zinc-500 uppercase font-bold block">Live Performers</span>
          <span className="text-2xl font-black text-zinc-100">{analytics?.total_performers || 0}</span>
        </div>
        <div>
          <span className="text-[10px] text-zinc-500 uppercase font-bold block">Concerts & Shows</span>
          <span className="text-2xl font-black text-purple-400">{analytics?.total_music_performances || 0}</span>
        </div>
        <div>
          <span className="text-[10px] text-zinc-500 uppercase font-bold block">Dance Routines</span>
          <span className="text-2xl font-black text-pink-400">{analytics?.total_dance_performances || 0}</span>
        </div>
        <div>
          <span className="text-[10px] text-zinc-500 uppercase font-bold block">Audited Events</span>
          <span className="text-2xl font-black text-sky-400">{analytics?.total_events || 0}</span>
        </div>
      </div>

      {/* Recent Administrative Activity Logs */}
      <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Recent Administrative Activity Trail
            </h3>
            <p className="text-xs text-zinc-500">Immutable audit log for security accountability</p>
          </div>
          <Link
            href="/admin/logs"
            className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
          >
            All Logs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl border border-zinc-850 bg-zinc-950/60 flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-800 text-purple-300 border border-zinc-700">
                    {log.action}
                  </span>
                  <span className="font-medium text-zinc-300">Target: {log.entity_type}</span>
                </div>
                <div className="text-[11px] text-zinc-500">
                  {log.entity_id ? `Record: ${log.entity_id.slice(0, 8)}...` : 'System entity'}
                </div>
              </div>
              <div className="text-[11px] text-zinc-500">
                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
