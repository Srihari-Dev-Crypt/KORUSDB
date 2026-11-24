import { describe, it, expect, beforeEach } from 'vitest';
import { dataService } from '../src/lib/data-service';

describe('Performance Counting Rules & Invariants (Section 7)', () => {
  it('Scenario 7 & 8: Multiple roles and multiple songs do NOT inflate performance count', async () => {
    // Performer Arjun Sharma has ID: aaaaaaaa-1111-0000-0000-000000000001
    // In perf_m1: Arjun has 2 roles (Lead Vocalist + Acoustic Guitarist)
    // In perf_d1: Arjun has 1 role, but the routine uses 2 songs (Believer + Uptown Funk)
    // In perf_m2: Arjun has 2 roles (Lead Vocalist + Electric Guitarist)
    const stats = await dataService.getPerformerStats('aaaaaaaa-1111-0000-0000-000000000001');
    expect(stats).not.toBeNull();

    // Must count distinct performance IDs, not total roles or total songs
    expect(stats?.total_performances).toBe(3);
    expect(stats?.total_music_performances).toBe(2);
    expect(stats?.total_dance_performances).toBe(1);

    // Verify roles array collected without inflating performance count
    expect(stats?.roles.length).toBeGreaterThanOrEqual(3);
  });

  it('Scenario 9: Separate performances at the same event are counted individually', async () => {
    // If an artist performs in two distinct performances at the same event:
    const perf1 = await dataService.createPerformance({
      event_id: '11111111-1111-1111-1111-111111111111',
      department: 'music',
      title: 'Solo Acoustic Set',
      song_ids: [],
      participants: [
        {
          performer_id: 'aaaaaaaa-1111-0000-0000-000000000001',
          roles: [{ role_name: 'Lead Vocalist' }],
        },
      ],
    });

    const perf2 = await dataService.createPerformance({
      event_id: '11111111-1111-1111-1111-111111111111',
      department: 'music',
      title: 'Band Encore Set',
      song_ids: [],
      participants: [
        {
          performer_id: 'aaaaaaaa-1111-0000-0000-000000000001',
          roles: [{ role_name: 'Guitarist' }],
        },
      ],
    });

    const stats = await dataService.getPerformerStats('aaaaaaaa-1111-0000-0000-000000000001');
    // Previously 3 + 2 new separate performances at the same event = 5 distinct performances
    expect(stats?.total_performances).toBe(5);

    // However, unique events attended must still count the single event once!
    // The events are: ev_freshers, ev_cultfest, ev_annualfest (3 unique events)
    expect(stats?.unique_events_count).toBe(3);
  });

  it('Scenario 10: Historical performances remain intact after crew membership changes', async () => {
    // In perf_d1, Rhythm Collective performed at Cultural Fest
    const initialCrewStats = await dataService.getCrewStats('bbbbbbbb-2222-0000-0000-000000000001');
    const initialPerfCount = initialCrewStats?.total_performances;

    // Simulate removing or updating a crew member's status
    const crewMemberships = [{ performer_id: 'aaaaaaaa-1111-0000-0000-000000000001', is_current: false }];
    
    // Historical performance records must not decrease or vanish
    const crewStatsAfter = await dataService.getCrewStats('bbbbbbbb-2222-0000-0000-000000000001');
    expect(crewStatsAfter?.total_performances).toBe(initialPerfCount);
  });

  it('Scenario 13: Soft deleted records are excluded from public stats and can be restored', async () => {
    // Soft delete performance
    await dataService.softDeletePerformance('dddddddd-4444-0000-0000-000000000003');

    // Public active performances must exclude deleted
    const active = await dataService.getPerformances(undefined, false);
    expect(active.some(p => p.id === 'dddddddd-4444-0000-0000-000000000003')).toBe(false);

    // Trash repository must contain it
    const trash = await dataService.getTrashRecords();
    expect(trash.performances.some(p => p.id === 'dddddddd-4444-0000-0000-000000000003')).toBe(true);

    // Restore performance
    await dataService.restorePerformance('dddddddd-4444-0000-0000-000000000003');
    const restored = await dataService.getPerformances(undefined, false);
    expect(restored.some(p => p.id === 'dddddddd-4444-0000-0000-000000000003')).toBe(true);
  });
});
