import React from 'react';
import Link from 'next/link';
import { Disc, ArrowLeft, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto my-24 p-8 rounded-3xl border border-zinc-800 bg-zinc-900/60 text-center space-y-5 shadow-2xl">
      <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto shadow-inner">
        <Disc className="w-8 h-8 animate-spin" style={{ animationDuration: '8s' }} />
      </div>

      <div className="space-y-1.5">
        <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold">
          Error 404
        </span>
        <h1 className="text-2xl font-black text-zinc-100">
          Track Not Found in Archive
        </h1>
        <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
          The stage record, performer profile, or event index you are seeking does not exist or may have been archived.
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-600/25"
        >
          <Home className="w-4 h-4" /> Home Archive
        </Link>
        <Link
          href="/performers"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <Search className="w-4 h-4" /> Performer Directory
        </Link>
      </div>
    </div>
  );
}
