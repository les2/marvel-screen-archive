import { describe, expect, it } from 'vitest';
import { watchGuideHash, watchGuideIdFromHash } from './watch-guide-navigation';

describe('watch guide navigation', () => {
  it('round-trips a shareable guide hash', () => {
    expect(watchGuideIdFromHash(watchGuideHash('doomsday-protocol'))).toBe('doomsday-protocol');
  });

  it('ignores ordinary page anchors and malformed guide hashes', () => {
    expect(watchGuideIdFromHash('#catalog')).toBeNull();
    expect(watchGuideIdFromHash('#guide-')).toBeNull();
    expect(watchGuideIdFromHash('#guide-%E0%A4%A')).toBeNull();
  });
});
