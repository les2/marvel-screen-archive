import type { CatalogQueryState, CatalogSortMode } from './catalog-query';

export const DEFAULT_CATALOG_STATE: CatalogQueryState = {
  query:'', universeId:'all', sagaId:'all', phaseId:'all', mediaType:'all', sortMode:'release'
};

const MEDIA_TYPES = new Set(['all','film','series','special','short']);
const SORT_MODES = new Set<CatalogSortMode>(['release','timeline','title']);

export function parseCatalogState(search: string): CatalogQueryState {
  const params = new URLSearchParams(search);
  const mediaType = params.get('format') ?? DEFAULT_CATALOG_STATE.mediaType;
  const order = params.get('order') as CatalogSortMode | null;
  return {
    query:params.get('q')?.trim() ?? '',
    universeId:params.get('universe') || 'all',
    sagaId:params.get('saga') || 'all',
    phaseId:params.get('phase') || 'all',
    mediaType:MEDIA_TYPES.has(mediaType) ? mediaType : 'all',
    sortMode:order && SORT_MODES.has(order) ? order : 'release'
  };
}

export function serializeCatalogState(state: CatalogQueryState): string {
  const params = new URLSearchParams();
  if (state.query.trim()) params.set('q',state.query.trim());
  if (state.universeId !== 'all') params.set('universe',state.universeId);
  if (state.sagaId !== 'all') params.set('saga',state.sagaId);
  if (state.phaseId !== 'all') params.set('phase',state.phaseId);
  if (state.mediaType !== 'all') params.set('format',state.mediaType);
  if (state.sortMode !== 'release') params.set('order',state.sortMode);
  return params.toString();
}
