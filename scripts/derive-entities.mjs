import { readFileSync, writeFileSync } from 'node:fs';
const root = new URL('../public/data/', import.meta.url);
const titles = JSON.parse(readFileSync(new URL('titles.json', root), 'utf8'));
const appearances = titles.flatMap((title) => title.appearances.map((item,index) => ({id:`${title.id}:${item.characterId}:${index}`,titleId:title.id,...item})));
const creditScenes = titles.flatMap((title) => title.creditScenes.map((scene,index) => ({id:`${title.id}:${scene.position}:${index}`,titleId:title.id,...scene})));
writeFileSync(new URL('appearances.json', root), `${JSON.stringify(appearances, null, 2)}\n`);
writeFileSync(new URL('credit-scenes.json', root), `${JSON.stringify(creditScenes, null, 2)}\n`);
console.log(`Derived ${appearances.length} appearances and ${creditScenes.length} credit-scene records.`);
