import { describe, expect, it } from 'vitest';
import charactersJson from '../../public/data/characters.json';
import phasesJson from '../../public/data/phases.json';
import titlesJson from '../../public/data/titles.json';
import type { Character, Phase, TitleRecord } from './models';

const titles = titlesJson as unknown as TitleRecord[];
const characters = charactersJson as Character[];
const phases = phasesJson as Phase[];
const titleById = new Map(titles.map((title) => [title.id,title]));

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
});
