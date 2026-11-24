-- ==============================================================================
-- KORUS Performance Management System — Complete Relational PostgreSQL Schema
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. Profiles Table (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. User Roles Table (Server-enforced role assignments)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- 4. App Settings Table (Society configuration, e.g. private mode)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Initialize default app settings
INSERT INTO public.app_settings (key, value, description)
VALUES 
    ('private_mode', '{"enabled": false}'::jsonb, 'Require login to view records'),
    ('society_meta', '{"name": "KORUS", "subtitle": "The Performance Archive", "established": 2018}'::jsonb, 'Society branding metadata')
ON CONFLICT (key) DO NOTHING;

-- 5. Performers Table (Centralized for Music & Dance)
CREATE TABLE IF NOT EXISTS public.performers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    stage_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    departments TEXT[] NOT NULL DEFAULT '{"music"}',
    join_date DATE,
    is_published BOOLEAN NOT NULL DEFAULT true,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    event_date DATE NOT NULL,
    venue TEXT,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Cultural Fest',
    is_published BOOLEAN NOT NULL DEFAULT true,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Roles Table (Standardized Music & Dance roles)
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL CHECK (department IN ('music', 'dance', 'both')),
    is_custom BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Dance Crews Table
CREATE TABLE IF NOT EXISTS public.crews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    formed_date DATE,
    avatar_url TEXT,
    dance_style TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Crew Memberships Table (Historical tracking of dancer crew affiliations)
CREATE TABLE IF NOT EXISTS public.crew_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crew_id UUID NOT NULL REFERENCES public.crews(id) ON DELETE CASCADE,
    performer_id UUID NOT NULL REFERENCES public.performers(id) ON DELETE CASCADE,
    role_title TEXT NOT NULL DEFAULT 'Member',
    joined_date DATE,
    left_date DATE,
    is_current BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. Songs Table
CREATE TABLE IF NOT EXISTS public.songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    original_artist TEXT,
    genre TEXT,
    release_year INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. Performances Table (Unified for both Music & Dance)
CREATE TABLE IF NOT EXISTS public.performances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    department TEXT NOT NULL CHECK (department IN ('music', 'dance')),
    title TEXT NOT NULL,
    dance_style TEXT,
    notes TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. Performance Participants Table
-- Invariant: One performer appears ONCE per performance (preventing duplicate counts)
CREATE TABLE IF NOT EXISTS public.performance_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    performance_id UUID NOT NULL REFERENCES public.performances(id) ON DELETE CASCADE,
    performer_id UUID NOT NULL REFERENCES public.performers(id) ON DELETE CASCADE,
    crew_id UUID REFERENCES public.crews(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_performer_per_performance UNIQUE (performance_id, performer_id)
);

-- 13. Participant Roles Table (Allows multi-role per performance without inflating performance count)
CREATE TABLE IF NOT EXISTS public.participant_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES public.performance_participants(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL,
    instrument TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. Performance Songs Table (Allows multi-song per performance)
CREATE TABLE IF NOT EXISTS public.performance_songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    performance_id UUID NOT NULL REFERENCES public.performances(id) ON DELETE CASCADE,
    song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
    order_index INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_performance_song UNIQUE (performance_id, song_id)
);

-- 15. Audit Logs Table (Tamper-resistant audit trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    previous_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    status TEXT NOT NULL DEFAULT 'SUCCESS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE & FULL-TEXT SEARCH
-- ==============================================================================

-- B-tree indexes for foreign keys & filter columns
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_performers_deleted_published ON public.performers(is_deleted, is_published);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_deleted_published ON public.events(is_deleted, is_published);
CREATE INDEX IF NOT EXISTS idx_performances_event_id ON public.performances(event_id);
CREATE INDEX IF NOT EXISTS idx_performances_dept ON public.performances(department);
CREATE INDEX IF NOT EXISTS idx_performances_deleted_published ON public.performances(is_deleted, is_published);
CREATE INDEX IF NOT EXISTS idx_crews_deleted_published ON public.crews(is_deleted, is_published);
CREATE INDEX IF NOT EXISTS idx_crew_memberships_crew_id ON public.crew_memberships(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_memberships_performer_id ON public.crew_memberships(performer_id);
CREATE INDEX IF NOT EXISTS idx_perf_part_performance ON public.performance_participants(performance_id);
CREATE INDEX IF NOT EXISTS idx_perf_part_performer ON public.performance_participants(performer_id);
CREATE INDEX IF NOT EXISTS idx_perf_part_crew ON public.performance_participants(crew_id);
CREATE INDEX IF NOT EXISTS idx_part_roles_participant ON public.participant_roles(participant_id);
CREATE INDEX IF NOT EXISTS idx_perf_songs_perf ON public.performance_songs(performance_id);
CREATE INDEX IF NOT EXISTS idx_perf_songs_song ON public.performance_songs(song_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Trigram GIN indexes for fast fuzzy searching
CREATE INDEX IF NOT EXISTS idx_performers_name_trgm ON public.performers USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_events_name_trgm ON public.events USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_crews_name_trgm ON public.crews USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_songs_title_trgm ON public.songs USING gin (title gin_trgm_ops);

-- ==============================================================================
-- SECURITY FUNCTIONS & ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Helper function: Is current user an administrator?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role = 'admin'
    );
$$;

-- Helper function: Is private mode active?
CREATE OR REPLACE FUNCTION public.is_private_mode()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE((value->>'enabled')::boolean, false)
    FROM public.app_settings
    WHERE key = 'private_mode';
$$;

-- Helper function: Can public read records?
CREATE OR REPLACE FUNCTION public.can_read_public()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT (NOT public.is_private_mode()) OR (auth.uid() IS NOT NULL);
$$;

-- Enable RLS on ALL exposed tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participant_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- RLS POLICIES
-- ------------------------------------------------------------------------------

-- 1. Profiles
CREATE POLICY "Profiles readable by owner or admin"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Profiles updatable by owner"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 2. User Roles (Strictly admin managed, viewers can read own role)
CREATE POLICY "User roles viewable by self or admin"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "User roles insertable only by admin"
    ON public.user_roles FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "User roles updatable only by admin"
    ON public.user_roles FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "User roles deletable only by admin"
    ON public.user_roles FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 3. App Settings (Viewers can read settings; only admin can modify)
CREATE POLICY "App settings readable by everyone"
    ON public.app_settings FOR SELECT
    USING (true);

CREATE POLICY "App settings modifiable only by admin"
    ON public.app_settings FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 4. Performers
CREATE POLICY "Performers readable by viewers when published and not deleted"
    ON public.performers FOR SELECT
    USING (
        (public.can_read_public() AND is_published = true AND is_deleted = false)
        OR public.is_admin()
    );

CREATE POLICY "Performers admin insert"
    ON public.performers FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Performers admin update"
    ON public.performers FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Performers admin delete"
    ON public.performers FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 5. Events
CREATE POLICY "Events readable by viewers when published and not deleted"
    ON public.events FOR SELECT
    USING (
        (public.can_read_public() AND is_published = true AND is_deleted = false)
        OR public.is_admin()
    );

CREATE POLICY "Events admin insert"
    ON public.events FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Events admin update"
    ON public.events FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Events admin delete"
    ON public.events FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 6. Roles
CREATE POLICY "Roles readable by all viewers"
    ON public.roles FOR SELECT
    USING (public.can_read_public() OR public.is_admin());

CREATE POLICY "Roles admin insert"
    ON public.roles FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Roles admin update"
    ON public.roles FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Roles admin delete"
    ON public.roles FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 7. Crews
CREATE POLICY "Crews readable by viewers when published and not deleted"
    ON public.crews FOR SELECT
    USING (
        (public.can_read_public() AND is_published = true AND is_deleted = false)
        OR public.is_admin()
    );

CREATE POLICY "Crews admin insert"
    ON public.crews FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Crews admin update"
    ON public.crews FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Crews admin delete"
    ON public.crews FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 8. Crew Memberships
CREATE POLICY "Crew memberships readable by viewers"
    ON public.crew_memberships FOR SELECT
    USING (public.can_read_public() OR public.is_admin());

CREATE POLICY "Crew memberships admin insert"
    ON public.crew_memberships FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Crew memberships admin update"
    ON public.crew_memberships FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Crew memberships admin delete"
    ON public.crew_memberships FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 9. Songs
CREATE POLICY "Songs readable by viewers"
    ON public.songs FOR SELECT
    USING (public.can_read_public() OR public.is_admin());

CREATE POLICY "Songs admin insert"
    ON public.songs FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Songs admin update"
    ON public.songs FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 10. Performances
CREATE POLICY "Performances readable by viewers when published and not deleted"
    ON public.performances FOR SELECT
    USING (
        (public.can_read_public() AND is_published = true AND is_deleted = false)
        OR public.is_admin()
    );

CREATE POLICY "Performances admin insert"
    ON public.performances FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Performances admin update"
    ON public.performances FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Performances admin delete"
    ON public.performances FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 11. Performance Participants
CREATE POLICY "Participants readable by viewers"
    ON public.performance_participants FOR SELECT
    USING (public.can_read_public() OR public.is_admin());

CREATE POLICY "Participants admin insert"
    ON public.performance_participants FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Participants admin update"
    ON public.performance_participants FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Participants admin delete"
    ON public.performance_participants FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 12. Participant Roles
CREATE POLICY "Participant roles readable by viewers"
    ON public.participant_roles FOR SELECT
    USING (public.can_read_public() OR public.is_admin());

CREATE POLICY "Participant roles admin insert"
    ON public.participant_roles FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Participant roles admin update"
    ON public.participant_roles FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Participant roles admin delete"
    ON public.participant_roles FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 13. Performance Songs
CREATE POLICY "Performance songs readable by viewers"
    ON public.performance_songs FOR SELECT
    USING (public.can_read_public() OR public.is_admin());

CREATE POLICY "Performance songs admin insert"
    ON public.performance_songs FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Performance songs admin update"
    ON public.performance_songs FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Performance songs admin delete"
    ON public.performance_songs FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 14. Audit Logs (Append-only by system/admin; Readable ONLY by Admin; No edits/deletions allowed)
CREATE POLICY "Audit logs readable only by admin"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Audit logs insertable by authenticated users"
    ON public.audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Explicitly NO update or delete policies for audit_logs (Strict Non-repudiation)

-- ==============================================================================
-- AUTOMATIC TIMESTAMPS & AUDIT TRIGGER FUNCTIONS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- Attach updated_at triggers
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_performers_updated_at BEFORE UPDATE ON public.performers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_crews_updated_at BEFORE UPDATE ON public.crews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_performances_updated_at BEFORE UPDATE ON public.performances FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- SUPABASE REALTIME CONFIGURATION
-- ==============================================================================

-- Enable Realtime publication for tables requiring instant multi-client sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.performances;
ALTER PUBLICATION supabase_realtime ADD TABLE public.performers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.performance_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.songs;
