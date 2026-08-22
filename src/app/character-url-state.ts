import type { CharacterQueryState, CharacterSortMode } from './character-query';
import type { Character, RoleType } from './models';

export const DEFAULT_CHARACTER_STATE: CharacterQueryState = {
  query:'', universeId:'all', role:'all', comicOrigin:'all', sortMode:'appearances'
};

const ROLES = new Set<RoleType | 'all'>(['all','lead','major','supporting','minor','cameo']);
const ORIGINS = new Set<NonNullable<Character['comicOrigin']> | 'all'>(['all','confirmed','probable','screen-original','unclassified']);
const SORT_MODES = new Set<CharacterSortMode>(['appearances','name','first-appearance','recent-appearance']);

export function parseCharacterState(search:string):CharacterQueryState {
  const params = new URLSearchParams(search);
  const role = params.get('characterRole') as CharacterQueryState['role'] | null;
  const comicOrigin = params.get('characterOrigin') as CharacterQueryState['comicOrigin'] | null;
  const sortMode = params.get('characterOrder') as CharacterSortMode | null;
  return {
    query:params.get('characterQuery')?.trim() ?? '',
    universeId:params.get('characterUniverse') || 'all',
    role:role && ROLES.has(role) ? role : 'all',
    comicOrigin:comicOrigin && ORIGINS.has(comicOrigin) ? comicOrigin : 'all',
    sortMode:sortMode && SORT_MODES.has(sortMode) ? sortMode : 'appearances'
  };
}

export function applyCharacterState(params:URLSearchParams,state:CharacterQueryState):URLSearchParams {
  const next = new URLSearchParams(params);
  for (const key of ['characterQuery','characterUniverse','characterRole','characterOrigin','characterOrder']) next.delete(key);
  if (state.query.trim()) next.set('characterQuery',state.query.trim());
  if (state.universeId !== 'all') next.set('characterUniverse',state.universeId);
  if (state.role !== 'all') next.set('characterRole',state.role);
  if (state.comicOrigin !== 'all') next.set('characterOrigin',state.comicOrigin);
  if (state.sortMode !== 'appearances') next.set('characterOrder',state.sortMode);
  return next;
}
