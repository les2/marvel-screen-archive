import { describe,expect,it } from 'vitest';
import type { Character,TitleRecord } from './models';
import { filterAndSortCharacters,type CharacterQueryState } from './character-query';

const characters:Character[] = [
  {id:'peter',name:'Peter Parker',aliases:['Spider-Man'],description:'A friendly neighborhood hero.',powers:['Wall-crawling'],affiliations:['Avengers'],universeIds:['mcu'],appearanceCount:2,firstAppearanceId:'civil-war',latestAppearanceId:'no-way-home',primaryRole:'lead',comicOrigin:'confirmed'},
  {id:'mj',name:'Michelle Jones-Watson',aliases:['MJ'],description:'Peter’s closest ally.',universeIds:['mcu'],appearanceCount:1,firstAppearanceId:'homecoming',latestAppearanceId:'homecoming',primaryRole:'supporting',comicOrigin:'probable'},
  {id:'miles',name:'Miles Morales',aliases:['Spider-Man'],description:'A hero from another dimension.',universeIds:['spider-verse'],appearanceCount:3,firstAppearanceId:'spider-verse',latestAppearanceId:'across',primaryRole:'lead',comicOrigin:'confirmed'}
];

function title(id:string,releaseOrder:number,appearanceIds:string[] = []):TitleRecord {
  return {id,title:id,mediaType:'film',releaseDate:'2020-01-01',status:'released',synopsis:'',universeIds:[],sagaIds:[],collectionIds:[],releaseOrder,appearances:appearanceIds.map((characterId) => ({characterId,role:'major'})),creditScenes:[],links:[]};
}

const titles = [title('civil-war',1,['peter']),title('homecoming',2,['mj']),title('spider-verse',3,['miles']),title('no-way-home',4,['peter']),title('across',5,['miles'])];
const base:CharacterQueryState = {query:'',universeId:'all',role:'all',comicOrigin:'all',sortMode:'appearances'};

describe('character directory query',() => {
  it('searches names, aliases, and descriptions without accents or punctuation',() => {
    expect(filterAndSortCharacters(characters,titles,{...base,query:'friendly hero'}).map(({id}) => id)).toEqual(['peter']);
    expect(filterAndSortCharacters(characters,titles,{...base,query:'spider man'}).map(({id}) => id)).toEqual(['miles','peter']);
    expect(filterAndSortCharacters(characters,titles,{...base,query:'wall crawling Avengers'}).map(({id}) => id)).toEqual(['peter']);
  });

  it('combines universe, role, and origin filters',() => {
    expect(filterAndSortCharacters(characters,titles,{...base,universeId:'mcu',role:'lead',comicOrigin:'confirmed'}).map(({id}) => id)).toEqual(['peter']);
  });

  it('sorts by appearances, name, first appearance, and latest appearance',() => {
    expect(filterAndSortCharacters(characters,titles,base).map(({id}) => id)).toEqual(['miles','peter','mj']);
    expect(filterAndSortCharacters(characters,titles,{...base,sortMode:'name'}).map(({id}) => id)).toEqual(['mj','miles','peter']);
    expect(filterAndSortCharacters(characters,titles,{...base,sortMode:'first-appearance'}).map(({id}) => id)).toEqual(['peter','mj','miles']);
    expect(filterAndSortCharacters(characters,titles,{...base,sortMode:'recent-appearance'}).map(({id}) => id)).toEqual(['miles','peter','mj']);
  });
});
