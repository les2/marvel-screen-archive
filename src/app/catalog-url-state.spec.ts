import { describe, expect, it } from 'vitest';
import { DEFAULT_CATALOG_STATE, parseCatalogState, serializeCatalogState } from './catalog-url-state';

describe('catalog URL state', () => {
  it('parses all supported query-string controls', () => {
    expect(parseCatalogState('?q=iron+man&universe=mcu-616&saga=infinity-saga&phase=mcu-phase-1&format=film&order=timeline')).toEqual({
      query:'iron man',universeId:'mcu-616',sagaId:'infinity-saga',phaseId:'mcu-phase-1',mediaType:'film',sortMode:'timeline'
    });
  });

  it('omits defaults to keep shareable URLs compact', () => {
    expect(serializeCatalogState(DEFAULT_CATALOG_STATE)).toBe('');
    expect(serializeCatalogState({...DEFAULT_CATALOG_STATE,query:'  Wanda Vision  ',mediaType:'series'})).toBe('q=Wanda+Vision&format=series');
  });

  it('round-trips a customized catalog view', () => {
    const state = {...DEFAULT_CATALOG_STATE,universeId:'mcu-616',sagaId:'multiverse-saga',phaseId:'mcu-phase-6',sortMode:'title' as const};
    expect(parseCatalogState(`?${serializeCatalogState(state)}`)).toEqual(state);
  });

  it('falls back safely when format or order values are invalid', () => {
    expect(parseCatalogState('?format=podcast&order=random')).toEqual(DEFAULT_CATALOG_STATE);
  });
});
