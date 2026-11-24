-- ==============================================================================
-- KORUS Performance Management System — Seed Data
-- Creates realistic events, performers, dance crews, songs, and interconnected performances
-- ==============================================================================

DO $$
DECLARE
    -- Event IDs
    ev_freshers UUID := '11111111-1111-1111-1111-111111111111';
    ev_cultfest UUID := '22222222-2222-2222-2222-222222222222';
    ev_annualfest UUID := '33333333-3333-3333-3333-333333333333';
    ev_springfest UUID := '44444444-4444-4444-4444-444444444444';
    ev_wintershow UUID := '55555555-5555-5555-5555-555555555555';

    -- Performer IDs
    p_arjun UUID := 'aaaaaaaa-1111-0000-0000-000000000001'; -- Both (Music + Dance)
    p_priya UUID := 'aaaaaaaa-1111-0000-0000-000000000002'; -- Music (Vocals + Piano)
    p_rohan UUID := 'aaaaaaaa-1111-0000-0000-000000000003'; -- Music (Lead Guitar)
    p_ananya UUID := 'aaaaaaaa-1111-0000-0000-000000000004'; -- Dance (Hip Hop / Contemporary)
    p_kabir UUID := 'aaaaaaaa-1111-0000-0000-000000000005'; -- Music (Drums / Percussion)
    p_sneha UUID := 'aaaaaaaa-1111-0000-0000-000000000006'; -- Dance (Fusion / Krump)
    p_dev UUID := 'aaaaaaaa-1111-0000-0000-000000000007'; -- Music (Bass / Music Producer)
    p_riya UUID := 'aaaaaaaa-1111-0000-0000-000000000008'; -- Dance (Choreographer / Urban)
    p_aditya UUID := 'aaaaaaaa-1111-0000-0000-000000000009'; -- Both (Rapper + Beatboxer + Dancer)
    p_meera UUID := 'aaaaaaaa-1111-0000-0000-000000000010'; -- Music (Classical & Western Vocals)

    -- Crew IDs
    c_rhythm UUID := 'bbbbbbbb-2222-0000-0000-000000000001';
    c_urban UUID := 'bbbbbbbb-2222-0000-0000-000000000002';
    c_fusion UUID := 'bbbbbbbb-2222-0000-0000-000000000003';

    -- Song IDs
    s_yellow UUID := 'cccccccc-3333-0000-0000-000000000001';
    s_believer UUID := 'cccccccc-3333-0000-0000-000000000002';
    s_fixyou UUID := 'cccccccc-3333-0000-0000-000000000003';
    s_uptown UUID := 'cccccccc-3333-0000-0000-000000000004';
    s_chaiyya UUID := 'cccccccc-3333-0000-0000-000000000005';
    s_viva UUID := 'cccccccc-3333-0000-0000-000000000006';
    s_counting UUID := 'cccccccc-3333-0000-0000-000000000007';
    s_billie UUID := 'cccccccc-3333-0000-0000-000000000008';

    -- Performance IDs
    perf_m1 UUID := 'dddddddd-4444-0000-0000-000000000001';
    perf_d1 UUID := 'dddddddd-4444-0000-0000-000000000002';
    perf_m2 UUID := 'dddddddd-4444-0000-0000-000000000003';
    perf_d2 UUID := 'dddddddd-4444-0000-0000-000000000004';
    perf_m3 UUID := 'dddddddd-4444-0000-0000-000000000005';
    perf_d3 UUID := 'dddddddd-4444-0000-0000-000000000006';
    perf_m4 UUID := 'dddddddd-4444-0000-0000-000000000007';

    -- Part IDs
    part_id UUID;
