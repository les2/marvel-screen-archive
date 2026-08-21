import { describe, expect, it } from 'vitest';
import type { Character, Phase, TitleRecord } from './models';
import { compatiblePhaseSelection, filterAndSortTitles, normalizeSearch, phasesForSaga, type CatalogQueryState } from './catalog-query';

const characters: Character[] = [
  {id:'tony-stark',name:'Tony Stark',aliases:['Iron Man']},
  {id:'wanda-maximoff',name:'Wanda Maximoff',aliases:['Scarlet Witch']}
];

function title(overrides: Partial<TitleRecord> & Pick<TitleRecord,'id'|'title'|'releaseDate'>): TitleRecord {
  return {
    mediaType:'film',status:'released',synopsis:'',universeIds:['mcu-616'],sagaIds:[],collectionIds:[],releaseOrder:1,
    appearances:[],creditScenes:[],links:[],...overrides
  };
}

const titles: TitleRecord[] = [
  title({id:'wandavision',title:'WandaVision',releaseDate:'2021-01-15',mediaType:'series',synopsis:'A mystery unfolds in Westview.',sagaIds:['multiverse-saga'],phaseId:'mcu-phase-4',timelineOrder:3,appearances:[{characterId:'wanda-maximoff',role:'lead'}]}),
  title({id:'iron-man',title:'Iron Man',releaseDate:'2008-05-02',synopsis:'An inventor builds a powered suit.',sagaIds:['infinity-saga'],phaseId:'mcu-phase-1',timelineOrder:2,appearances:[{characterId:'tony-stark',role:'lead'}]}),
  title({id:'captain-marvel',title:'Captain Marvel',releaseDate:'2019-03-08',synopsis:'A cosmic hero returns.',sagaIds:['infinity-saga'],phaseId:'mcu-phase-3',timelineOrder:1}),
  title({id:'doomsday',title:'Avengers: Doomsday',releaseDate:'2026-12-18',status:'announced',sagaIds:['multiverse-saga'],phaseId:'mcu-phase-6'})
];

const baseState: CatalogQueryState = {query:'',universeId:'all',sagaId:'all',phaseId:'all',mediaType:'all',sortMode:'release'};

describe('catalog search and filtering', () => {
  it('normalizes punctuation and accents for resilient search', () => {
    expect(normalizeSearch('  Héroes: End-Game! ')).toBe('heroes end game');
  });

  it('matches titles, multi-word queries, character names, and aliases', () => {
    expect(filterAndSortTitles(titles,characters,{...baseState,query:'powered inventor'}).map(({id}) => id)).toEqual(['iron-man']);
    expect(filterAndSortTitles(titles,characters,{...baseState,query:'Tony Stark'}).map(({id}) => id)).toEqual(['iron-man']);
    expect(filterAndSortTitles(titles,characters,{...baseState,query:'Scarlet Witch'}).map(({id}) => id)).toEqual(['wandavision']);
  });

  it('combines universe, saga, phase, and media-type filters', () => {
    const result = filterAndSortTitles(titles,characters,{...baseState,universeId:'mcu-616',sagaId:'multiverse-saga',phaseId:'mcu-phase-4',mediaType:'series'});
    expect(result.map(({id}) => id)).toEqual(['wandavision']);
  });

  it('sorts by release, timeline with unknown entries last, and title', () => {
    expect(filterAndSortTitles(titles,characters,baseState).map(({id}) => id)).toEqual(['iron-man','captain-marvel','wandavision','doomsday']);
    expect(filterAndSortTitles(titles,characters,{...baseState,sortMode:'timeline'}).map(({id}) => id)).toEqual(['captain-marvel','iron-man','wandavision','doomsday']);
    expect(filterAndSortTitles(titles,characters,{...baseState,sortMode:'title'}).map(({id}) => id)).toEqual(['doomsday','captain-marvel','iron-man','wandavision']);
  });
});

describe('saga and phase selection', () => {
  const phases: Phase[] = [
    {id:'mcu-phase-1',name:'Phase One',number:1,sagaId:'infinity-saga',status:'completed',startDate:'2008-05-02',description:''},
    {id:'mcu-phase-6',name:'Phase Six',number:6,sagaId:'multiverse-saga',status:'current',startDate:'2025-07-25',description:''}
  ];

  it('shows only phases belonging to the selected saga', () => {
    expect(phasesForSaga(phases,'infinity-saga').map(({id}) => id)).toEqual(['mcu-phase-1']);
    expect(phasesForSaga(phases,'all')).toEqual(phases);
  });

  it('clears a phase that is incompatible with a newly selected saga', () => {
    expect(compatiblePhaseSelection(phases,'mcu-phase-1','multiverse-saga')).toBe('all');
    expect(compatiblePhaseSelection(phases,'mcu-phase-6','multiverse-saga')).toBe('mcu-phase-6');
    expect(compatiblePhaseSelection(phases,'mcu-phase-6','all')).toBe('all');
  });
});
