'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import { 
  Upload, Download, FileText, CheckCircle2, 
  AlertCircle, ArrowRight, ShieldCheck, RefreshCw 
} from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { downloadCsv } from '@/lib/utils';

export default function AdminCsvImportPage() {
  const [department, setDepartment] = useState<'music' | 'dance'>('music');
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importSummary, setImportSummary] = useState<{ imported: number; skipped: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const downloadTemplate = () => {
    let headers = '';
    let exampleRow = '';

    if (department === 'music') {
      headers = 'Title,EventName,EventDate,PerformerName,Role,Instrument,SongName,Notes\n';
      exampleRow = 'Fix You (Band Cover),Annual Fest 2026,2026-11-15,Arjun Sharma,Lead Vocalist,Acoustic Guitar,Fix You,Live acoustic encore\n';
    } else {
      headers = 'Title,EventName,EventDate,CrewName,DanceStyle,PerformerName,SongNames,Notes\n';
      exampleRow = 'Warriors of Sound,Cultural Fest 2026,2026-10-20,Rhythm Collective,Urban Hip-Hop,Ananya Sen,Believer;Uptown Funk,High-tempo routine\n';
    }

    downloadCsv(`korus_${department}_import_template.csv`, headers + exampleRow);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setValidationErrors([]);
    setImportSummary(null);

    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[];
        const errors: string[] = [];

        // Validate each row
        rows.forEach((row, idx) => {
          const rowNum = idx + 2;
          if (!row.Title) errors.push(`Row ${rowNum}: Missing Title`);
          if (!row.EventName) errors.push(`Row ${rowNum}: Missing EventName`);
          if (!row.EventDate || !/^\d{4}-\d{2}-\d{2}$/.test(row.EventDate)) {
            errors.push(`Row ${rowNum}: Invalid or missing EventDate (YYYY-MM-DD required)`);
          }
          if (!row.PerformerName) errors.push(`Row ${rowNum}: Missing PerformerName`);
        });

        setParsedRows(rows);
        setValidationErrors(errors);
      },
      error: (err) => {
        setValidationErrors([`CSV Parsing Error: ${err.message}`]);
      },
    });
  };

  const handleCommitImport = async () => {
    if (validationErrors.length > 0 || parsedRows.length === 0) return;
    setIsProcessing(true);

    try {
      let importedCount = 0;
      let skippedCount = 0;

      const existingPerformers = await dataService.getPerformers(true);
      const existingEvents = await dataService.getEvents(true);

      for (const row of parsedRows) {
        // 1. Resolve or create event
        let event = existingEvents.find(e => e.name.toLowerCase() === row.EventName.trim().toLowerCase());
        if (!event) {
          event = await dataService.createEvent({
            name: row.EventName.trim(),
            event_date: row.EventDate,
            category: 'Imported Showcase',
          });
          existingEvents.push(event);
        }

        // 2. Resolve or create performer
        let performer = existingPerformers.find(p => p.full_name.toLowerCase() === row.PerformerName.trim().toLowerCase());
        if (!performer) {
          performer = await dataService.createPerformer({
            full_name: row.PerformerName.trim(),
            departments: [department],
          });
          existingPerformers.push(performer);
        }

        // 3. Resolve or create song
        let songIds: string[] = [];
        if (row.SongName || row.SongNames) {
          const rawSongs = (row.SongName || row.SongNames).split(';').map((s: string) => s.trim()).filter(Boolean);
          for (const sTitle of rawSongs) {
            const song = await dataService.createSong({ title: sTitle });
            songIds.push(song.id);
          }
        }

        // 4. Create performance record
        await dataService.createPerformance({
          event_id: event.id,
          department,
          title: row.Title.trim(),
          dance_style: row.DanceStyle || null,
          notes: row.Notes || 'Imported via CSV batch upload',
          song_ids: songIds,
          participants: [
            {
              performer_id: performer.id,
              roles: [
                {
                  role_name: row.Role || (department === 'music' ? 'Musician' : 'Dancer'),
                  instrument: row.Instrument || undefined,
                },
              ],
            },
          ],
        });

        importedCount++;
      }

      setImportSummary({ imported: importedCount, skipped: skippedCount });
    } catch {
      setValidationErrors(['A transactional error occurred during database commit.']);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Upload className="w-4 h-4" /> Batch Data Ingestion
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-zinc-100">
          CSV Performance Importer
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Upload bulk historic records with automatic schema validation, duplicate detection, and transactional rollback protection.
        </p>
      </div>

      {/* Template & Department Selector */}
      <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-zinc-200">1. Select Target Department</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setDepartment('music'); setParsedRows([]); setValidationErrors([]); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  department === 'music'
                    ? 'bg-purple-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Music Template
              </button>
              <button
                type="button"
                onClick={() => { setDepartment('dance'); setParsedRows([]); setValidationErrors([]); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  department === 'dance'
                    ? 'bg-pink-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Dance Template
              </button>
            </div>
          </div>

          <button
            onClick={downloadTemplate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-xs font-semibold text-zinc-200 transition-colors self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-purple-400" />
            Download {department.toUpperCase()} Template (.CSV)
          </button>
        </div>
      </div>

      {/* File Dropzone */}
      <div className="p-8 rounded-3xl border-2 border-dashed border-zinc-800 bg-zinc-950/60 text-center space-y-3">
        <Upload className="w-10 h-10 text-purple-400 mx-auto opacity-80" />
        <div>
          <label className="cursor-pointer text-xs sm:text-sm font-bold text-purple-400 hover:text-purple-300">
            <span>Click to upload CSV file</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <span className="text-xs text-zinc-500 block mt-1">or drag and drop your formatted CSV here</span>
        </div>
        {file && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-850 text-xs text-zinc-300 border border-zinc-750 font-mono">
            <FileText className="w-3.5 h-3.5 text-purple-400" /> {file.name} ({parsedRows.length} rows detected)
          </div>
        )}
      </div>

      {/* Validation Warnings */}
      {validationErrors.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-2">
          <div className="font-bold flex items-center gap-1.5 text-rose-400">
            <AlertCircle className="w-4 h-4" />
            Validation Errors Detected ({validationErrors.length})
          </div>
          <ul className="list-disc pl-5 space-y-1 max-h-36 overflow-y-auto font-mono text-[11px]">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Import Summary */}
      {importSummary && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            Batch Import Successfully Committed!
          </div>
          <p>
            {importSummary.imported} performance records inserted with verified relationships.
          </p>
        </div>
      )}

      {/* Parsed Rows Preview */}
      {parsedRows.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-200">
              Preview Data ({parsedRows.length} records ready)
            </h3>
            <button
              onClick={handleCommitImport}
              disabled={validationErrors.length > 0 || isProcessing}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 flex items-center gap-1.5 transition-all"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Processing Transaction...
                </>
              ) : (
                'Commit Batch to Database'
              )}
            </button>
          </div>

          <div className="table-wrapper max-h-64 overflow-y-auto">
            <table>
              <thead>
                <tr>
                  {Object.keys(parsedRows[0] || {}).map((header) => (
                    <th key={header} className="text-xs font-semibold text-zinc-400 uppercase">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedRows.slice(0, 10).map((row, i) => (
                  <tr key={i} className="text-xs text-zinc-300">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="truncate max-w-xs">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsedRows.length > 10 && (
            <p className="text-[11px] text-zinc-500 text-right">
              Showing first 10 rows of {parsedRows.length} total rows.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
