import React from 'react';
import Link from 'next/link';
import { Music, Shield, GitCommit, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 mt-auto py-10">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-lg tracking-wider text-zinc-100">KORUS</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Official Archive
              </span>
            </div>
            <p className="text-xs text-zinc-400 italic font-medium">
              &ldquo;Every Artist. Every Stage. Every Performance.&rdquo;
            </p>
            <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
              The centralized digital performance repository of the KORUS Music & Dance Society. Preserving student artistry, band concerts, street dance cyphers, and cultural memories with cryptographic integrity.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">Sections</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><Link href="/music" className="hover:text-purple-400 transition-colors">Music Performances</Link></li>
              <li><Link href="/dance" className="hover:text-pink-400 transition-colors">Dance Routines & Crews</Link></li>
              <li><Link href="/performers" className="hover:text-purple-400 transition-colors">Performer Registry</Link></li>
              <li><Link href="/events" className="hover:text-purple-400 transition-colors">Festival & Event Index</Link></li>
              <li><Link href="/songs" className="hover:text-purple-400 transition-colors">Song Archive</Link></li>
              <li><Link href="/analytics" className="hover:text-purple-400 transition-colors">Society Analytics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">Security & Governance</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><Link href="/admin" className="hover:text-purple-400 transition-colors flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-purple-400" /> Admin Access</Link></li>
              <li><Link href="/admin/logs" className="hover:text-purple-400 transition-colors">Audit Trail</Link></li>
              <li><Link href="/admin/trash" className="hover:text-purple-400 transition-colors">Data Recovery / Trash</Link></li>
              <li className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-900">
                PostgreSQL RLS Protected · Supabase Realtime
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-3">
          <div className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} KORUS Music and Dance Society.</span>
            <span>All rights reserved.</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Database Operational
            </span>
            <span>·</span>
            <span>WCAG 2.2 AA Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
