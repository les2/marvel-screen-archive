import { readFileSync,writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { characterProfileFor } from './character-profile-data.mjs';

const root = resolve(new URL('..',import.meta.url).pathname);
const dataRoot = resolve(root,'public/data');
const charactersPath = resolve(dataRoot,'characters.json');
const metadataPath = resolve(dataRoot,'metadata.json');
const sourcesPath = resolve(dataRoot,'sources.json');
const characters = JSON.parse(readFileSync(charactersPath,'utf8'));
const titles = JSON.parse(readFileSync(resolve(dataRoot,'titles.json'),'utf8'));
const universes = JSON.parse(readFileSync(resolve(dataRoot,'universes.json'),'utf8'));
const titleById = new Map(titles.map((title) => [title.id,title]));
const universeById = new Map(universes.map((universe) => [universe.id,universe]));

function catalogSummaryFor(character) {
  const first = titleById.get(character.firstAppearanceId);
  const latest = titleById.get(character.latestAppearanceId);
  const count = character.appearanceCount ?? 0;
  if (!first) return `${count} indexed ${count === 1 ? 'appearance' : 'appearances'}; release-order endpoints are not yet resolved.`;
  const range = latest && latest.id !== first.id ? ` through ${latest.title} (${latest.releaseDate.slice(0,4)})` : '';
  return `${count} indexed ${count === 1 ? 'appearance' : 'appearances'}, from ${first.title} (${first.releaseDate.slice(0,4)})${range}. Highest recorded story role: ${character.primaryRole ?? 'unclassified'}.`;
}

function screenCreditDescription(character) {
  const first = titleById.get(character.firstAppearanceId);
  const universe = universeById.get(character.universeIds?.[0]);
  if (!first) return `${character.name} is a credited screen character whose identity, powers, and affiliations have not yet been independently verified.`;
  const role = character.primaryRole ? `${character.primaryRole} ` : '';
  const continuity = universe ? ` in the ${universe.name} continuity` : '';
  return `${character.name} is a ${role}character credited in ${first.title}, the ${first.releaseDate.slice(0,4)} ${first.mediaType}${continuity}. The credit is indexed, but the character’s identity, powers, and affiliations still require independent profile research.`;
}

let researched = 0;
for (const character of characters) {
  const profile = characterProfileFor(character.id);
  character.catalogSummary = catalogSummaryFor(character);
  if (profile) {
    Object.assign(character,profile,{profileStatus:'researched',descriptionSource:'ai-assisted'});
    character.comicOrigin = 'confirmed';
    character.profileConfidence = 'curated';
    character.sourceIds = [...new Set([...(character.sourceIds ?? []),'ai-assisted-character-editorial'])];
    researched += 1;
  } else {
    character.description = screenCreditDescription(character);
    character.descriptionSource = 'ai-assisted';
    character.characterType = 'unknown';
    character.alignment = 'unknown';
    character.powerStatus = 'unknown';
    character.powers = [];
    character.skills = [];
    character.affiliations = [];
    character.profileStatus = 'screen-credit-only';
  }
}

const aBomb = characters.find(({id}) => id === 'a-bomb');
if (aBomb) {
  aBomb.aliases = [...new Set([...aBomb.aliases,'Rick Jones'])];
  aBomb.wikipediaUrl = 'https://en.wikipedia.org/wiki/Rick_Jones_(character)';
  aBomb.sourceIds = [...new Set([...(aBomb.sourceIds ?? []),'wikipedia-character-reference'])];
}

const metadata = JSON.parse(readFileSync(metadataPath,'utf8'));
metadata.version = '0.6.0';
metadata.schemaVersion = '1.5.0';
metadata.updatedAt = '2026-08-21T00:00:00Z';
const sources = JSON.parse(readFileSync(sourcesPath,'utf8'));
if (!sources.some(({id}) => id === 'ai-assisted-character-editorial')) sources.push({
  id:'ai-assisted-character-editorial',name:'AI-assisted character editorial profiles',url:'https://www.marvel.com/characters',authority:'editorial',usedFor:['plain-language character identity summaries','power and skill labels','affiliation and alignment labels']
});
if (!sources.some(({id}) => id === 'wikipedia-character-reference')) sources.push({
  id:'wikipedia-character-reference',name:'Wikipedia character references',url:'https://en.wikipedia.org/wiki/Category:Marvel_Comics_characters',authority:'community',usedFor:['linked character identity cross-checks','public character reference pages']
});

writeFileSync(charactersPath,`${JSON.stringify(characters,null,2)}\n`);
writeFileSync(metadataPath,`${JSON.stringify(metadata,null,2)}\n`);
writeFileSync(sourcesPath,`${JSON.stringify(sources,null,2)}\n`);
console.log(JSON.stringify({characters:characters.length,researched,screenCreditOnly:characters.length-researched},null,2));
