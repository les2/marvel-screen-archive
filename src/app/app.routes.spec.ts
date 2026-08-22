import { describe,expect,it } from 'vitest';
import { APP_ROUTES,pageFromUrl } from './app.routes';

describe('application routes',() => {
  it('defines home, characters, and a safe fallback',() => {
    expect(APP_ROUTES.map(({path}) => path)).toEqual(['','characters','**']);
  });

  it('recognizes the character route with query strings and fragments',() => {
    expect(pageFromUrl('/characters?characterRole=lead#top')).toBe('characters');
    expect(pageFromUrl('/characters/')).toBe('characters');
  });

  it('treats the root and unknown paths as the home surface',() => {
    expect(pageFromUrl('/?order=timeline')).toBe('home');
    expect(pageFromUrl('/not-found')).toBe('home');
  });
});
