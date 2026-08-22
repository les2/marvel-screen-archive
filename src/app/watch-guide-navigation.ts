const PREFIX = '#guide-';

export function watchGuideHash(id:string): string { return `${PREFIX}${encodeURIComponent(id)}`; }

export function watchGuideIdFromHash(hash:string): string | null {
  if (!hash.startsWith(PREFIX) || hash.length === PREFIX.length) return null;
  try { return decodeURIComponent(hash.slice(PREFIX.length)); } catch { return null; }
}
