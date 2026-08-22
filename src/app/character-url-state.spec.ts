import { describe,expect,it } from 'vitest';
import { applyCharacterState,DEFAULT_CHARACTER_STATE,parseCharacterState } from './character-url-state';

describe('character URL state',() => {
  it('uses useful defaults for an empty or invalid query string',() => {
    expect(parseCharacterState('?characterRole=villain&characterOrder=random')).toEqual(DEFAULT_CHARACTER_STATE);
  });

  it('parses and trims every supported value',() => {
    expect(parseCharacterState('?characterQuery=%20Spider-Man%20&characterUniverse=mcu&characterRole=lead&characterOrigin=confirmed&characterOrder=name')).toEqual({query:'Spider-Man',universeId:'mcu',role:'lead',comicOrigin:'confirmed',sortMode:'name'});
  });

  it('round trips character filters while retaining catalog parameters',() => {
    const params = applyCharacterState(new URLSearchParams('universe=mcu&saga=infinity'),{query:'Wanda',universeId:'mcu',role:'major',comicOrigin:'probable',sortMode:'recent-appearance'});
    expect(params.get('universe')).toBe('mcu');
    expect(params.get('saga')).toBe('infinity');
    expect(parseCharacterState(params.toString())).toEqual({query:'Wanda',universeId:'mcu',role:'major',comicOrigin:'probable',sortMode:'recent-appearance'});
  });

  it('removes default character values without disturbing other state',() => {
    const params = applyCharacterState(new URLSearchParams('q=iron&characterRole=lead'),DEFAULT_CHARACTER_STATE);
    expect(params.toString()).toBe('q=iron');
  });
});
