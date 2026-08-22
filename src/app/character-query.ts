import type { Character, RoleType, TitleRecord } from './models';
import { normalizeSearch } from './catalog-query';

export type CharacterSortMode = 'appearances' | 'name' | 'first-appearance' | 'recent-appearance';

export interface CharacterQueryState {
  query: string;
  universeId: string;
  role: RoleType | 'all';
  comicOrigin: NonNullable<Character['comicOrigin']> | 'all';
  sortMode: CharacterSortMode;
}

export function filterAndSortCharacters(characters: Character[], titles: TitleRecord[], state: CharacterQueryState): Character[] {
  const query = normalizeSearch(state.query);
  const releaseOrderById = new Map(titles.map((title) => [title.id, title.releaseOrder]));
  const appearanceCountById = new Map<string,number>();
  for (const title of titles) {
    for (const appearance of title.appearances) {
      appearanceCountById.set(appearance.characterId,(appearanceCountById.get(appearance.characterId) ?? 0) + 1);
    }
  }

  const countFor = (character:Character):number => character.appearanceCount ?? appearanceCountById.get(character.id) ?? 0;
  const orderFor = (id?:string, fallback = Number.MAX_SAFE_INTEGER):number => id ? releaseOrderById.get(id) ?? fallback : fallback;

  const records = characters.filter((character) => {
    if (state.universeId !== 'all' && !character.universeIds?.includes(state.universeId)) return false;
    if (state.role !== 'all' && character.primaryRole !== state.role) return false;
    if (state.comicOrigin !== 'all' && character.comicOrigin !== state.comicOrigin) return false;
    if (!query) return true;
    const haystack = normalizeSearch([character.name,...character.aliases,character.description,...(character.powers ?? []),...(character.skills ?? []),...(character.affiliations ?? [])].filter(Boolean).join(' '));
    return query.split(' ').every((term) => haystack.includes(term));
  });

  return [...records].sort((a,b) => {
    if (state.sortMode === 'name') return a.name.localeCompare(b.name);
    if (state.sortMode === 'first-appearance') return orderFor(a.firstAppearanceId) - orderFor(b.firstAppearanceId) || a.name.localeCompare(b.name);
    if (state.sortMode === 'recent-appearance') return orderFor(b.latestAppearanceId,-1) - orderFor(a.latestAppearanceId,-1) || a.name.localeCompare(b.name);
    return countFor(b) - countFor(a) || a.name.localeCompare(b.name);
  });
}
