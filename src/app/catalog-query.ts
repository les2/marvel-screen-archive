import type { Character, Phase, TitleRecord } from './models';

export type CatalogSortMode = 'release' | 'timeline' | 'title';

export interface CatalogQueryState {
  query: string;
  universeId: string;
  sagaId: string;
  phaseId: string;
  mediaType: string;
  sortMode: CatalogSortMode;
}

export function normalizeSearch(value = ''): string {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

export function filterAndSortTitles(titles: TitleRecord[], characters: Character[], state: CatalogQueryState): TitleRecord[] {
  const query = normalizeSearch(state.query);
  const characterById = new Map(characters.map((character) => [character.id, character]));
  const records = titles.filter((title) => {
    if (state.universeId !== 'all' && !title.universeIds.includes(state.universeId)) return false;
    if (state.sagaId !== 'all' && !title.sagaIds.includes(state.sagaId)) return false;
    if (state.phaseId !== 'all' && title.phaseId !== state.phaseId) return false;
    if (state.mediaType !== 'all' && title.mediaType !== state.mediaType) return false;
    if (!query) return true;
    const characterTerms = title.appearances.flatMap((appearance) => {
      const character = characterById.get(appearance.characterId);
      return character ? [character.name, ...character.aliases] : [];
    });
    const haystack = normalizeSearch([title.title, title.synopsis, title.editorialDescription, title.timelineYear, ...(title.searchAliases ?? []), ...characterTerms].join(' '));
    return query.split(' ').every((term) => haystack.includes(term));
  });

  return [...records].sort((a, b) => {
    if (state.sortMode === 'title') return a.title.localeCompare(b.title);
    if (state.sortMode === 'timeline') return (a.timelineOrder ?? Number.MAX_SAFE_INTEGER) - (b.timelineOrder ?? Number.MAX_SAFE_INTEGER) || a.releaseDate.localeCompare(b.releaseDate);
    return a.releaseDate.localeCompare(b.releaseDate) || a.title.localeCompare(b.title);
  });
}

export function phasesForSaga(phases: Phase[], sagaId: string): Phase[] {
  return sagaId === 'all' ? phases : phases.filter((phase) => phase.sagaId === sagaId);
}

export function compatiblePhaseSelection(phases: Phase[], phaseId: string, sagaId: string): string {
  if (phaseId === 'all') return phaseId;
  return sagaId !== 'all' && phases.some((phase) => phase.id === phaseId && phase.sagaId === sagaId) ? phaseId : 'all';
}

export function availableSagaIds(titles: TitleRecord[], universeId: string): Set<string> {
  return new Set(titles.filter((title) => universeId === 'all' || title.universeIds.includes(universeId)).flatMap((title) => title.sagaIds));
}

export function availablePhaseIds(titles: TitleRecord[], universeId: string, sagaId: string): Set<string> {
  return new Set(titles.filter((title) => (universeId === 'all' || title.universeIds.includes(universeId)) && (sagaId === 'all' || title.sagaIds.includes(sagaId))).flatMap((title) => title.phaseId ? [title.phaseId] : []));
}
