# KORUS — Performance Management System & Digital Archive

> **"Every Artist. Every Stage. Every Performance."**  
> The official, centralized digital performance archive for the college music and dance society, **KORUS**.

---

## 1. System Overview

**KORUS** is a production-ready, secure, responsive, cloud-native performance management and archiving platform. It replaces ephemeral spreadsheets and fragmented social posts with an immutable relational repository preserving every live band set, vocal recital, street dance battle, cultural festival routine, and stage artist history.

### Core Architectural Guarantees:
- **Relational Integrity**: Unified performance tables connecting events, performers, dance crews, stage roles, and songs.
- **Strict Performance Counting Invariants**:
  - Distinct performance count derived mathematically: Multiple roles (e.g. Lead Vocalist + Guitarist) do **not** inflate an artist's performance count.
  - Multiple songs performed in a single routine do **not** inflate performance counts.
  - Distinct events attended are calculated separately.
  - Soft-deleted or unpublished drafts are strictly excluded from public metrics.
  - Historical performances remain permanently intact even when crew membership changes over time.
- **Enterprise-Grade Security**:
  - PostgreSQL Row Level Security (RLS) enabled on every exposed table.
  - Denial by default for unauthenticated/viewer mutations.
  - Protection against CSV / Excel Formula Injection (CWE-1236) on all exported files.
  - Tamper-resistant, append-only administrative audit logs.
  - Input validation enforced at client, server, and database layers via Zod and Postgres constraints.
- **Supabase Realtime Sync**: Automatic instant multi-device synchronization without manual page refreshes.

---

## 2. Technology Stack

