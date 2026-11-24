'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Development / demo credentials check or Supabase Auth call
    const isMock = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('mock-korus');

    if (isMock) {
      // In local dev without live Supabase credentials configured yet:
      if (email === 'admin@korus.edu' && password === 'KorusAdmin2026!') {
        sessionStorage.setItem('korus_admin_auth', 'true');
        router.push('/admin');
        return;
      }
    }

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Generic error message to prevent account enumeration (Requirement Section 11)
        setError('Invalid authentication credentials or unauthorized administrator access.');
      } else {
        sessionStorage.setItem('korus_admin_auth', 'true');
        router.push('/admin');
      }
    } catch {
      setError('An error occurred during authentication. Please verify network connectivity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 space-y-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Public Archive
        </Link>
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-zinc-100 tracking-tight">
            Administrator Portal
          </h1>
          <p className="text-xs text-zinc-400">
            Secure administrative credentials required for society archive modifications.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Administrator Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@korus.edu"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In as Administrator'}
          </button>
        </form>

        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 text-[11px] text-zinc-400 space-y-1">
          <div className="font-semibold text-zinc-300">Provisioned Admin Credentials (Local Dev):</div>
          <div>Email: <code className="text-purple-300 font-mono">admin@korus.edu</code></div>
          <div>Password: <code className="text-purple-300 font-mono">KorusAdmin2026!</code></div>
        </div>

        <div className="text-center text-[11px] text-zinc-400">
          Public registration is disabled. Administrator accounts are provisioned via trusted database administrator procedures.
        </div>
      </div>
    </div>
  );
}