BEGIN
    -- 1. Insert Events
    INSERT INTO public.events (id, name, event_date, venue, description, category, is_published)
    VALUES
        (ev_freshers, 'Freshers Night 2025', '2025-09-12', 'Main University Auditorium', 'Annual welcoming musical and dance concert for incoming students.', 'Freshers Night', true),
        (ev_cultfest, 'Cultural Fest: Tarangini', '2025-10-20', 'Open Air Amphitheater', 'Flagship inter-college cultural festival with high-octane showcases.', 'Cultural Fest', true),
        (ev_annualfest, 'Annual Fest: Symphony of Lights', '2025-11-15', 'Grand Arena Hall A', 'Grand annual celebration honoring society achievements and senior artists.', 'Annual Fest', true),
        (ev_springfest, 'Spring Beats & Rhythms', '2026-02-14', 'Central Quadrangle', 'Acoustic and urban dance open-air sunset session.', 'Showcase', true),
        (ev_wintershow, 'Winter Acoustic & Cypher Gala', '2026-03-05', 'Student Activity Center', 'Experimental music jam session and all-style dance cypher.', 'Showcase', true)
    ON CONFLICT (id) DO NOTHING;

    -- 2. Insert Performers
    INSERT INTO public.performers (id, full_name, stage_name, bio, departments, join_date, is_published)
    VALUES
        (p_arjun, 'Arjun Sharma', 'Arjun', 'Multi-disciplinary artist performing as lead vocalist, acoustic guitarist, and urban dancer.', ARRAY['music', 'dance'], '2023-08-10', true),
        (p_priya, 'Priya Nair', 'Priya N', 'Classical and western vocalist and keyboardist. Former Western Choir Lead.', ARRAY['music'], '2023-08-10', true),
        (p_rohan, 'Rohan Verma', 'Ro-V', 'Lead and rhythm electric guitarist specializing in blues and progressive rock.', ARRAY['music'], '2023-09-01', true),
        (p_ananya, 'Ananya Sen', 'Anya', 'Contemporary and hip-hop dancer. Founding member of Rhythm Collective.', ARRAY['dance'], '2023-08-15', true),
        (p_kabir, 'Kabir Mehta', 'K-Beat', 'Versatile drummer, percussionist, and rhythm arranger.', ARRAY['music'], '2023-09-01', true),
        (p_sneha, 'Sneha Rao', 'S-Fire', 'Popping, locking, and experimental fusion dancer with Urban Pulse.', ARRAY['dance'], '2024-01-10', true),
        (p_dev, 'Dev Malhotra', 'DevBass', 'Bassist and music producer with expertise in jazz-rock and funk arrangements.', ARRAY['music'], '2023-08-10', true),
        (p_riya, 'Riya Kapoor', 'Riri', 'Choreographer and lead dancer in Rhythm Collective.', ARRAY['dance'], '2023-08-15', true),
        (p_aditya, 'Aditya Joshi', 'AJ-Verse', 'Rapper, beatboxer, and freestyle dancer bridging hip-hop music and dance.', ARRAY['music', 'dance'], '2024-02-01', true),
        (p_meera, 'Meera Iyer', 'Meera', 'Vocalist trained in Carnatic classical and contemporary pop ballads.', ARRAY['music'], '2024-08-20', true)
    ON CONFLICT (id) DO NOTHING;

    -- 3. Insert Crews
    INSERT INTO public.crews (id, name, description, formed_date, dance_style, is_published)
    VALUES
        (c_rhythm, 'Rhythm Collective', 'The premier urban choreography crew of KORUS, known for synchronization and storytelling.', '2022-09-01', 'Urban Hip-Hop / Lyrical', true),
        (c_urban, 'Urban Pulse', 'High-energy street dance crew focusing on popping, locking, krump, and breaking.', '2023-01-15', 'Street & Breaking', true),
        (c_fusion, 'Desi Fusion Collective', 'Blending classical Indian dance forms with contemporary western beat styles.', '2023-08-10', 'Contemporary Fusion', true)
    ON CONFLICT (id) DO NOTHING;

    -- 4. Crew Memberships (including historical tracking)
    INSERT INTO public.crew_memberships (crew_id, performer_id, role_title, joined_date, is_current)
    VALUES
        (c_rhythm, p_arjun, 'Dancer', '2023-08-20', true),
        (c_rhythm, p_ananya, 'Co-Captain & Dancer', '2023-08-15', true),
        (c_rhythm, p_riya, 'Lead Choreographer', '2023-08-15', true),
        (c_urban, p_sneha, 'Lead Dancer', '2024-01-10', true),
        (c_urban, p_aditya, 'B-Boy & Beatboxer', '2024-02-05', true),
        (c_fusion, p_ananya, 'Guest Performer', '2024-03-01', false)
    ON CONFLICT DO NOTHING;

    -- 5. Insert Songs
    INSERT INTO public.songs (id, title, original_artist, genre, release_year)
    VALUES
        (s_yellow, 'Yellow', 'Coldplay', 'Alternative Rock', 2000),
        (s_believer, 'Believer', 'Imagine Dragons', 'Pop Rock', 2017),
        (s_fixyou, 'Fix You', 'Coldplay', 'Post-Britpop', 2005),
        (s_uptown, 'Uptown Funk', 'Mark Ronson ft. Bruno Mars', 'Funk Pop', 2014),
        (s_chaiyya, 'Chaiyya Chaiyya', 'A.R. Rahman', 'Indian Fusion', 1998),
        (s_viva, 'Viva La Vida', 'Coldplay', 'Baroque Pop', 2008),
        (s_counting, 'Counting Stars', 'OneRepublic', 'Pop Rock', 2013),
        (s_billie, 'Billie Jean', 'Michael Jackson', 'Funk / Pop', 1982)
    ON CONFLICT (id) DO NOTHING;

    -- 6. Insert Performances
    -- Performance 1: Freshers Night - Music: Yellow (Coldplay)
    INSERT INTO public.performances (id, event_id, department, title, notes, is_published)
    VALUES (perf_m1, ev_freshers, 'music', 'Yellow (Coldplay Acoustic & Band Rendition)', 'Emotional opening band performance for Freshers Night.', true)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.performance_songs (performance_id, song_id, order_index)
    VALUES (perf_m1, s_yellow, 1) ON CONFLICT DO NOTHING;

    -- Arjun performed in perf_m1 as Lead Vocalist AND Acoustic Guitarist (2 roles, 1 performance!)
    INSERT INTO public.performance_participants (id, performance_id, performer_id)
    VALUES (gen_random_uuid(), perf_m1, p_arjun) RETURNING id INTO part_id;
    INSERT INTO public.participant_roles (participant_id, role_name, instrument)
    VALUES (part_id, 'Lead Vocalist', NULL), (part_id, 'Guitarist', 'Acoustic Guitar');

    -- Rohan on Lead Guitar
    INSERT INTO public.performance_participants (id, performance_id, performer_id)
    VALUES (gen_random_uuid(), perf_m1, p_rohan) RETURNING id INTO part_id;
    INSERT INTO public.participant_roles (participant_id, role_name, instrument)
    VALUES (part_id, 'Guitarist', 'Electric Guitar');

    -- Kabir on Drums
    INSERT INTO public.performance_participants (id, performance_id, performer_id)
    VALUES (gen_random_uuid(), perf_m1, p_kabir) RETURNING id INTO part_id;
    INSERT INTO public.participant_roles (participant_id, role_name, instrument)
    VALUES (part_id, 'Drummer', 'Drum Kit');

    -- Performance 2: Cultural Fest - Dance: Believer + Uptown Funk routine (Multiple Songs in 1 Performance!)
    INSERT INTO public.performances (id, event_id, department, title, dance_style, notes, is_published)
    VALUES (perf_d1, ev_cultfest, 'dance', 'Rhythm Collective: Warriors of Sound', 'Urban Hip-Hop & Power Stomping', 'High impact routine using dual tracks Believer and Uptown Funk.', true)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.performance_songs (performance_id, song_id, order_index)
    VALUES 
        (perf_d1, s_believer, 1),
        (perf_d1, s_uptown, 2)
    ON CONFLICT DO NOTHING;

    -- Arjun, Ananya, and Riya danced in perf_d1 under Rhythm Collective
    INSERT INTO public.performance_participants (id, performance_id, performer_id, crew_id)
    VALUES (gen_random_uuid(), perf_d1, p_arjun, c_rhythm) RETURNING id INTO part_id;
    INSERT INTO public.participant_roles (participant_id, role_name) VALUES (part_id, 'Dancer');

    INSERT INTO public.performance_participants (id, performance_id, performer_id, crew_id)
    VALUES (gen_random_uuid(), perf_d1, p_ananya, c_rhythm) RETURNING id INTO part_id;
    INSERT INTO public.participant_roles (participant_id, role_name) VALUES (part_id, 'Dancer');

    INSERT INTO public.performance_participants (id, performance_id, performer_id, crew_id)
    VALUES (gen_random_uuid(), perf_d1, p_riya, c_rhythm) RETURNING id INTO part_id;
    INSERT INTO public.participant_roles (participant_id, role_name) VALUES (part_id, 'Choreographer');

    -- Performance 3: Annual Fest - Music: Fix You (Coldplay)
    INSERT INTO public.performances (id, event_id, department, title, notes, is_published)
    VALUES (perf_m2, ev_annualfest, 'music', 'Fix You (Full Choir & Rock Ensemble)', 'Grand finale headlining act with 5 core musicians.', true)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.performance_songs (performance_id, song_id, order_index)
    VALUES (perf_m2, s_fixyou, 1) ON CONFLICT DO NOTHING;

    INSERT INTO public.performance_participants (id, performance_id, performer_id)
    VALUES (gen_random_uuid(), perf_m2, p_arjun) RETURNING id INTO part_id;
    INSERT INTO public.participant_roles (participant_id, role_name, instrument)
    VALUES (part_id, 'Lead Vocalist', NULL), (part_id, 'Guitarist', 'Electric Guitar');

    INSERT INTO public.performance_participants (id, performance_id, performer_id)
    VALUES (gen_random_uuid(), perf_m2, p_priya) RETURNING id INTO part_id;
    INSERT INTO public.participant_roles (participant_id, role_name, instrument)
    VALUES (part_id, 'Keyboardist', 'Grand Piano'), (part_id, 'Backing Vocalist', NULL);

    INSERT INTO public.performance_participants (id, performance_id, performer_id)
    VALUES (gen_random_uuid(), perf_m2, p_dev) RETURNING id INTO part_id;
    INSERT INTO public.participant_roles (participant_id, role_name, instrument)
    VALUES (part_id, 'Bassist', '5-String Bass');

    INSERT INTO public.performance_participants (id, performance_id, performer_id)
    VALUES (gen_random_uuid(), perf_m2, p_kabir) RETURNING id INTO part_id;
    INSERT INTO public.participant_roles (participant_id, role_name, instrument)
    VALUES (part_id, 'Drummer', 'Acoustic Drums');

    -- Performance 4: Spring Beats - Dance: Street Fusion (Chaiyya Chaiyya & Billie Jean remix)
    INSERT INTO public.performances (id, event_id, department, title, dance_style, notes, is_published)
    VALUES (perf_d2, ev_springfest, 'dance', 'Urban Pulse: Retro Street Cypher', 'Locking & Krump', 'Street dance celebration fusing eastern and western rhythms.', true)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.performance_songs (performance_id, song_id, order_index)
    VALUES 
        (perf_d2, s_chaiyya, 1),
        (perf_d2, s_billie, 2)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.performance_participants (id, performance_id, performer_id, crew_id)
    VALUES (gen_random_uuid(), perf_d2, p_sneha, c_urban) RETURNING id INTO part_id;
    INSERT INTO public.participant_roles (participant_id, role_name) VALUES (part_id, 'Dancer');

    INSERT INTO public.performance_participants (id, performance_id, performer_id, crew_id)
    VALUES (gen_random_uuid(), perf_d2, p_aditya, c_urban) RETURNING id INTO part_id;
    INSERT INTO public.participant_roles (participant_id, role_name) VALUES (part_id, 'Dancer');

    -- Performance 5: Winter Showcase - Music: Viva La Vida & Counting Stars Medley
    INSERT INTO public.performances (id, event_id, department, title, notes, is_published)
    VALUES (perf_m3, ev_wintershow, 'music', 'Anthem Medley: Viva La Vida x Counting Stars', 'Orchestral acoustic arrangement with string backing and beatboxing.', true)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.performance_songs (performance_id, song_id, order_index)
    VALUES 
        (perf_m3, s_viva, 1),
        (perf_m3, s_counting, 2)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.performance_participants (id, performance_id, performer_id)
    VALUES (gen_random_uuid(), perf_m3, p_meera) RETURNING id INTO part_id;
    INSERT INTO public.participant_roles (participant_id, role_name) VALUES (part_id, 'Lead Vocalist');

    INSERT INTO public.performance_participants (id, performance_id, performer_id)
    VALUES (gen_random_uuid(), perf_m3, p_aditya) RETURNING id INTO part_id;
    INSERT INTO public.participant_roles (participant_id, role_name) VALUES (part_id, 'Beatboxer'), (part_id, 'Rapper');

    INSERT INTO public.performance_participants (id, performance_id, performer_id)
    VALUES (gen_random_uuid(), perf_m3, p_priya) RETURNING id INTO part_id;
    INSERT INTO public.participant_roles (participant_id, role_name, instrument) VALUES (part_id, 'Keyboardist', 'Synthesizer');

END $$;