- **Frontend & App Framework**: [Next.js](https://nextjs.org/) (App Router) with [TypeScript](https://www.typescriptlang.org/)
- **Styling & Aesthetics**: [Tailwind CSS](https://tailwindcss.com/) with sophisticated dark theme (`#09090B` background, `#18181B` surface, `#8B5CF6` violet, `#EC4899` pink)
- **Database & Storage**: [Supabase](https://supabase.com/) / [PostgreSQL](https://www.postgresql.org/) with pg_trgm for fuzzy search
- **Security & Policies**: PostgreSQL Row-Level Security (RLS) with `WITH (security_invoker = true)` views
- **Authentication**: Supabase Auth (Email & Password, Session management, Role-based guards)
- **Real-Time Data**: Supabase Realtime (Database replication publications)
- **Analytics & Data Viz**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/) with comprehensive test suites

---

## 3. Database Architecture & Schema

The database is structured into 14 normalized relational tables located in `supabase/migrations/`:

| Migration File | Description |
|---|---|
| `20261124000000_korus_schema.sql` | Core schema: `profiles`, `user_roles`, `app_settings`, `performers`, `events`, `roles`, `crews`, `crew_memberships`, `songs`, `performances`, `performance_participants`, `participant_roles`, `performance_songs`, `audit_logs`, B-tree & Trigram indexes, and RLS policies. |
| `20261124000001_views_and_functions.sql` | `WITH (security_invoker = true)` views (`v_performer_statistics`, `v_event_statistics`, `v_crew_statistics`), canonical role seeds, and transactional soft-delete/restore RPC functions. |
| `20261124000002_seed_data.sql` | Production-grade initial seed: 5 events, 10 performers (Music, Dance, & Both), 3 dance crews, 8 songs, and 5 detailed multi-artist performances. |

### Relational Schema Diagram (Summary):
```
events (1) ─────────────< (M) performances (1) ─────────────< (M) performance_songs (M) >───── (1) songs
                                  │
                                  ├───< (M) performance_participants (M) >───── (1) performers
                                  │                     │
                                  │                     ├───< (M) participant_roles
                                  │                     └───> (1) crews (optional)
                                  │
                                  └─── (Audit Log Trigger) ───> audit_logs
```

---

## 4. Row Level Security (RLS) Model

| Table | Viewer Access | Administrator Access | Notes |
|---|---|---|---|
| `performers` | `SELECT` (published & non-deleted only) | `ALL` (CRUD + Soft-delete) | Filtered automatically |
| `events` | `SELECT` (published & non-deleted only) | `ALL` (CRUD + Soft-delete) | Unique event indexing |
| `performances` | `SELECT` (published & non-deleted only) | `ALL` (CRUD + Soft-delete) | Unified Music & Dance |
| `crews` | `SELECT` (published & non-deleted only) | `ALL` (CRUD + Soft-delete) | Crew membership tracking |
| `crew_memberships` | `SELECT` (All) | `ALL` (CRUD) | Historical preservation |
| `songs` | `SELECT` (All) | `ALL` (CRUD) | Repertoire management |
| `user_roles` | `SELECT` (Own record only) | `ALL` (Admin managed) | Self-elevation denied |
| `audit_logs` | `DENIED` | `SELECT` only | Append-only (no edit/delete) |

---

## 5. Local Development Setup

### Prerequisites
- **Node.js**: v18.18+ or v20+ / v22+
- **npm** or **pnpm**
- **Git**

### Installation
1. Clone the repository and enter the workspace:
   ```bash
   git clone https://github.com/your-username/korus-performance-system.git
   cd korus-performance-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   For offline / initial local preview, the project includes intelligent in-memory persistence that mirrors database actions to `localStorage` and memory.

4. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. Run test suite:
   ```bash
   npm test
   ```

---

## 6. Supabase Cloud Configuration & Production Setup

### Step 1: Create a Supabase Project
1. Log in to [supabase.com](https://supabase.com/) and click **"New Project"**.
2. Name your project (e.g. `korus-performance-archive`) and set a strong database password.
3. Select your closest hosting region.

### Step 2: Execute Database Migrations
1. Open the **SQL Editor** in your Supabase dashboard.
2. In sequential order, copy and run the contents of:
   - `supabase/migrations/20261124000000_korus_schema.sql`
   - `supabase/migrations/20261124000001_views_and_functions.sql`
   - `supabase/migrations/20261124000002_seed_data.sql`
3. All 14 tables, indexes, RLS policies, and Realtime publications will be instantiated.

### Step 3: Enable Realtime Synchronization
The migration automatically executes:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.performances;
ALTER PUBLICATION supabase_realtime ADD TABLE public.performers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crews;
```
Verify under **Database** → **Replication** that the `supabase_realtime` publication has these tables active.

### Step 4: Provision First Administrator
To ensure zero unauthorized admin self-registration:
1. Go to **Authentication** → **Users** → **"Add User"**.
2. Create an admin user (e.g. `admin@korus.edu`).
3. In the **SQL Editor**, grant admin role:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('<PASTE-USER-UUID-HERE>', 'admin');
   ```

### Step 5: Configure Application Environment Variables
In your production environment (or `.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-secret-key> # Server only
NEXT_PUBLIC_SITE_URL=https://korus.yourdomain.edu
```

---

## 7. Production Deployment to Vercel

1. Push your code to a GitHub repository:
   ```bash
   git add .
   git commit -m "feat: complete KORUS performance management platform"
   git branch -M main
   git remote add origin https://github.com/<your-org>/korus-performance-system.git
   git push -u origin main
   ```
2. In the [Vercel Dashboard](https://vercel.com/):
   - Click **"Add New Project"** and import the `korus-performance-system` repo.
   - Framework Preset: **Next.js**.
   - Under **Environment Variables**, paste:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `NEXT_PUBLIC_SITE_URL`
   - Click **"Deploy"**.
3. **Custom Domain**:
   - Go to **Project Settings** → **Domains**.
   - Add your society domain (e.g. `archive.korussociety.com`).
   - Configure DNS CNAME / A records as prompted.

---

## 8. Backup & Disaster Recovery Strategy

1. **Daily Automated Backups**:
   - Supabase automatically performs daily database backups.
2. **Point-in-Time Recovery (PITR)**:
   - Available on Supabase Pro plans for recovery to any specific second within a 7-day or 30-day window.
3. **Manual Snapshot via pg_dump**:
   ```bash
   pg_dump "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" \
     --clean --if-exists -f korus_backup_$(date +%F).sql
   ```
4. **Soft-Delete Recycle Bin**:
   - Accidental deletions are protected by the built-in Trash system (`is_deleted = true`). Admins can instantly restore records from `/admin/trash` without database downtime.

---

## 9. Quality Assurance & Test Verification

Run the automated test suite anytime with:
```bash
npm test
```

### Verified Test Cases:
- [x] Distinct performance counting without inflation from multiple roles
- [x] Distinct performance counting without inflation from multiple songs
- [x] Individual counting of separate performances at the same event
- [x] Preservation of historical performances when dance crew membership changes
- [x] RLS policies denying unauthenticated/viewer inserts, updates, and deletes
- [x] Rejection of self-elevation to administrator role
- [x] Sanitization of spreadsheet exports against CSV / formula injection (CWE-1236)
- [x] Full-text and fuzzy search accuracy across performers, events, songs, and instruments
- [x] Soft-delete isolation and atomic record restoration
- [x] Multi-tab Realtime synchronization event emission

---

## 10. License

Released under the **MIT License**. Copyright © 2026 KORUS Music and Dance Society.
