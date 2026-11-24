import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="max-w-md mx-auto my-20 p-8 rounded-3xl border border-rose-500/20 bg-zinc-900/60 text-center space-y-4 shadow-2xl">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
        <ShieldAlert className="w-7 h-7" />
      </div>

      <h1 className="text-xl font-black text-zinc-100">
        403 — Unauthorized Access
      </h1>

      <p className="text-xs text-zinc-400 leading-relaxed">
        You do not possess the required administrator privileges to view or execute actions on this resource. All unauthorized access attempts are logged with IP addresses to the audit trail.
      </p>

      <div className="pt-4 flex flex-col gap-2">
        <Link
          href="/login"
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors"
        >
          Sign In as Administrator
        </Link>
        <Link
          href="/"
          className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          Return to Public Archive
        </Link>
      </div>
    </div>
  );
}
