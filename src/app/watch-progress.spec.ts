import { describe, expect, it } from 'vitest';
import { createWatchProgressSnapshot, parseWatchProgress, toggleWatchedTitle } from './watch-progress';

describe('watch progress', () => {
  it('round-trips a private progress snapshot and removes stale title IDs', () => {
    const snapshot = createWatchProgressSnapshot('doomsday-protocol','1.0.0',['x-men','loki-s1','removed-title'],'2026-08-21T00:00:00Z');
    expect([...parseWatchProgress(JSON.stringify(snapshot),'doomsday-protocol',['x-men','loki-s1'])]).toEqual(['loki-s1','x-men']);
  });

  it('fails closed for corrupt or mismatched snapshots', () => {
    expect(parseWatchProgress('{','doomsday-protocol',['x-men']).size).toBe(0);
    expect(parseWatchProgress(JSON.stringify({schemaVersion:1,guideId:'other',watchedTitleIds:['x-men']}),'doomsday-protocol',['x-men']).size).toBe(0);
  });

  it('returns a new set when changing an item', () => {
    const current = new Set(['x-men']);
    const next = toggleWatchedTitle(current,'x2',true);
    expect([...current]).toEqual(['x-men']);
    expect([...next]).toEqual(['x-men','x2']);
    expect([...toggleWatchedTitle(next,'x-men',false)]).toEqual(['x2']);
  });
});
