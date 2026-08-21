import { describe, expect, it } from 'vitest';
import charactersJson from '../../public/data/characters.json';
import collectionsJson from '../../public/data/collections.json';
import phasesJson from '../../public/data/phases.json';
import storyArcsJson from '../../public/data/story-arcs.json';
import titlesJson from '../../public/data/titles.json';
import watchGuidesJson from '../../public/data/watch-guides.json';
import type { Character, Phase, TitleRecord, WatchGuide } from './models';

const titles = titlesJson as unknown as TitleRecord[];
const characters = charactersJson as Character[];
const phases = phasesJson as Phase[];
const titleById = new Map(titles.map((title) => [title.id,title]));
const watchGuides = watchGuidesJson as WatchGuide[];

describe('catalog data integrity', () => {
  it('has unique stable IDs and a complete release sequence', () => {
    expect(new Set(titles.map(({id}) => id)).size).toBe(titles.length);
    expect([...titles.map(({releaseOrder}) => releaseOrder)].sort((a,b) => a-b)).toEqual(Array.from({length:titles.length},(_,index) => index + 1));
  });

  it('keeps release navigation valid and reciprocal', () => {
    const byRelease = [...titles].sort((a,b) => a.releaseOrder - b.releaseOrder);
    byRelease.forEach((title,index) => {
      expect(title.previousByRelease?.id).toBe(index ? byRelease[index - 1].id : undefined);
      expect(title.nextByRelease?.id).toBe(index < byRelease.length - 1 ? byRelease[index + 1].id : undefined);
    });
  });

  it('resolves every title, timeline, collection, and character reference', () => {
    const characterIds = new Set(characters.map(({id}) => id));
    for (const title of titles) {
      for (const reference of [title.previousByRelease,title.nextByRelease,title.previousInTimeline,title.nextInTimeline]) {
        if (reference) expect(titleById.has(reference.id), `${title.id} → ${reference.id}`).toBe(true);
      }
      for (const navigation of title.collectionNavigation ?? []) {
        if (navigation.previousId) expect(titleById.has(navigation.previousId)).toBe(true);
        if (navigation.nextId) expect(titleById.has(navigation.nextId)).toBe(true);
      }
      for (const appearance of title.appearances) expect(characterIds.has(appearance.characterId), `${title.id} → ${appearance.characterId}`).toBe(true);
    }
  });

  it('models all MCU titles as Saga → Phase → Title', () => {
    const mcuTitles = titles.filter(({universeIds}) => universeIds.includes('mcu-616'));
    expect(mcuTitles).toHaveLength(67);
    expect(mcuTitles.every(({phaseId}) => phases.some(({id}) => id === phaseId))).toBe(true);
    expect(Object.fromEntries(phases.map((phase) => [phase.id,mcuTitles.filter(({phaseId}) => phaseId === phase.id).length]))).toEqual({
      'mcu-phase-1':6,'mcu-phase-2':6,'mcu-phase-3':11,'mcu-phase-4':18,'mcu-phase-5':16,'mcu-phase-6':10
    });
    expect(mcuTitles.filter(({sagaIds}) => sagaIds.includes('infinity-saga'))).toHaveLength(23);
    expect(mcuTitles.filter(({sagaIds}) => sagaIds.includes('multiverse-saga'))).toHaveLength(44);
  });

  it('keeps Disney+ canonical for MCU records', () => {
    const mcuTitles = titles.filter(({universeIds}) => universeIds.includes('mcu-616'));
    expect(mcuTitles.every(({links}) => links.some(({provider,kind,canonical}) => provider === 'Disney+' && kind === 'stream' && canonical))).toBe(true);
  });

  it('provides a distinct AI-assisted editorial description for every title', () => {
    const descriptions = titles.map(({editorialDescription}) => editorialDescription ?? '');
    expect(descriptions.every((description) => description.length >= 40)).toBe(true);
    expect(new Set(descriptions).size).toBe(titles.length);
    expect(titles.every(({descriptionSource}) => descriptionSource === 'ai-assisted')).toBe(true);
    expect(descriptions.some((description) => /details are being expanded/i.test(description))).toBe(false);
  });

  it('explains every named collection', () => {
    expect(collectionsJson.every(({description}) => description.length >= 20)).toBe(true);
    expect(storyArcsJson.every(({description}) => description.length >= 20)).toBe(true);
  });

  it('provides broad, reciprocal character coverage with labeled AI profiles', () => {
    const appearances = titles.flatMap((title) => title.appearances.map((appearance) => ({titleId:title.id,...appearance})));
    const appearanceCountByCharacter = new Map<string,number>();
    for (const {characterId} of appearances) appearanceCountByCharacter.set(characterId,(appearanceCountByCharacter.get(characterId) ?? 0) + 1);
    expect(characters.length).toBeGreaterThanOrEqual(1400);
    expect(appearances.length).toBeGreaterThanOrEqual(2300);
    expect(titles.filter(({appearances}) => appearances.length).length).toBeGreaterThanOrEqual(188);
    for (const character of characters) {
      expect(character.descriptionSource).toBe('ai-assisted');
      expect(character.description?.length).toBeGreaterThan(70);
      expect(character.appearanceCount).toBe(appearanceCountByCharacter.get(character.id));
      expect(['confirmed','probable','screen-original','unclassified']).toContain(character.comicOrigin);
    }
  });

  it('uses direct stable IDs when available and labels every fallback honestly', () => {
    const allLinks = titles.flatMap(({links}) => links);
    expect(titles.every(({links}) => links.some(({provider,resolution,url}) => provider === 'IMDb' && resolution === 'direct' && /\/title\/tt\d+\/$/.test(url)))).toBe(true);
    expect(titles.filter(({links}) => links.some(({provider,resolution}) => provider === 'Apple TV' && resolution === 'direct')).length).toBeGreaterThanOrEqual(90);
    expect(titles.filter(({links}) => links.some(({provider,resolution}) => provider === 'Disney+' && resolution === 'direct')).length).toBeGreaterThanOrEqual(100);
    expect(allLinks.filter(({resolution}) => resolution === 'direct').some(({url}) => /\/find\/?|\/search\??|[?&](?:q|term|k)=/i.test(url))).toBe(false);
    expect(allLinks.every(({resolution}) => ['direct','search','live-search'].includes(resolution ?? ''))).toBe(true);
  });

  it('adds keyless live theater discovery to upcoming and recently released films', () => {
    const announcedFilms = titles.filter(({status,mediaType}) => status === 'announced' && mediaType === 'film');
    expect(announcedFilms).toHaveLength(3);
    expect(announcedFilms.every(({links}) => links.some(({provider,kind,resolution,url}) => provider === 'Google Maps' && kind === 'theater' && resolution === 'live-search' && url.startsWith('https://www.google.com/maps/search/')))).toBe(true);
    expect(titleById.get('spider-man-brand-new-day')?.links.some(({kind,resolution}) => kind === 'theater' && resolution === 'live-search')).toBe(true);
  });

  it('publishes a complete, ordered Doomsday protocol with valid title references', () => {
    const guide = watchGuides.find(({targetTitleId}) => targetTitleId === 'avengers-doomsday');
    expect(guide).toBeDefined();
    const items = guide!.sections.flatMap(({items}) => items);
    const core = items.filter(({countsTowardCoreRuntime}) => countsTowardCoreRuntime);
    expect(items.map(({order}) => order)).toEqual(Array.from({length:items.length},(_,index) => index + 1));
    expect(new Set(items.map(({titleId}) => titleId)).size).toBe(items.length);
    expect(items.every(({titleId}) => titleById.has(titleId))).toBe(true);
    expect(core).toHaveLength(16);
    expect(core.reduce((sum,{estimatedMinutes}) => sum + estimatedMinutes,0)).toBe(guide!.estimatedCoreMinutes);
    expect(guide!.estimatedCoreMinutes).toBeGreaterThanOrEqual(40 * 60);
    expect(guide!.estimatedCoreMinutes).toBeLessThan(42 * 60);
    expect(items.every(({watchSearchUrl}) => watchSearchUrl.startsWith('https://www.google.com/search?q=where+to+watch+'))).toBe(true);
    expect(items.filter(({priority}) => priority === 'archive-bonus').map(({titleId}) => titleId)).toEqual(['x-men-animated','x-men-97']);
  });
});
