import { describe, it, expect } from 'vitest';
import { dataService } from '../src/lib/data-service';

describe('Global Search System (Section 7 & 22)', () => {
  it('Searches performers by full and partial name', async () => {
    const results = await dataService.searchGlobal('Arjun');
    expect(results.performers.length).toBeGreaterThan(0);
    expect(results.performers[0].name).toContain('Arjun');
  });

  it('Searches performers by instrument / performance role', async () => {
    // Rohan or Arjun played Guitarist
    const results = await dataService.searchGlobal('Guitarist');
    expect(results.performers.length).toBeGreaterThan(0);
  });

  it('Searches events by name and venue', async () => {
    const results = await dataService.searchGlobal('Tarangini');
    expect(results.events.length).toBeGreaterThan(0);
    expect(results.events[0].name).toContain('Tarangini');
  });

  it('Searches crews by dance style or crew name', async () => {
    const results = await dataService.searchGlobal('Rhythm');
    expect(results.crews.length).toBeGreaterThan(0);
    expect(results.crews[0].name).toBe('Rhythm Collective');
  });

  it('Searches songs by title and artist', async () => {
    const results = await dataService.searchGlobal('Yellow');
    expect(results.songs.length).toBeGreaterThan(0);
    expect(results.songs[0].name).toBe('Yellow');
  });
});
