import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createGunzip } from 'node:zlib';
import { createInterface } from 'node:readline';
import { dirname, resolve } from 'node:path';

const projectRoot = resolve(new URL('..', import.meta.url).pathname);
const dataRoot = resolve(projectRoot,'public/data');
const imdbRoot = process.env.MARVEL_IMDB_DATA_DIR || resolve(projectRoot,'work/imdb');
const cachePath = resolve(projectRoot,'work/wikidata-title-links.json');
const titles = JSON.parse(readFileSync(resolve(dataRoot,'titles.json'),'utf8'));
const existingCharacters = JSON.parse(readFileSync(resolve(dataRoot,'characters.json'),'utf8'));

for (const file of ['title.basics.tsv.gz','title.principals.tsv.gz']) {
  if (!existsSync(resolve(imdbRoot,file))) throw new Error(`Missing ${file}. Download IMDb's non-commercial dataset files into ${imdbRoot}.`);
}

const spiderMan = titles.find(({id}) => id === 'spider-man-brand-new-day');
if (spiderMan) {
  spiderMan.status = 'released';
  spiderMan.editorialDescription = spiderMan.editorialDescription?.replace('an announced film','a 2026 film');
}
const beyondSpiderVerse = titles.find(({id}) => id === 'beyond-spider-verse');
if (beyondSpiderVerse) beyondSpiderVerse.releaseDate = '2027-06-04';

