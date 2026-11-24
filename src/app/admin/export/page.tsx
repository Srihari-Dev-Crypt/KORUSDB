'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import { Download, FileSpreadsheet, ShieldCheck, Check } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { sanitizeCsvExportRows } from '@/lib/security';
import { downloadCsv } from '@/lib/utils';

export default function AdminExportPage() {
  const [exporting, setExporting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleExport = async (dataset: 'performances' | 'performers' | 'events' | 'crews' | 'songs') => {
    setExporting(true);
    setFeedback(null);

    try {
      let rawRows: any[] = [];

      if (dataset === 'performances') {
        const perfs = await dataService.getPerformances(undefined, false);
        rawRows = perfs.map((p) => ({
          ID: p.id,
          Title: p.title,
          Department: p.department,
          EventName: p.event?.name || '',
          EventDate: p.event?.event_date || '',
          DanceStyle: p.dance_style || '',
          Songs: p.songs?.map((s) => s.title).join('; ') || '',
          Performers: p.participants?.map((pt) => pt.performer?.full_name).join('; ') || '',
          Notes: p.notes || '',
        }));
      } else if (dataset === 'performers') {
        const perfs = await dataService.getPerformers(false);
        rawRows = perfs.map((p) => ({
          ID: p.id,
          FullName: p.full_name,
          StageName: p.stage_name || '',
          Departments: p.departments.join('; '),
          Bio: p.bio || '',
          JoinDate: p.join_date || '',
        }));
      } else if (dataset === 'events') {
        const evs = await dataService.getEvents(false);
        rawRows = evs.map((e) => ({
          ID: e.id,
          Name: e.name,
          EventDate: e.event_date,
          Category: e.category,
          Venue: e.venue || '',
          Description: e.description || '',
        }));
      } else if (dataset === 'crews') {
        const crews = await dataService.getCrews(false);
        rawRows = crews.map((c) => ({
          ID: c.id,
          Name: c.name,
          DanceStyle: c.dance_style || '',
          FormedDate: c.formed_date || '',
          Description: c.description || '',
        }));
      } else if (dataset === 'songs') {
        const songs = await dataService.getSongs();
        rawRows = songs.map((s) => ({
          ID: s.id,
          Title: s.title,
          OriginalArtist: s.original_artist || '',
          Genre: s.genre || '',
          ReleaseYear: s.release_year || '',
        }));
      }

      // Sanitize against Formula Injection (CWE-1236)
      const sanitizedRows = sanitizeCsvExportRows(rawRows);
      const csvString = Papa.unparse(sanitizedRows);
      const filename = `korus_${dataset}_export_${new Date().toISOString().split('T')[0]}.csv`;

      downloadCsv(filename, csvString);
      setFeedback(`Successfully generated sanitized export for ${dataset}!`);
    } catch {
      setFeedback('Failed to generate export dataset.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Download className="w-4 h-4" /> Data Portability & Reporting
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-zinc-100">
          Data Export & Spreadsheet Generation
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Export verified society performance archives to CSV and spreadsheet formats, protected against CSV / formula injection (CWE-1236).
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Performances Archive</h2>
              <p className="text-xs text-zinc-500">All Music & Dance performance records</p>
            </div>
          </div>
          <button
            onClick={() => handleExport('performances')}
            disabled={exporting}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Performances (.CSV)
          </button>
        </div>

        <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Performer Registry</h2>
              <p className="text-xs text-zinc-500">Artist profiles, stage aliases, and departments</p>
            </div>
          </div>
          <button
            onClick={() => handleExport('performers')}
            disabled={exporting}
            className="w-full py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Performers (.CSV)
          </button>
        </div>

        <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Events Index</h2>
              <p className="text-xs text-zinc-500">Festivals, concerts, and categories</p>
            </div>
          </div>
          <button
            onClick={() => handleExport('events')}
            disabled={exporting}
            className="w-full py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Events (.CSV)
          </button>
        </div>

        <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Songs & Tracks Repertoire</h2>
              <p className="text-xs text-zinc-500">All registered songs and artist attributes</p>
            </div>
          </div>
          <button
            onClick={() => handleExport('songs')}
            disabled={exporting}
            className="w-full py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Songs (.CSV)
          </button>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 text-xs text-zinc-400 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <span>
          <strong>Formula Injection Guard Active:</strong> Any cell beginning with formula identifiers (<code>=</code>, <code>+</code>, <code>-</code>, <code>@</code>) is automatically escaped with single quotes to protect administrator spreadsheet programs from remote code execution or exfiltration.
        </span>
      </div>
    </div>
  );
}
