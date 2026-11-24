import { z } from 'zod';

// ==============================================================================
// 1. INPUT VALIDATION SCHEMAS (ZOD)
// ==============================================================================

export const performerSchema = z.object({
  full_name: z.string().min(2, 'Full name must have at least 2 characters').max(100),
  stage_name: z.string().max(50).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  avatar_url: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  departments: z.array(z.enum(['music', 'dance'])).min(1, 'Select at least one department'),
  join_date: z.string().optional().nullable(),
  is_published: z.boolean().default(true),
});

export const eventSchema = z.object({
  name: z.string().min(2, 'Event name must have at least 2 characters').max(150),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a valid date (YYYY-MM-DD)'),
  venue: z.string().max(150).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  is_published: z.boolean().default(true),
});

export const crewSchema = z.object({
  name: z.string().min(2, 'Crew name must have at least 2 characters').max(100),
  description: z.string().max(1000).optional().nullable(),
  dance_style: z.string().max(100).optional().nullable(),
  formed_date: z.string().optional().nullable(),
  avatar_url: z.string().url().optional().nullable().or(z.literal('')),
  is_published: z.boolean().default(true),
});

export const songSchema = z.object({
  title: z.string().min(1, 'Song title is required').max(150),
  original_artist: z.string().max(100).optional().nullable(),
  genre: z.string().max(50).optional().nullable(),
  release_year: z.number().int().min(1900).max(2100).optional().nullable(),
});

export const performanceParticipantInputSchema = z.object({
  performer_id: z.string().uuid('Invalid performer ID'),
  crew_id: z.string().uuid().optional().nullable(),
  roles: z.array(
    z.object({
      role_name: z.string().min(1, 'Role name required'),
      instrument: z.string().max(100).optional().nullable(),
    })
  ).min(1, 'At least one role is required for each participant'),
});

export const performanceSchema = z.object({
  event_id: z.string().uuid('Invalid event selection'),
  department: z.enum(['music', 'dance']),
  title: z.string().min(2, 'Performance title is required').max(200),
  dance_style: z.string().max(100).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  song_ids: z.array(z.string().uuid()).default([]),
  participants: z.array(performanceParticipantInputSchema).min(1, 'At least one performer must be assigned'),
  is_published: z.boolean().default(true),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ==============================================================================
// 2. FORMULA INJECTION & CSV SANITIZATION
// Prevents CSV / Excel Injection (CWE-1236)
// ==============================================================================

const FORMULA_TRIGGERS = ['=', '+', '-', '@', '\t', '\r'];

export function sanitizeCsvCell(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  let str = String(value).trim();
  // If the cell begins with formula trigger character, escape with leading single-quote
  if (FORMULA_TRIGGERS.some(trigger => str.startsWith(trigger))) {
    return `'${str}`;
  }
  return str;
}

export function sanitizeCsvExportRows(rows: Record<string, any>[]): Record<string, any>[] {
  return rows.map(row => {
    const sanitized: Record<string, any> = {};
    for (const [key, val] of Object.entries(row)) {
      sanitized[key] = sanitizeCsvCell(val);
    }
    return sanitized;
  });
}

// ==============================================================================
// 3. FUZZY MATCHING & DUPLICATE DETECTION FOR PERFORMERS
// ==============================================================================

export function calculateLevenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

export function calculateSimilarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  return (longerLength - calculateLevenshteinDistance(longer, shorter)) / longerLength;
}

export function findPotentialDuplicates(name: string, existingPerformers: Array<{ id: string; full_name: string }>): Array<{ id: string; full_name: string; score: number }> {
  const matches: Array<{ id: string; full_name: string; score: number }> = [];
  const normalized = name.trim().toLowerCase();

  for (const performer of existingPerformers) {
    const targetNorm = performer.full_name.trim().toLowerCase();
    const score = calculateSimilarity(normalized, targetNorm);
    if (score >= 0.75 || targetNorm.includes(normalized) || normalized.includes(targetNorm)) {
      matches.push({
        id: performer.id,
        full_name: performer.full_name,
        score: Math.round(score * 100),
      });
    }
  }

  return matches.sort((a, b) => b.score - a.score);
}