const normalize = (value) => value.normalize('NFKD').replace(/[’']/g,'').replace(/&/g,' and ').replace(/\bmarvels?\b/gi,' ').replace(/\s+[—-]\s+season\s+\d+$/i,'').replace(/[^a-z0-9]+/gi,' ').trim().toLowerCase();
const slug = (value) => normalize(value).replaceAll(' ','-') || 'unnamed-character';
const typePreference = {
  film:new Set(['movie','tvMovie','video']),series:new Set(['tvSeries','tvMiniSeries']),special:new Set(['tvSpecial','tvMovie','video']),short:new Set(['short','tvShort','tvSeries'])
};
const overrides = {
  'new-fantastic-four':'tt0241100','x-men-animated':'tt0103584','nick-fury-agent-shield':'tt0119781','ultimate-avengers-2':'tt0803093',
  'doctor-strange-animated':'tt0910865','iron-man-anime':'tt1707807','wolverine-anime':'tt1847521','x-men-anime':'tt2070571','blade-anime':'tt1988235',
  'loki-s2':'tt9140554','hit-monkey-s2':'tt9811316'
};

const curatedIdentities = {
  'tony-stark':['Tony Stark','Iron Man'],'steve-rogers':['Steve Rogers','Captain America'],'thor-odinson':['Thor Odinson','Thor'],'natasha-romanoff':['Natasha Romanoff','Black Widow','Natalie Rushman'],
  'bruce-banner':['Bruce Banner','Hulk'],'clint-barton':['Clint Barton','Hawkeye','Ronin'],'peter-parker':['Peter Parker','Spider-Man','Spider Man'],'wanda-maximoff':['Wanda Maximoff','Scarlet Witch'],
  'loki':['Loki Laufeyson','Loki','God of Mischief'],'tchalla':["T'Challa",'Black Panther'],'carol-danvers':['Carol Danvers','Captain Marvel'],'stephen-strange':['Stephen Strange','Doctor Strange','Dr. Stephen Strange'],
  'miles-morales':['Miles Morales'],'logan':['Logan','Wolverine','James Howlett'],'matt-murdock':['Matt Murdock','Daredevil'],'reed-richards':['Reed Richards','Mr. Fantastic','Mister Fantastic'],'sue-storm':['Sue Storm','Sue Richards','Invisible Woman','Invisible Girl'],
  'johnny-storm':['Johnny Storm','Human Torch'],'ben-grimm':['Ben Grimm','The Thing','Thing'],'victor-von-doom':['Victor Von Doom','Doctor Doom','Dr. Doom'],'charles-xavier':['Charles Xavier','Professor X','Professor Charles Xavier'],
  'scott-summers':['Scott Summers','Cyclops'],'jean-grey':['Jean Grey','Phoenix','Dark Phoenix'],'ororo-munroe':['Ororo Munroe','Storm'],'hank-mccoy':['Hank McCoy','Henry McCoy','Beast','Dr. Henry Hank McCoy'],
  'anna-marie':['Anna Marie','Rogue'],'remy-lebeau':['Remy LeBeau','Gambit'],'jubilation-lee':['Jubilation Lee','Jubilee'],'erik-lehnsherr':['Erik Lehnsherr','Erik Magnus Lehnsherr','Magneto','Magnus'],
  'wade-wilson':['Wade Wilson','Deadpool'],'vanessa-carlysle':['Vanessa Carlysle','Vanessa'],'eddie-brock':['Eddie Brock'],'venom':['Venom'],'cletus-kasady':['Cletus Kasady','Carnage'],
  'gwen-stacy':['Gwen Stacy','Spider-Gwen','Ghost-Spider'],'miguel-ohara':["Miguel O'Hara",'Spider-Man 2099'],'jessica-drew':['Jessica Drew','Spider-Woman'],'otto-octavius':['Otto Octavius','Doctor Octopus','Doc Ock'],
  'norman-osborn':['Norman Osborn','Green Goblin'],'harry-osborn':['Harry Osborn'],'wilson-fisk':['Wilson Fisk','Kingpin'],'frank-castle':['Frank Castle','The Punisher','Punisher'],'elektra-natchios':['Elektra Natchios','Elektra'],
  'nick-fury':['Nick Fury','Colonel Nick Fury','Director Fury'],'phil-coulson':['Phil Coulson','Agent Coulson'],'maria-hill':['Maria Hill'],'james-rhodes':['James Rhodes','James Rhodey Rhodes','Rhodey','War Machine'],
  'pepper-potts':['Pepper Potts'],'happy-hogan':['Happy Hogan'],'bucky-barnes':['Bucky Barnes','James Buchanan Barnes','Winter Soldier'],'sam-wilson':['Sam Wilson','Falcon','Captain America'],
  'scott-lang':['Scott Lang','Ant-Man'],'hope-van-dyne':['Hope van Dyne','Hope Van Dyne','Wasp'],'hank-pym':['Hank Pym','Dr. Hank Pym','Ant-Man'],'janet-van-dyne':['Janet van Dyne','Wasp'],
  'peter-quill':['Peter Quill','Star-Lord','Star Lord'],'gamora':['Gamora'],'drax':['Drax','Drax the Destroyer'],'rocket':['Rocket','Rocket Raccoon'],'groot':['Groot'],'nebula':['Nebula'],'mantis':['Mantis'],
  'thanos':['Thanos'],'vision':['Vision'],'pietro-maximoff':['Pietro Maximoff','Quicksilver'],'shuri':['Shuri','Black Panther'],'erik-killmonger':['Erik Killmonger','Erik Stevens','N\'Jadaka','Killmonger'],
  'okoye':['Okoye'],'wong':['Wong'],'ancient-one':['Ancient One','The Ancient One'],'dormammu':['Dormammu'],'kamala-khan':['Kamala Khan','Ms. Marvel'],'monica-rambeau':['Monica Rambeau','Photon'],
  'shang-chi':['Shang-Chi','Shang Chi'],'jennifer-walters':['Jennifer Walters','She-Hulk'],'marc-spector':['Marc Spector','Moon Knight','Steven Grant','Jake Lockley'],'agatha-harkness':['Agatha Harkness','Agnes'],
  'kate-bishop':['Kate Bishop','Hawkeye'],'yelena-belova':['Yelena Belova','Black Widow'],'john-walker':['John Walker','U.S. Agent','US Agent'],'riri-williams':['Riri Williams','Ironheart'],
  'jessica-jones':['Jessica Jones'],'luke-cage':['Luke Cage','Carl Lucas'],'danny-rand':['Danny Rand','Iron Fist'],'blade':['Blade','Eric Brooks'],'johnny-blaze':['Johnny Blaze','Ghost Rider'],
  'robbie-reyes':['Robbie Reyes','Ghost Rider'],'franklin-nelson':['Franklin Foggy Nelson','Foggy Nelson'],'karen-page':['Karen Page'],'may-parker':['May Parker','Aunt May'],'ben-parker':['Ben Parker','Uncle Ben']
};
const curatedExistingCharacters = existingCharacters.filter(({id,officialUrl,wikipediaUrl}) => Boolean(curatedIdentities[id] || officialUrl || wikipediaUrl));

const wanted = new Map();
for (const title of titles) {
  const key = normalize(title.title);
  if (!wanted.has(key)) wanted.set(key,[]);
  wanted.get(key).push(title);
}
const candidates = new Map(titles.map(({id}) => [id,[]]));
const basics = createInterface({input:createReadStream(resolve(imdbRoot,'title.basics.tsv.gz')).pipe(createGunzip()),crlfDelay:Infinity});
let firstLine = true;
for await (const line of basics) {
  if (firstLine) { firstLine=false; continue; }
  const [tconst,titleType,primaryTitle,originalTitle,,startYear] = line.split('\t');
  const matchingTitles = new Set([...(wanted.get(normalize(primaryTitle)) ?? []),...(wanted.get(normalize(originalTitle)) ?? [])]);
  for (const title of matchingTitles) {
    const delta = Math.abs(Number(title.releaseDate.slice(0,4))-Number(startYear));
    if (delta > 2 && title.status !== 'announced') continue;
    const score = (delta === 0 ? 100 : delta === 1 ? 65 : delta === 2 ? 30 : 0) + (typePreference[title.mediaType].has(titleType) ? 25 : 0) + (normalize(primaryTitle) === normalize(title.title) ? 5 : 0);
    candidates.get(title.id).push({tconst,titleType,score});
  }
}
const imdbByTitle = new Map();
for (const title of titles) {
  const best = candidates.get(title.id).sort((a,b) => b.score-a.score)[0];
  const imdb = overrides[title.id] ?? (best?.score >= 90 ? best.tconst : undefined);
  if (imdb) imdbByTitle.set(title.id,imdb);
}

const ids = [...new Set(imdbByTitle.values())];
let externalByImdb = {};
if (existsSync(cachePath) && process.argv.includes('--offline')) {
  externalByImdb = JSON.parse(readFileSync(cachePath,'utf8'));
} else {
  const values = ids.map((id) => `"${id}"`).join(' ');
  const query = `SELECT ?item ?imdb ?appleMovie ?appleShow ?amazon ?prime ?disneyMovie ?disneySeries WHERE { VALUES ?imdb { ${values} } ?item wdt:P345 ?imdb. OPTIONAL { ?item wdt:P9586 ?appleMovie. } OPTIONAL { ?item wdt:P9751 ?appleShow. } OPTIONAL { ?item wdt:P8055 ?amazon. } OPTIONAL { ?item wdt:P14440 ?prime. } OPTIONAL { ?item wdt:P7595 ?disneyMovie. } OPTIONAL { ?item wdt:P7596 ?disneySeries. } }`;
  const body = new URLSearchParams({query,format:'json'});
  const response = await fetch('https://query.wikidata.org/sparql',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded','user-agent':'MarvelScreenArchive/0.4 (public metadata project)'},body});
  if (!response.ok) throw new Error(`Wikidata query failed: ${response.status}`);
  const json = await response.json();
  for (const {item,imdb,appleMovie,appleShow,amazon,prime,disneyMovie,disneySeries} of json.results.bindings) {
    externalByImdb[imdb.value] ??= {};
    Object.assign(externalByImdb[imdb.value],{
      wikidata:item.value.split('/').pop(),appleMovie:appleMovie?.value,appleShow:appleShow?.value,amazon:amazon?.value,prime:prime?.value,disneyMovie:disneyMovie?.value,disneySeries:disneySeries?.value
    });
  }
  mkdirSync(dirname(cachePath),{recursive:true});
  writeFileSync(cachePath,`${JSON.stringify(externalByImdb,null,2)}\n`);
}

const searchPattern = /\/find\/?|\/search\??|[?&](?:q|term|k)=|\/brand\/marvel/i;
function setLink(title,provider,url,kind,resolution,sourceId,canonical=false) {
  title.links = title.links.filter((link) => link.provider !== provider && !(provider === 'Amazon Prime Video' && link.provider === 'Amazon'));
  title.links.push({provider,url,kind,resolution,sourceId,lastVerified:'2026-08-21',...(canonical ? {canonical:true} : {})});
}
for (const title of titles) {
  title.externalIds ??= {};
  title.links = title.links.map((link) => ({...link,resolution:link.resolution ?? (searchPattern.test(link.url) ? 'search' : 'direct')}));
  const imdb = imdbByTitle.get(title.id);
  if (imdb) {
    title.externalIds.imdb = imdb;
    setLink(title,'IMDb',`https://www.imdb.com/title/${imdb}/`,'reference','direct','imdb-non-commercial');
    const idsForTitle = externalByImdb[imdb] ?? {};
    if (idsForTitle.wikidata) title.externalIds.wikidata = idsForTitle.wikidata;
    const appleId = idsForTitle.appleMovie ?? idsForTitle.appleShow;
    if (appleId) setLink(title,'Apple TV',`https://tv.apple.com/${idsForTitle.appleMovie ? 'movie' : 'show'}/${appleId}`,'purchase','direct','wikidata');
    const primeId = idsForTitle.prime ?? idsForTitle.amazon;
    if (primeId) setLink(title,'Amazon Prime Video',idsForTitle.prime ? `https://www.primevideo.com/detail/${primeId}` : `https://www.amazon.com/gp/video/detail/${primeId}`,'purchase','direct','wikidata');
    const disneyId = idsForTitle.disneyMovie ?? idsForTitle.disneySeries;
    if (disneyId) setLink(title,'Disney+',`https://www.disneyplus.com/${idsForTitle.disneyMovie ? 'movies/wd' : 'series/wp'}/${disneyId}`,'stream','direct','wikidata',true);
  }
  for (const link of title.links) {
    link.resolution ??= searchPattern.test(link.url) ? 'search' : 'direct';
    if (link.resolution === 'search') link.sourceId ??= 'provider-search';
  }
  const theaterEligible = title.mediaType === 'film' && (title.status === 'announced' || title.releaseDate >= '2026-05-01');
  if (theaterEligible) {
    const query = encodeURIComponent(`${title.title} showtimes near me`);
    setLink(title,'Google Maps',`https://www.google.com/maps/search/?api=1&query=${query}&utm_source=marvel_screen_archive&utm_campaign=showtimes`,'theater','live-search','google-maps-urls');
  }
}

const titleIdsByImdb = new Map();
for (const [titleId,imdb] of imdbByTitle) {
  if (!titleIdsByImdb.has(imdb)) titleIdsByImdb.set(imdb,[]);
  titleIdsByImdb.get(imdb).push(titleId);
}
const rawCredits = [];
const principals = createInterface({input:createReadStream(resolve(imdbRoot,'title.principals.tsv.gz')).pipe(createGunzip()),crlfDelay:Infinity});
firstLine = true;
for await (const line of principals) {
  if (firstLine) { firstLine=false; continue; }
  const [tconst,ordering,nconst,category,,characters] = line.split('\t');
  if (!titleIdsByImdb.has(tconst) || !['actor','actress','self','archive_footage'].includes(category) || characters === '\\N') continue;
  let names;
  try { names=JSON.parse(characters); } catch { continue; }
  for (const titleId of titleIdsByImdb.get(tconst)) for (const name of names) rawCredits.push({titleId,tconst,ordering:Number(ordering),nconst,category,name});
}

const identityByAlias = new Map();
for (const [id,names] of Object.entries(curatedIdentities)) for (const name of names) identityByAlias.set(normalize(name),id);
for (const character of curatedExistingCharacters) for (const name of [character.name,...character.aliases]) identityByAlias.set(normalize(name),character.id);
const knownById = new Map(curatedExistingCharacters.map((character) => [character.id,character]));
const characterNames = new Map();
const characterNconsts = new Map();
const genericRole = /^(?:additional voices?|voice|self|unknown|various(?: characters?| roles?)?|(?:shield|s\.h\.i\.e\.l\.d\.)? ?agent #?\d+|(?:security )?guard #?\d+|(?:police )?officer #?\d+|cop #?\d+|soldier #?\d+|man #?\d+|woman #?\d+|boy #?\d+|girl #?\d+|child #?\d+|reporter #?\d+|driver #?\d+|waiter #?\d+|waitress #?\d+|civilian #?\d+|pedestrian #?\d+)$/i;
function cleanName(value) { return value.replace(/\s*\((?:voice|uncredited|archive footage|credit only)\)\s*/gi,' ').replace(/\s+/g,' ').trim(); }
function characterIdFor(name) {
  const known = identityByAlias.get(normalize(name));
  if (known) return known;
  return slug(name);
}
const rawByTitle = Map.groupBy(rawCredits,(credit) => credit.titleId);
for (const title of titles) {
  const original = new Map(title.appearances.filter(({sourceId}) => sourceId !== 'imdb-non-commercial').map((appearance) => [appearance.characterId,{...appearance,roleConfidence:'verified',sourceId:'editorial-core'}]));
  const titleCredits = rawByTitle.get(title.id) ?? [];
  const performerRank = new Map([...new Set([...titleCredits].sort((a,b) => a.ordering-b.ordering).map(({nconst}) => nconst))].map((nconst,index) => [nconst,index + 1]));
  const firstIdentityByPerformer = new Map();
  for (const credit of titleCredits) {
    const name = cleanName(credit.name);
    if (!name || genericRole.test(name)) continue;
    const characterId = characterIdFor(name);
    if (!characterNames.has(characterId)) characterNames.set(characterId,new Set());
    characterNames.get(characterId).add(name);
    if (!characterNconsts.has(characterId)) characterNconsts.set(characterId,new Set());
    characterNconsts.get(characterId).add(credit.nconst);
    if (original.has(characterId)) continue;
    const cameo = credit.category === 'archive_footage' || /uncredited|cameo/i.test(credit.name);
    const rank = performerRank.get(credit.nconst) ?? credit.ordering;
    const secondaryIdentity = firstIdentityByPerformer.has(credit.nconst) && firstIdentityByPerformer.get(credit.nconst) !== characterId;
    firstIdentityByPerformer.set(credit.nconst,firstIdentityByPerformer.get(credit.nconst) ?? characterId);
    const role = cameo ? 'cameo' : secondaryIdentity ? 'minor' : rank <= 2 ? 'lead' : rank <= 5 ? 'major' : rank <= 10 ? 'supporting' : 'minor';
    original.set(characterId,{characterId,role,billingOrder:rank,roleConfidence:'inferred',sourceId:'imdb-non-commercial',sourceScope:title.title.includes('Season ') ? 'series' : 'title'});
  }
  title.appearances = [...original.values()].sort((a,b) => (a.billingOrder ?? 0)-(b.billingOrder ?? 0));
}

const appearanceTitles = new Map();
for (const title of titles) for (const appearance of title.appearances) {
  if (!appearanceTitles.has(appearance.characterId)) appearanceTitles.set(appearance.characterId,[]);
  appearanceTitles.get(appearance.characterId).push({title,appearance});
}
const roleWeight = {lead:5,major:4,supporting:3,minor:2,cameo:1};
const characters = [...appearanceTitles.entries()].map(([id,entries]) => {
  entries.sort((a,b) => a.title.releaseDate.localeCompare(b.title.releaseDate));
  const existing = knownById.get(id) ?? {};
  const curatedNames = curatedIdentities[id] ?? [];
  const creditedNames = [...(characterNames.get(id) ?? [])];
  const name = existing.name ?? curatedNames[0] ?? creditedNames[0] ?? id.replaceAll('-',' ');
  const aliases = [...new Set([...(existing.aliases ?? []),...curatedNames,...creditedNames].filter((item) => item !== name))].sort();
  const universeIds = [...new Set(entries.flatMap(({title}) => title.universeIds))];
  const primaryRole = entries.map(({appearance}) => appearance.role).sort((a,b) => roleWeight[b]-roleWeight[a])[0];
  const first = entries[0].title;
  const latest = entries.at(-1).title;
  const aliasCopy = aliases.length ? ` Also credited as ${aliases.slice(0,3).join(', ')}.` : '';
  const description = `${name} appears in ${entries.length} ${entries.length === 1 ? 'catalog title' : 'catalog titles'}, beginning with ${first.title} (${first.releaseDate.slice(0,4)})${latest.id !== first.id ? ` and most recently ${latest.title} (${latest.releaseDate.slice(0,4)})` : ''}.${aliasCopy} The archive classifies the character’s highest recorded story role as ${primaryRole}.`;
  return {...existing,id,name,aliases,description,descriptionSource:'ai-assisted',universeIds,appearanceCount:entries.length,firstAppearanceId:first.id,latestAppearanceId:latest.id,primaryRole,comicOrigin:curatedIdentities[id] || knownById.has(id) ? 'confirmed' : 'probable',profileConfidence:curatedIdentities[id] || knownById.has(id) ? 'curated' : 'inferred',sourceIds:['imdb-non-commercial'],performerIds:[...(characterNconsts.get(id) ?? [])]};
}).sort((a,b) => a.name.localeCompare(b.name));

writeFileSync(resolve(dataRoot,'titles.json'),`${JSON.stringify(titles,null,2)}\n`);
writeFileSync(resolve(dataRoot,'characters.json'),`${JSON.stringify(characters,null,2)}\n`);
const appearances = titles.flatMap((title) => title.appearances.map((appearance,index) => ({id:`${title.id}:${appearance.characterId}:${index}`,titleId:title.id,...appearance})));
writeFileSync(resolve(dataRoot,'appearances.json'),`${JSON.stringify(appearances,null,2)}\n`);
console.log(JSON.stringify({imdbDirect:imdbByTitle.size,appleDirect:titles.filter((title) => title.links.some((link) => link.provider === 'Apple TV' && link.resolution === 'direct')).length,amazonDirect:titles.filter((title) => title.links.some((link) => link.provider === 'Amazon Prime Video' && link.resolution === 'direct')).length,disneyDirect:titles.filter((title) => title.links.some((link) => link.provider === 'Disney+' && link.resolution === 'direct')).length,characters:characters.length,appearances:appearances.length,theaterLinks:titles.filter((title) => title.links.some((link) => link.kind === 'theater')).length},null,2));
