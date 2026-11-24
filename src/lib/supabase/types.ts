export type Department = 'music' | 'dance' | 'both';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'viewer';
  created_at: string;
}

export interface Performer {
  id: string;
  full_name: string;
  stage_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  departments: string[]; // e.g. ['music', 'dance']
  join_date?: string | null;
  is_published: boolean;
  is_deleted: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocietyEvent {
  id: string;
  name: string;
  event_date: string;
  venue?: string | null;
  description?: string | null;
  category: string;
  is_published: boolean;
  is_deleted: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type Event = SocietyEvent;

export interface Role {
  id: string;
  name: string;
  department: Department;
  is_custom: boolean;
  created_at: string;
}

export interface DanceCrew {
  id: string;
  name: string;
  description?: string | null;
  formed_date?: string | null;
  avatar_url?: string | null;
  dance_style?: string | null;
  is_published: boolean;
  is_deleted: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrewMembership {
  id: string;
  crew_id: string;
  performer_id: string;
  role_title: string;
  joined_date?: string | null;
  left_date?: string | null;
  is_current: boolean;
  created_at: string;
  updated_at: string;
  performer?: Performer;
  crew?: DanceCrew;
}

export interface Song {
  id: string;
  title: string;
  original_artist?: string | null;
  genre?: string | null;
  release_year?: number | null;
  created_at: string;
}

export interface Performance {
  id: string;
  event_id: string;
  department: 'music' | 'dance';
  title: string;
  dance_style?: string | null;
  notes?: string | null;
  is_published: boolean;
  is_deleted: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  // Hydrated joins
  event?: Event;
  songs?: Song[];
  participants?: PerformanceParticipant[];
}

export interface PerformanceParticipant {
  id: string;
  performance_id: string;
  performer_id: string;
  crew_id?: string | null;
  created_at: string;
  performer?: Performer;
  crew?: DanceCrew;
  roles?: ParticipantRole[];
}

export interface ParticipantRole {
  id: string;
  participant_id: string;
  role_name: string;
  instrument?: string | null;
  created_at: string;
}

export interface PerformanceSong {
  id: string;
  performance_id: string;
  song_id: string;
  order_index: number;
  created_at: string;
  song?: Song;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  previous_values?: Record<string, any> | null;
  new_values?: Record<string, any> | null;
  ip_address?: string | null;
  status: string;
  created_at: string;
}

export interface AppSettings {
  private_mode: boolean;
  society_meta: {
    name: string;
    subtitle: string;
    tagline: string;
    established: number;
  };
}

// Statistics Types
export interface PerformerStats {
  performer: Performer;
  total_performances: number;
  total_music_performances: number;
  total_dance_performances: number;
  unique_events_count: number;
  roles: string[];
  associated_crews: DanceCrew[];
  first_performance_date?: string | null;
  latest_performance_date?: string | null;
  history: Array<{
    performance_id: string;
    event_id: string;
    event_name: string;
    event_date: string;
    department: 'music' | 'dance';
    roles: string[];
    crew_name?: string | null;
    songs: string[];
    notes?: string | null;
  }>;
}

export interface EventStats {
  event: Event;
  total_performances: number;
  music_performances_count: number;
  dance_performances_count: number;
  total_unique_performers: number;
  total_unique_crews: number;
  performances: Performance[];
}

export interface CrewStats {
  crew: DanceCrew;
  total_performances: number;
  unique_events_count: number;
  current_members: Performer[];
  former_members: Performer[];
  songs_used: Song[];
  history: Array<{
    performance_id: string;
    event_name: string;
    event_date: string;
    title: string;
    dance_style?: string | null;
    songs: string[];
    dancers_count: number;
  }>;
}

export interface SocietyAnalytics {
  total_performers: number;
  total_events: number;
  total_performances: number;
  total_music_performances: number;
  total_dance_performances: number;
  total_crews: number;
  total_songs: number;
  performances_by_month: Array<{ month: string; music: number; dance: number }>;
  top_performers: Array<{ id: string; name: string; count: number; department: string }>;
  top_crews: Array<{ id: string; name: string; count: number }>;
  top_songs: Array<{ id: string; title: string; artist: string; count: number }>;
  role_distribution: Array<{ role: string; count: number }>;
  recent_performances: Performance[];
}
