import type { 
  Performer, Event, DanceCrew, Song, Performance, AuditLog, Role,
  PerformerStats, EventStats, CrewStats, SocietyAnalytics
} from './supabase/types';
import { 
  INITIAL_EVENTS, INITIAL_PERFORMERS, INITIAL_CREWS, 
  INITIAL_SONGS, INITIAL_PERFORMANCES, INITIAL_ROLES, INITIAL_AUDIT_LOGS 
} from './mock-data';
import { createClient } from './supabase/client';
import { findPotentialDuplicates } from './security';

const STORAGE_KEYS = {
  PERFORMERS: 'korus_performers',
  EVENTS: 'korus_events',
  CREWS: 'korus_crews',
  SONGS: 'korus_songs',
  PERFORMANCES: 'korus_performances',
  ROLES: 'korus_roles',
  AUDIT_LOGS: 'korus_audit_logs',
  APP_SETTINGS: 'korus_app_settings',
};

class DataService {
  private memoryStore = new Map<string, any>();

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return !!(url && key && !url.includes('mock-korus') && !key.includes('dummy'));
  }

  // --- Local State Helpers ---
  private getLocal<T>(key: string, defaultValue: T): T {
    if (!this.isBrowser()) {
      if (!this.memoryStore.has(key)) {
        this.memoryStore.set(key, JSON.parse(JSON.stringify(defaultValue)));
      }
      return this.memoryStore.get(key);
    }
    try {
      const data = localStorage.getItem(key);
      if (!data) {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
      }
      return JSON.parse(data);
    } catch {
      return defaultValue;
    }
  }

  private setLocal<T>(key: string, value: T): void {
    if (!this.isBrowser()) {
      this.memoryStore.set(key, JSON.parse(JSON.stringify(value)));
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // Dispatch storage event for same-tab & cross-tab sync
      window.dispatchEvent(new Event('korus-data-updated'));
    } catch (e) {
      console.error('Storage write error', e);
    }
  }

  // ==============================================================================
  // 1. AUDIT LOGGING
  // ==============================================================================
  public async logAction(
    action: string,
    entityType: string,
    entityId?: string | null,
    previousValues?: any,
    newValues?: any
  ): Promise<void> {
    const log: AuditLog = {
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      user_id: 'admin-user',
      action,
      entity_type: entityType,
      entity_id: entityId,
      previous_values: previousValues || null,
      new_values: newValues || null,
      status: 'SUCCESS',
      created_at: new Date().toISOString(),
    };

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('audit_logs').insert([log]);
      } catch (e) {
        console.warn('Could not write to remote audit_logs', e);
      }
    }

    const logs = this.getLocal<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    this.setLocal(STORAGE_KEYS.AUDIT_LOGS, [log, ...logs]);
  }

  public async getAuditLogs(): Promise<AuditLog[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as AuditLog[];
      } catch (e) {
        console.warn('Falling back to local audit logs', e);
      }
    }
    return this.getLocal<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  // ==============================================================================
  // 2. PERFORMERS
  // ==============================================================================
  public async getPerformers(includeDeleted = false): Promise<Performer[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase.from('performers').select('*').order('full_name');
        if (!includeDeleted) {
          query = query.eq('is_deleted', false).eq('is_published', true);
        }
        const { data, error } = await query;
        if (!error && data) return data as Performer[];
      } catch (e) {
        console.warn('Falling back to local performers', e);
      }
    }

    const performers = this.getLocal<Performer[]>(STORAGE_KEYS.PERFORMERS, INITIAL_PERFORMERS);
    if (includeDeleted) return performers;
    return performers.filter(p => !p.is_deleted && p.is_published);
  }

  public async getPerformerById(id: string): Promise<Performer | null> {
    const list = await this.getPerformers(true);
    return list.find(p => p.id === id) || null;
  }

  public async createPerformer(data: Partial<Performer>): Promise<Performer> {
    const newPerformer: Performer = {
      id: data.id || 'p-' + Math.random().toString(36).substring(2, 9),
      full_name: data.full_name!,
      stage_name: data.stage_name || null,
      avatar_url: data.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      bio: data.bio || '',
      departments: data.departments || ['music'],
      join_date: data.join_date || new Date().toISOString().split('T')[0],
      is_published: data.is_published ?? true,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: inserted, error } = await supabase.from('performers').insert([newPerformer]).select().single();
        if (!error && inserted) {
          await this.logAction('CREATE_PERFORMER', 'performers', inserted.id, null, inserted);
          return inserted as Performer;
        }
      } catch (e) {
        console.warn('Remote create failed, storing locally', e);
      }
    }

    const performers = this.getLocal<Performer[]>(STORAGE_KEYS.PERFORMERS, INITIAL_PERFORMERS);
    this.setLocal(STORAGE_KEYS.PERFORMERS, [...performers, newPerformer]);
    await this.logAction('CREATE_PERFORMER', 'performers', newPerformer.id, null, newPerformer);
    return newPerformer;
  }

  public async updatePerformer(id: string, updates: Partial<Performer>): Promise<Performer | null> {
    const performers = this.getLocal<Performer[]>(STORAGE_KEYS.PERFORMERS, INITIAL_PERFORMERS);
    const index = performers.findIndex(p => p.id === id);
    if (index === -1) return null;

    const previous = performers[index];
    const updated: Performer = {
      ...previous,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('performers').update(updated).eq('id', id);
      } catch (e) {
        console.warn('Remote update failed', e);
      }
    }

    performers[index] = updated;
    this.setLocal(STORAGE_KEYS.PERFORMERS, performers);
    await this.logAction('UPDATE_PERFORMER', 'performers', id, previous, updated);
    return updated;
  }

  public async softDeletePerformer(id: string): Promise<boolean> {
    const performer = await this.getPerformerById(id);
    if (!performer) return false;
    await this.updatePerformer(id, { is_deleted: true, deleted_at: new Date().toISOString() });
    await this.logAction('SOFT_DELETE', 'performers', id, performer, { is_deleted: true });
    return true;
  }

  public async restorePerformer(id: string): Promise<boolean> {
    const performer = await this.getPerformerById(id);
    if (!performer) return false;
    await this.updatePerformer(id, { is_deleted: false, deleted_at: null });
    await this.logAction('RESTORE', 'performers', id, { is_deleted: true }, { is_deleted: false });
    return true;
  }

  public async permanentDeletePerformer(id: string): Promise<boolean> {
    const performers = this.getLocal<Performer[]>(STORAGE_KEYS.PERFORMERS, INITIAL_PERFORMERS);
    const existing = performers.find(p => p.id === id);
    if (!existing) return false;

    this.setLocal(STORAGE_KEYS.PERFORMERS, performers.filter(p => p.id !== id));
    await this.logAction('PERMANENT_DELETE', 'performers', id, existing, null);
    return true;
  }

  public async mergePerformers(sourceId: string, targetId: string): Promise<boolean> {
    // Merges source performer into target performer: reassigns all performances and memberships
    const source = await this.getPerformerById(sourceId);
    const target = await this.getPerformerById(targetId);
    if (!source || !target) return false;

    // 1. Update performances
    const performances = this.getLocal<Performance[]>(STORAGE_KEYS.PERFORMANCES, INITIAL_PERFORMANCES);
    for (const perf of performances) {
      if (perf.participants) {
        let hasTarget = perf.participants.some(p => p.performer_id === targetId);
        perf.participants = perf.participants.map(part => {
          if (part.performer_id === sourceId) {
            if (hasTarget) {
              // Target already present in performance, do not duplicate (Counting rule preservation)
              return null;
            }
            return {
              ...part,
              performer_id: targetId,
              performer: target,
            };
          }
          return part;
        }).filter(Boolean) as any;
      }
    }
    this.setLocal(STORAGE_KEYS.PERFORMANCES, performances);

    // 2. Soft-delete or archive source performer
    await this.softDeletePerformer(sourceId);
    await this.logAction('MERGE_PERFORMER', 'performers', targetId, { merged_from: sourceId }, { survivor: targetId });
    return true;
  }

  // ==============================================================================
  // 3. EVENTS
  // ==============================================================================
  public async getEvents(includeDeleted = false): Promise<Event[]> {
    if (this.isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase.from('events').select('*').order('event_date', { ascending: false });
        if (!includeDeleted) {
          query = query.eq('is_deleted', false).eq('is_published', true);
        }
        const { data, error } = await query;
        if (!error && data) return data as Event[];
      } catch (e) {
        console.warn('Falling back to local events', e);
      }
    }

    const events = this.getLocal<Event[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    if (includeDeleted) return events;
    return events.filter(e => !e.is_deleted && e.is_published);
  }

  public async getEventById(id: string): Promise<Event | null> {
    const list = await this.getEvents(true);
    return list.find(e => e.id === id) || null;
  }

  public async createEvent(data: Partial<Event>): Promise<Event> {
    const newEvent: Event = {
      id: data.id || 'ev-' + Math.random().toString(36).substring(2, 9),
      name: data.name!,
      event_date: data.event_date!,
      venue: data.venue || null,
      description: data.description || '',
      category: data.category || 'Cultural Fest',
      is_published: data.is_published ?? true,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const events = this.getLocal<Event[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    this.setLocal(STORAGE_KEYS.EVENTS, [newEvent, ...events]);
    await this.logAction('CREATE_EVENT', 'events', newEvent.id, null, newEvent);
    return newEvent;
  }

  public async updateEvent(id: string, updates: Partial<Event>): Promise<Event | null> {
    const events = this.getLocal<Event[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const index = events.findIndex(e => e.id === id);
    if (index === -1) return null;

    const previous = events[index];
    const updated: Event = { ...previous, ...updates, updated_at: new Date().toISOString() };
    events[index] = updated;
    this.setLocal(STORAGE_KEYS.EVENTS, events);
    await this.logAction('UPDATE_EVENT', 'events', id, previous, updated);
    return updated;
  }

  public async softDeleteEvent(id: string): Promise<boolean> {
    const ev = await this.getEventById(id);
    if (!ev) return false;
    await this.updateEvent(id, { is_deleted: true, deleted_at: new Date().toISOString() });
    await this.logAction('SOFT_DELETE', 'events', id, ev, { is_deleted: true });
    return true;
  }

  public async restoreEvent(id: string): Promise<boolean> {
    const ev = await this.getEventById(id);
    if (!ev) return false;
    await this.updateEvent(id, { is_deleted: false, deleted_at: null });
    await this.logAction('RESTORE', 'events', id, { is_deleted: true }, { is_deleted: false });
    return true;
  }

  public async permanentDeleteEvent(id: string): Promise<boolean> {
    const events = this.getLocal<Event[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const existing = events.find(e => e.id === id);
    if (!existing) return false;

    this.setLocal(STORAGE_KEYS.EVENTS, events.filter(e => e.id !== id));
    await this.logAction('PERMANENT_DELETE', 'events', id, existing, null);
    return true;
  }

  // ==============================================================================
  // 4. DANCE CREWS
  // ==============================================================================
  public async getCrews(includeDeleted = false): Promise<DanceCrew[]> {
    const crews = this.getLocal<DanceCrew[]>(STORAGE_KEYS.CREWS, INITIAL_CREWS);
    if (includeDeleted) return crews;
    return crews.filter(c => !c.is_deleted && c.is_published);
  }

  public async getCrewById(id: string): Promise<DanceCrew | null> {
    const list = await this.getCrews(true);
    return list.find(c => c.id === id) || null;
  }

  public async createCrew(data: Partial<DanceCrew>): Promise<DanceCrew> {
    const newCrew: DanceCrew = {
      id: data.id || 'c-' + Math.random().toString(36).substring(2, 9),
      name: data.name!,
      description: data.description || '',
      dance_style: data.dance_style || 'Urban',
      formed_date: data.formed_date || new Date().toISOString().split('T')[0],
      avatar_url: data.avatar_url || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80',
      is_published: data.is_published ?? true,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const crews = this.getLocal<DanceCrew[]>(STORAGE_KEYS.CREWS, INITIAL_CREWS);
    this.setLocal(STORAGE_KEYS.CREWS, [...crews, newCrew]);
    await this.logAction('CREATE_CREW', 'crews', newCrew.id, null, newCrew);
    return newCrew;
  }

  public async updateCrew(id: string, updates: Partial<DanceCrew>): Promise<DanceCrew | null> {
    const crews = this.getLocal<DanceCrew[]>(STORAGE_KEYS.CREWS, INITIAL_CREWS);
    const index = crews.findIndex(c => c.id === id);
    if (index === -1) return null;

    const previous = crews[index];
    const updated: DanceCrew = { ...previous, ...updates, updated_at: new Date().toISOString() };
    crews[index] = updated;
    this.setLocal(STORAGE_KEYS.CREWS, crews);
    await this.logAction('UPDATE_CREW', 'crews', id, previous, updated);
    return updated;
  }

  public async softDeleteCrew(id: string): Promise<boolean> {
    const crew = await this.getCrewById(id);
    if (!crew) return false;
    await this.updateCrew(id, { is_deleted: true, deleted_at: new Date().toISOString() });
    await this.logAction('SOFT_DELETE', 'crews', id, crew, { is_deleted: true });
    return true;
  }

  public async restoreCrew(id: string): Promise<boolean> {
    const crew = await this.getCrewById(id);
    if (!crew) return false;
    await this.updateCrew(id, { is_deleted: false, deleted_at: null });
    await this.logAction('RESTORE', 'crews', id, { is_deleted: true }, { is_deleted: false });
    return true;
  }

  public async permanentDeleteCrew(id: string): Promise<boolean> {
    const crews = this.getLocal<DanceCrew[]>(STORAGE_KEYS.CREWS, INITIAL_CREWS);
    const existing = crews.find(c => c.id === id);
    if (!existing) return false;

    this.setLocal(STORAGE_KEYS.CREWS, crews.filter(c => c.id !== id));
    await this.logAction('PERMANENT_DELETE', 'crews', id, existing, null);
    return true;
  }

  // ==============================================================================
  // 5. SONGS
  // ==============================================================================
  public async getSongs(): Promise<Song[]> {
    return this.getLocal<Song[]>(STORAGE_KEYS.SONGS, INITIAL_SONGS);
  }

  public async createSong(data: Partial<Song>): Promise<Song> {
    const newSong: Song = {
      id: data.id || 's-' + Math.random().toString(36).substring(2, 9),
      title: data.title!,
      original_artist: data.original_artist || '',
      genre: data.genre || 'Various',
      release_year: data.release_year || new Date().getFullYear(),
      created_at: new Date().toISOString(),
    };
    const songs = this.getLocal<Song[]>(STORAGE_KEYS.SONGS, INITIAL_SONGS);
    this.setLocal(STORAGE_KEYS.SONGS, [...songs, newSong]);
    await this.logAction('CREATE_SONG', 'songs', newSong.id, null, newSong);
    return newSong;
  }

  // ==============================================================================
  // 6. ROLES
  // ==============================================================================
  public async getRoles(): Promise<Role[]> {
    return this.getLocal<Role[]>(STORAGE_KEYS.ROLES, INITIAL_ROLES);
  }

  public async createRole(name: string, department: 'music' | 'dance' | 'both'): Promise<Role> {
    const roles = await this.getRoles();
    const existing = roles.find(r => r.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;

    const newRole: Role = {
      id: 'role-' + Math.random().toString(36).substring(2, 9),
      name,
      department,
      is_custom: true,
      created_at: new Date().toISOString(),
    };
    this.setLocal(STORAGE_KEYS.ROLES, [...roles, newRole]);
    return newRole;
  }

  // ==============================================================================
  // 7. PERFORMANCES (Unified Music & Dance)
  // ==============================================================================
  public async getPerformances(
    department?: 'music' | 'dance',
    includeDeleted = false
  ): Promise<Performance[]> {
    const performances = this.getLocal<Performance[]>(STORAGE_KEYS.PERFORMANCES, INITIAL_PERFORMANCES);
    let filtered = performances;

    if (!includeDeleted) {
      filtered = filtered.filter(p => !p.is_deleted && p.is_published);
    }
    if (department) {
      filtered = filtered.filter(p => p.department === department);
    }
    return filtered;
  }

  public async getPerformanceById(id: string): Promise<Performance | null> {
    const all = await this.getPerformances(undefined, true);
    return all.find(p => p.id === id) || null;
  }

  public async createPerformance(data: {
    event_id: string;
    department: 'music' | 'dance';
    title: string;
    dance_style?: string | null;
    notes?: string | null;
    song_ids: string[];
    participants: Array<{
      performer_id: string;
      crew_id?: string | null;
      roles: Array<{ role_name: string; instrument?: string | null }>;
    }>;
  }): Promise<Performance> {
    const event = await this.getEventById(data.event_id);
    const allSongs = await this.getSongs();
    const selectedSongs = allSongs.filter(s => data.song_ids.includes(s.id));
    const allPerformers = await this.getPerformers(true);
    const allCrews = await this.getCrews(true);

    const perfId = 'perf-' + Math.random().toString(36).substring(2, 9);

    const participants = data.participants.map((p, idx) => {
      const performer = allPerformers.find(perf => perf.id === p.performer_id);
      const crew = p.crew_id ? allCrews.find(c => c.id === p.crew_id) : null;
      return {
        id: `pp-${perfId}-${idx}`,
        performance_id: perfId,
        performer_id: p.performer_id,
        crew_id: p.crew_id || null,
        created_at: new Date().toISOString(),
        performer,
        crew: crew || undefined,
        roles: p.roles.map((r, rIdx) => ({
          id: `pr-${perfId}-${idx}-${rIdx}`,
          participant_id: `pp-${perfId}-${idx}`,
          role_name: r.role_name,
          instrument: r.instrument || null,
          created_at: new Date().toISOString(),
        })),
      };
    });

    const newPerformance: Performance = {
      id: perfId,
      event_id: data.event_id,
      department: data.department,
      title: data.title,
      dance_style: data.dance_style || null,
      notes: data.notes || '',
      is_published: true,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      event: event || undefined,
      songs: selectedSongs,
      participants,
    };

    const performances = this.getLocal<Performance[]>(STORAGE_KEYS.PERFORMANCES, INITIAL_PERFORMANCES);
    this.setLocal(STORAGE_KEYS.PERFORMANCES, [newPerformance, ...performances]);
    await this.logAction('CREATE_PERFORMANCE', 'performances', perfId, null, newPerformance);
    return newPerformance;
  }

  public async updatePerformance(id: string, updates: Partial<Performance>): Promise<Performance | null> {
    const performances = this.getLocal<Performance[]>(STORAGE_KEYS.PERFORMANCES, INITIAL_PERFORMANCES);
    const index = performances.findIndex(p => p.id === id);
    if (index === -1) return null;

    const previous = performances[index];
    const updated: Performance = { ...previous, ...updates, updated_at: new Date().toISOString() };
    performances[index] = updated;
    this.setLocal(STORAGE_KEYS.PERFORMANCES, performances);
    await this.logAction('UPDATE_PERFORMANCE', 'performances', id, previous, updated);
    return updated;
  }

  public async softDeletePerformance(id: string): Promise<boolean> {
    const perf = await this.getPerformanceById(id);
    if (!perf) return false;
    await this.updatePerformance(id, { is_deleted: true, deleted_at: new Date().toISOString() });
    await this.logAction('SOFT_DELETE', 'performances', id, perf, { is_deleted: true });
    return true;
  }

  public async restorePerformance(id: string): Promise<boolean> {
    const perf = await this.getPerformanceById(id);
    if (!perf) return false;
    await this.updatePerformance(id, { is_deleted: false, deleted_at: null });
    await this.logAction('RESTORE', 'performances', id, { is_deleted: true }, { is_deleted: false });
    return true;
  }

  public async permanentDeletePerformance(id: string): Promise<boolean> {
    const performances = this.getLocal<Performance[]>(STORAGE_KEYS.PERFORMANCES, INITIAL_PERFORMANCES);
    const existing = performances.find(p => p.id === id);
    if (!existing) return false;

    this.setLocal(STORAGE_KEYS.PERFORMANCES, performances.filter(p => p.id !== id));
    await this.logAction('PERMANENT_DELETE', 'performances', id, existing, null);
    return true;
  }

  // ==============================================================================
  // 8. TRASH & RECOVERY (Unified)
  // ==============================================================================
  public async getTrashRecords(): Promise<{
    performances: Performance[];
    performers: Performer[];
    events: Event[];
    crews: DanceCrew[];
  }> {
    const performances = this.getLocal<Performance[]>(STORAGE_KEYS.PERFORMANCES, INITIAL_PERFORMANCES).filter(p => p.is_deleted);
    const performers = this.getLocal<Performer[]>(STORAGE_KEYS.PERFORMERS, INITIAL_PERFORMERS).filter(p => p.is_deleted);
    const events = this.getLocal<Event[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS).filter(e => e.is_deleted);
    const crews = this.getLocal<DanceCrew[]>(STORAGE_KEYS.CREWS, INITIAL_CREWS).filter(c => c.is_deleted);

    return { performances, performers, events, crews };
  }

  // ==============================================================================
  // 9. DYNAMIC STATISTICS & PERFORMANCE COUNTING RULES ENFORCEMENT
  // ==============================================================================

  public async getPerformerStats(performerId: string): Promise<PerformerStats | null> {
    const performer = await this.getPerformerById(performerId);
    if (!performer) return null;

    // Fetch active non-deleted performances
    const performances = await this.getPerformances(undefined, false);

    // Rule: Filter performances where this performer participated
    const participating = performances.filter(perf =>
      perf.participants?.some(part => part.performer_id === performerId)
    );

    // Counting Rules:
    // 1. Count distinct performance IDs
    const total_performances = participating.length;
    const total_music_performances = participating.filter(p => p.department === 'music').length;
    const total_dance_performances = participating.filter(p => p.department === 'dance').length;

    // 2. Count distinct event IDs
    const eventIds = new Set(participating.map(p => p.event_id));
    const unique_events_count = eventIds.size;

    // Collect roles without counting inflation
    const rolesSet = new Set<string>();
    const crewsMap = new Map<string, DanceCrew>();

    const history = participating.map(perf => {
      const participant = perf.participants?.find(p => p.performer_id === performerId);
      const roles = participant?.roles?.map(r => r.instrument ? `${r.role_name} (${r.instrument})` : r.role_name) || [];
      roles.forEach(r => rolesSet.add(r));

      if (participant?.crew) {
        crewsMap.set(participant.crew.id, participant.crew);
      }

      const songTitles = perf.songs?.map(s => s.title) || [];

      return {
        performance_id: perf.id,
        event_id: perf.event_id,
        event_name: perf.event?.name || 'KORUS Showcase',
        event_date: perf.event?.event_date || '2025-01-01',
        department: perf.department,
        roles,
        crew_name: participant?.crew?.name || null,
        songs: songTitles,
        notes: perf.notes || null,
      };
    });

    // Sort history chronologically descending
    history.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

    const first_performance_date = history.length > 0 ? history[history.length - 1].event_date : null;
    const latest_performance_date = history.length > 0 ? history[0].event_date : null;

    return {
      performer,
      total_performances,
      total_music_performances,
      total_dance_performances,
      unique_events_count,
      roles: Array.from(rolesSet),
      associated_crews: Array.from(crewsMap.values()),
      first_performance_date,
      latest_performance_date,
      history,
    };
  }

  public async getEventStats(eventId: string): Promise<EventStats | null> {
    const event = await this.getEventById(eventId);
    if (!event) return null;

    const performances = (await this.getPerformances(undefined, false)).filter(p => p.event_id === eventId);
    const music_performances_count = performances.filter(p => p.department === 'music').length;
    const dance_performances_count = performances.filter(p => p.department === 'dance').length;

    const uniquePerformers = new Set<string>();
    const uniqueCrews = new Set<string>();

    performances.forEach(perf => {
      perf.participants?.forEach(part => {
        uniquePerformers.add(part.performer_id);
        if (part.crew_id) uniqueCrews.add(part.crew_id);
      });
    });

    return {
      event,
      total_performances: performances.length,
      music_performances_count,
      dance_performances_count,
      total_unique_performers: uniquePerformers.size,
      total_unique_crews: uniqueCrews.size,
      performances,
    };
  }

  public async getCrewStats(crewId: string): Promise<CrewStats | null> {
    const crew = await this.getCrewById(crewId);
    if (!crew) return null;

    const performances = (await this.getPerformances('dance', false)).filter(perf =>
      perf.participants?.some(part => part.crew_id === crewId)
    );

    const uniqueEvents = new Set(performances.map(p => p.event_id));
    const allPerformers = await this.getPerformers(true);

    const history = performances.map(perf => ({
      performance_id: perf.id,
      event_name: perf.event?.name || 'Dance Showcase',
      event_date: perf.event?.event_date || '2025-01-01',
      title: perf.title,
      dance_style: perf.dance_style,
      songs: perf.songs?.map(s => s.title) || [],
      dancers_count: perf.participants?.filter(p => p.crew_id === crewId).length || 0,
    }));

    // Current & former members
    const activeDancerIds = new Set<string>();
    performances.forEach(p => {
      p.participants?.filter(pt => pt.crew_id === crewId).forEach(pt => activeDancerIds.add(pt.performer_id));
    });

    const members = allPerformers.filter(p => activeDancerIds.has(p.id));

    return {
      crew,
      total_performances: performances.length,
      unique_events_count: uniqueEvents.size,
      current_members: members,
      former_members: [],
      songs_used: performances.flatMap(p => p.songs || []),
      history,
    };
  }

  public async getSocietyAnalytics(): Promise<SocietyAnalytics> {
    const performers = await this.getPerformers(false);
    const events = await this.getEvents(false);
    const performances = await this.getPerformances(undefined, false);
    const crews = await this.getCrews(false);
    const songs = await this.getSongs();

    const musicPerfs = performances.filter(p => p.department === 'music');
    const dancePerfs = performances.filter(p => p.department === 'dance');

    // Monthly breakdown
    const monthlyMap: Record<string, { music: number; dance: number }> = {};
    performances.forEach(perf => {
      const date = perf.event?.event_date || perf.created_at;
      const month = date.substring(0, 7); // YYYY-MM
      if (!monthlyMap[month]) monthlyMap[month] = { music: 0, dance: 0 };
      if (perf.department === 'music') monthlyMap[month].music++;
      else monthlyMap[month].dance++;
    });

    const performances_by_month = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, counts]) => ({ month, ...counts }));

    // Top performers
    const performerCounts: Record<string, number> = {};
    performances.forEach(perf => {
      perf.participants?.forEach(part => {
        performerCounts[part.performer_id] = (performerCounts[part.performer_id] || 0) + 1;
      });
    });

    const top_performers = Object.entries(performerCounts)
      .map(([id, count]) => {
        const perf = performers.find(p => p.id === id);
        return {
          id,
          name: perf?.full_name || 'Artist',
          count,
          department: perf?.departments.join(', ') || 'music',
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top crews
    const crewCounts: Record<string, number> = {};
    performances.forEach(perf => {
      perf.participants?.forEach(part => {
        if (part.crew_id) {
          crewCounts[part.crew_id] = (crewCounts[part.crew_id] || 0) + 1;
        }
      });
    });

    const top_crews = Object.entries(crewCounts)
      .map(([id, count]) => {
        const crew = crews.find(c => c.id === id);
        return { id, name: crew?.name || 'Dance Crew', count };
      })
      .sort((a, b) => b.count - a.count);

    // Top songs
    const songCounts: Record<string, number> = {};
    performances.forEach(perf => {
      perf.songs?.forEach(s => {
        songCounts[s.id] = (songCounts[s.id] || 0) + 1;
      });
    });

    const top_songs = Object.entries(songCounts)
      .map(([id, count]) => {
        const s = songs.find(song => song.id === id);
        return {
          id,
          title: s?.title || 'Song',
          artist: s?.original_artist || 'Artist',
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Role distribution
    const roleCounts: Record<string, number> = {};
    performances.forEach(perf => {
      perf.participants?.forEach(part => {
        part.roles?.forEach(r => {
          roleCounts[r.role_name] = (roleCounts[r.role_name] || 0) + 1;
        });
      });
    });

    const role_distribution = Object.entries(roleCounts)
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total_performers: performers.length,
      total_events: events.length,
      total_performances: performances.length,
      total_music_performances: musicPerfs.length,
      total_dance_performances: dancePerfs.length,
      total_crews: crews.length,
      total_songs: songs.length,
      performances_by_month,
      top_performers,
      top_crews,
      top_songs,
      role_distribution,
      recent_performances: performances.slice(0, 6),
    };
  }

  // ==============================================================================
  // 10. GLOBAL FUZZY SEARCH SYSTEM
  // ==============================================================================
  public async searchGlobal(query: string): Promise<{
    performers: Array<{ id: string; name: string; subtitle: string; url: string; matchType: string }>;
    events: Array<{ id: string; name: string; subtitle: string; url: string }>;
    crews: Array<{ id: string; name: string; subtitle: string; url: string }>;
    songs: Array<{ id: string; name: string; subtitle: string; url: string }>;
  }> {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { performers: [], events: [], crews: [], songs: [] };
    }

    const [performers, events, crews, songs, performances] = await Promise.all([
      this.getPerformers(false),
      this.getEvents(false),
      this.getCrews(false),
      this.getSongs(),
      this.getPerformances(undefined, false),
    ]);

    // 1. Search Performers (by name, stage name, roles, instruments)
    const matchingPerformers = performers.filter(p => {
      const nameMatch = p.full_name.toLowerCase().includes(q) || (p.stage_name && p.stage_name.toLowerCase().includes(q));
      if (nameMatch) return true;

      // Check roles played by performer in performances
      const rolesMatch = performances.some(perf =>
        perf.participants?.some(part =>
          part.performer_id === p.id &&
          part.roles?.some(r =>
            r.role_name.toLowerCase().includes(q) ||
            (r.instrument && r.instrument.toLowerCase().includes(q))
          )
        )
      );
      return rolesMatch;
    }).map(p => ({
      id: p.id,
      name: p.full_name,
      subtitle: `${p.stage_name ? `"${p.stage_name}" · ` : ''}${p.departments.map(d => d.toUpperCase()).join(' & ')}`,
      url: `/performers/${p.id}`,
      matchType: p.departments.join(', '),
    }));

    // 2. Search Events
    const matchingEvents = events
      .filter(e => e.name.toLowerCase().includes(q) || (e.venue && e.venue.toLowerCase().includes(q)))
      .map(e => ({
        id: e.id,
        name: e.name,
        subtitle: `${e.event_date} · ${e.category}`,
        url: `/events/${e.id}`,
      }));

    // 3. Search Crews
    const matchingCrews = crews
      .filter(c => c.name.toLowerCase().includes(q) || (c.dance_style && c.dance_style.toLowerCase().includes(q)))
      .map(c => ({
        id: c.id,
        name: c.name,
        subtitle: c.dance_style || 'Dance Crew',
        url: `/crews/${c.id}`,
      }));

    // 4. Search Songs
    const matchingSongs = songs
      .filter(s => s.title.toLowerCase().includes(q) || (s.original_artist && s.original_artist.toLowerCase().includes(q)))
      .map(s => ({
        id: s.id,
        name: s.title,
        subtitle: s.original_artist ? `by ${s.original_artist}` : 'Song',
        url: `/songs?search=${encodeURIComponent(s.title)}`,
      }));

    return {
      performers: matchingPerformers,
      events: matchingEvents,
      crews: matchingCrews,
      songs: matchingSongs,
    };
  }
}

export const dataService = new DataService();
