export interface WatchProgressSnapshot {
  schemaVersion:1;
  guideId:string;
  guideVersion:string;
  watchedTitleIds:string[];
  updatedAt:string;
}

export function parseWatchProgress(raw: string | null, guideId: string, validTitleIds: Iterable<string>): Set<string> {
  if (!raw) return new Set();
  try {
    const value = JSON.parse(raw) as Partial<WatchProgressSnapshot>;
    if (value.schemaVersion !== 1 || value.guideId !== guideId || !Array.isArray(value.watchedTitleIds)) return new Set();
    const valid = new Set(validTitleIds);
    return new Set(value.watchedTitleIds.filter((id): id is string => typeof id === 'string' && valid.has(id)));
  } catch {
    return new Set();
  }
}

export function createWatchProgressSnapshot(guideId:string, guideVersion:string, watchedTitleIds:Iterable<string>, updatedAt = new Date().toISOString()): WatchProgressSnapshot {
  return {
    schemaVersion:1,
    guideId,
    guideVersion,
    watchedTitleIds:[...new Set(watchedTitleIds)].sort(),
    updatedAt
  };
}

export function toggleWatchedTitle(current:Set<string>, titleId:string, watched:boolean): Set<string> {
  const next = new Set(current);
  if (watched) next.add(titleId); else next.delete(titleId);
  return next;
}
