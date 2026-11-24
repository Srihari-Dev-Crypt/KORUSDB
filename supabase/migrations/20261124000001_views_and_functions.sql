-- ==============================================================================
-- KORUS Performance Management System — Views, Statistics & Helper Functions
-- Conforming to Supabase Postgres Best Practices: WITH (security_invoker = true)
-- ==============================================================================

-- 1. Prepopulate Canonical Roles
INSERT INTO public.roles (name, department, is_custom) VALUES
    ('Lead Vocalist', 'music', false),
    ('Backing Vocalist', 'music', false),
    ('Singer', 'music', false),
    ('Guitarist', 'music', false),
    ('Bassist', 'music', false),
    ('Drummer', 'music', false),
    ('Keyboardist', 'music', false),
    ('Percussionist', 'music', false),
    ('Instrumentalist', 'music', false),
    ('Rapper', 'music', false),
    ('Beatboxer', 'music', false),
    ('Music Producer', 'music', false),
    ('Dancer', 'dance', false),
    ('Choreographer', 'dance', false),
    ('Crew Captain', 'dance', false),
    ('Other', 'both', false)
ON CONFLICT (name) DO NOTHING;

-- 2. Performer Statistics View
-- Exact Rule Enforcement:
-- - Distinct performance IDs (a performer with multiple roles in 1 performance is counted ONCE)
-- - Multiple songs do not inflate performance counts
-- - Separate performances at same event counted individually
-- - Distinct events counted separately
-- - Excludes deleted or unpublished records
CREATE OR REPLACE VIEW public.v_performer_statistics
WITH (security_invoker = true)
AS
SELECT 
    p.id AS performer_id,
    p.full_name,
    p.stage_name,
    p.avatar_url,
    p.departments,
    p.bio,
    p.join_date,
    p.is_published,
    p.is_deleted,
    -- Total distinct performances
    COUNT(DISTINCT perf.id) AS total_performances,
    -- Total music performances
    COUNT(DISTINCT CASE WHEN perf.department = 'music' THEN perf.id END) AS total_music_performances,
    -- Total dance performances
    COUNT(DISTINCT CASE WHEN perf.department = 'dance' THEN perf.id END) AS total_dance_performances,
    -- Total unique events attended as performer
    COUNT(DISTINCT e.id) AS unique_events_count,
    -- First recorded performance date
    MIN(e.event_date) AS first_performance_date,
    -- Most recent performance date
    MAX(e.event_date) AS latest_performance_date
FROM public.performers p
LEFT JOIN public.performance_participants pp ON pp.performer_id = p.id
LEFT JOIN public.performances perf ON perf.id = pp.performance_id 
    AND perf.is_deleted = false 
    AND perf.is_published = true
LEFT JOIN public.events e ON e.id = perf.event_id 
    AND e.is_deleted = false 
    AND e.is_published = true
GROUP BY p.id;

-- 3. Event Statistics View
CREATE OR REPLACE VIEW public.v_event_statistics
WITH (security_invoker = true)
AS
SELECT 
    e.id AS event_id,
    e.name,
    e.event_date,
    e.venue,
    e.category,
    e.description,
    e.is_published,
    e.is_deleted,
    -- Total performances in event
    COUNT(DISTINCT perf.id) AS total_performances,
    -- Music performances count
    COUNT(DISTINCT CASE WHEN perf.department = 'music' THEN perf.id END) AS music_performances_count,
    -- Dance performances count
    COUNT(DISTINCT CASE WHEN perf.department = 'dance' THEN perf.id END) AS dance_performances_count,
    -- Total unique performers who performed at this event
    COUNT(DISTINCT pp.performer_id) AS total_unique_performers,
    -- Total unique crews who performed at this event
    COUNT(DISTINCT pp.crew_id) AS total_unique_crews
FROM public.events e
LEFT JOIN public.performances perf ON perf.event_id = e.id 
    AND perf.is_deleted = false 
    AND perf.is_published = true
LEFT JOIN public.performance_participants pp ON pp.performance_id = perf.id
GROUP BY e.id;

-- 4. Dance Crew Statistics View
CREATE OR REPLACE VIEW public.v_crew_statistics
WITH (security_invoker = true)
AS
SELECT 
    c.id AS crew_id,
    c.name,
    c.description,
    c.formed_date,
    c.avatar_url,
    c.dance_style,
    c.is_published,
    c.is_deleted,
    -- Total unique dance performances by crew
    COUNT(DISTINCT perf.id) AS total_performances,
    -- Total unique events participated in
    COUNT(DISTINCT perf.event_id) AS unique_events_count,
    -- Current active members count
    (
        SELECT COUNT(DISTINCT cm.performer_id) 
        FROM public.crew_memberships cm 
        WHERE cm.crew_id = c.id AND cm.is_current = true
    ) AS active_members_count,
    -- Total historical members count
    (
        SELECT COUNT(DISTINCT cm.performer_id) 
        FROM public.crew_memberships cm 
        WHERE cm.crew_id = c.id
    ) AS total_historical_members_count
FROM public.crews c
LEFT JOIN public.performance_participants pp ON pp.crew_id = c.id
LEFT JOIN public.performances perf ON perf.id = pp.performance_id 
    AND perf.is_deleted = false 
    AND perf.is_published = true
GROUP BY c.id;

-- 5. Safe Soft-Delete and Restore RPC functions
CREATE OR REPLACE FUNCTION public.soft_delete_record(
    entity_table TEXT,
    record_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Verify administrator privilege
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied. Administrator privileges required.';
    END IF;

    IF entity_table NOT IN ('performances', 'performers', 'events', 'crews') THEN
        RAISE EXCEPTION 'Invalid entity table for soft deletion: %', entity_table;
    END IF;

    EXECUTE format('
        UPDATE public.%I 
        SET is_deleted = true, deleted_at = timezone(''utc''::text, now()) 
        WHERE id = $1 
        RETURNING to_jsonb(%I.*)', entity_table, entity_table)
    USING record_id
    INTO result;

    -- Record Audit Log
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, previous_values, new_values, status)
    VALUES (auth.uid(), 'SOFT_DELETE', entity_table, record_id, result, jsonb_build_object('is_deleted', true), 'SUCCESS');

    RETURN jsonb_build_object('success', true, 'record', result);
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_record(
    entity_table TEXT,
    record_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Verify administrator privilege
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied. Administrator privileges required.';
    END IF;

    IF entity_table NOT IN ('performances', 'performers', 'events', 'crews') THEN
        RAISE EXCEPTION 'Invalid entity table for restore: %', entity_table;
    END IF;

    EXECUTE format('
        UPDATE public.%I 
        SET is_deleted = false, deleted_at = NULL 
        WHERE id = $1 
        RETURNING to_jsonb(%I.*)', entity_table, entity_table)
    USING record_id
    INTO result;

    -- Record Audit Log
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, previous_values, new_values, status)
    VALUES (auth.uid(), 'RESTORE', entity_table, record_id, jsonb_build_object('is_deleted', true), result, 'SUCCESS');

    RETURN jsonb_build_object('success', true, 'record', result);
END;
$$;
