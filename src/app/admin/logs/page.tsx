'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Shield, Clock, CheckCircle2, Search, Filter } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { AuditLog } from '@/lib/supabase/types';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');

  useEffect(() => {
    async function load() {
      const data = await dataService.getAuditLogs();
      setLogs(data);
      setLoading(false);
    }
    load();

    const handleUpdate = () => load();
    window.addEventListener('korus-data-updated', handleUpdate);
    return () => window.removeEventListener('korus-data-updated', handleUpdate);
  }, []);

  const actionTypes = Array.from(new Set(logs.map(l => l.action)));

  const filtered = logs.filter(l => {
    const matchesSearch =
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.entity_id && l.entity_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction = selectedAction === 'ALL' || l.action === selectedAction;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4" /> Security & Governance
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-zinc-100">
          Administrative Audit Trail
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Cryptographically recorded, immutable trail of administrative operations, modifications, and record recoveries.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by action, entity type, record ID..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500" />
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="ALL">All Actions</option>
            {actionTypes.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-zinc-500">Loading audit log trail...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-zinc-500">No activity logs matching filter.</div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Timestamp</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Action</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Target Entity</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Record ID</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase">Changes / Payload</th>
                <th className="text-xs font-semibold text-zinc-400 uppercase text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="transition-colors">
                  <td className="text-xs text-zinc-400 whitespace-nowrap font-mono">
                    {new Date(log.created_at).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/25">
                      {log.action}
                    </span>
                  </td>
                  <td className="text-xs font-semibold text-zinc-300">
                    {log.entity_type}
                  </td>
                  <td className="text-xs font-mono text-zinc-500">
                    {log.entity_id ? log.entity_id.slice(0, 8) + '...' : 'System'}
                  </td>
                  <td className="text-[11px] text-zinc-400 font-mono max-w-xs truncate">
                    {log.new_values ? JSON.stringify(log.new_values) : log.previous_values ? JSON.stringify(log.previous_values) : '—'}
                  </td>
                  <td className="text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> SUCCESS
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
