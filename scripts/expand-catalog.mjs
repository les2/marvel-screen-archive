import { readFileSync, writeFileSync } from 'node:fs';

const path = new URL('../public/data/titles.json', import.meta.url);
const detailed = JSON.parse(readFileSync(path, 'utf8'));
const collections = JSON.parse(readFileSync(new URL('../public/data/collections.json', import.meta.url), 'utf8'));
const rows = [
  // MCU films and specials
  ['thor-dark-world','Thor: The Dark World','film','2013-11-08','mcu-616'],['captain-america-winter-soldier','Captain America: The Winter Soldier','film','2014-04-04','mcu-616'],
  ['guardians-galaxy','Guardians of the Galaxy','film','2014-08-01','mcu-616'],['avengers-age-ultron','Avengers: Age of Ultron','film','2015-05-01','mcu-616'],['ant-man','Ant-Man','film','2015-07-17','mcu-616'],
  ['captain-america-civil-war','Captain America: Civil War','film','2016-05-06','mcu-616'],['doctor-strange','Doctor Strange','film','2016-11-04','mcu-616'],['guardians-galaxy-2','Guardians of the Galaxy Vol. 2','film','2017-05-05','mcu-616'],
  ['spider-man-homecoming','Spider-Man: Homecoming','film','2017-07-07','mcu-616'],['thor-ragnarok','Thor: Ragnarok','film','2017-11-03','mcu-616'],['black-panther','Black Panther','film','2018-02-16','mcu-616'],
  ['ant-man-wasp','Ant-Man and the Wasp','film','2018-07-06','mcu-616'],['spider-man-far-from-home','Spider-Man: Far From Home','film','2019-07-02','mcu-616'],['black-widow','Black Widow','film','2021-07-09','mcu-616'],
  ['shang-chi','Shang-Chi and the Legend of the Ten Rings','film','2021-09-03','mcu-616'],['eternals','Eternals','film','2021-11-05','mcu-616'],['spider-man-no-way-home','Spider-Man: No Way Home','film','2021-12-17','mcu-616'],
  ['doctor-strange-multiverse','Doctor Strange in the Multiverse of Madness','film','2022-05-06','mcu-616'],['thor-love-thunder','Thor: Love and Thunder','film','2022-07-08','mcu-616'],['black-panther-wakanda-forever','Black Panther: Wakanda Forever','film','2022-11-11','mcu-616'],
  ['ant-man-quantumania','Ant-Man and the Wasp: Quantumania','film','2023-02-17','mcu-616'],['guardians-galaxy-3','Guardians of the Galaxy Vol. 3','film','2023-05-05','mcu-616'],['the-marvels','The Marvels','film','2023-11-10','mcu-616'],
  ['deadpool-wolverine','Deadpool & Wolverine','film','2024-07-26','mcu-616'],['captain-america-brave-new-world','Captain America: Brave New World','film','2025-02-14','mcu-616'],['thunderbolts','Thunderbolts*','film','2025-05-02','mcu-616'],
  ['fantastic-four-first-steps','The Fantastic Four: First Steps','film','2025-07-25','mcu-616'],['spider-man-brand-new-day','Spider-Man: Brand New Day','film','2026-07-31','mcu-616','announced'],['avengers-doomsday','Avengers: Doomsday','film','2026-12-18','mcu-616','announced'],
  ['avengers-secret-wars','Avengers: Secret Wars','film','2027-12-17','mcu-616','announced'],['werewolf-by-night','Werewolf by Night','special','2022-10-07','mcu-616'],['guardians-holiday-special','The Guardians of the Galaxy Holiday Special','special','2022-11-25','mcu-616'],
  // Marvel Studios series
  ['falcon-winter-soldier','The Falcon and the Winter Soldier','series','2021-03-19','mcu-616'],['what-if-s1','What If...? — Season 1','series','2021-08-11','mcu-616'],['hawkeye','Hawkeye','series','2021-11-24','mcu-616'],
  ['moon-knight','Moon Knight','series','2022-03-30','mcu-616'],['ms-marvel','Ms. Marvel','series','2022-06-08','mcu-616'],['i-am-groot-s1','I Am Groot — Season 1','short','2022-08-10','mcu-616'],['she-hulk','She-Hulk: Attorney at Law','series','2022-08-18','mcu-616'],
  ['secret-invasion','Secret Invasion','series','2023-06-21','mcu-616'],['i-am-groot-s2','I Am Groot — Season 2','short','2023-09-06','mcu-616'],['loki-s2','Loki — Season 2','series','2023-10-05','mcu-616'],['what-if-s2','What If...? — Season 2','series','2023-12-22','mcu-616'],
  ['echo','Echo','series','2024-01-09','mcu-616'],['agatha-all-along','Agatha All Along','series','2024-09-18','mcu-616'],['what-if-s3','What If...? — Season 3','series','2024-12-22','mcu-616'],['your-friendly-neighborhood-spider-man','Your Friendly Neighborhood Spider-Man — Season 1','series','2025-01-29','mcu-616'],
  ['daredevil-born-again-s1','Daredevil: Born Again — Season 1','series','2025-03-04','mcu-616'],['ironheart','Ironheart','series','2025-06-24','mcu-616'],['eyes-of-wakanda','Eyes of Wakanda','series','2025-08-01','mcu-616'],['marvel-zombies','Marvel Zombies','series','2025-09-24','mcu-616'],
  ['wonder-man','Wonder Man — Season 1','series','2026-01-27','mcu-616'],['daredevil-born-again-s2','Daredevil: Born Again — Season 2','series','2026-03-24','mcu-616'],['punisher-one-last-kill','The Punisher: One Last Kill','special','2026-05-12','mcu-616'],['visionquest','VisionQuest','series','2026-10-14','mcu-616','announced'],
  // Fox X-Men continuity
  ['x-men','X-Men','film','2000-07-14','fox-xmen'],['x2','X2: X-Men United','film','2003-05-02','fox-xmen'],['x-men-last-stand','X-Men: The Last Stand','film','2006-05-26','fox-xmen'],['x-men-origins-wolverine','X-Men Origins: Wolverine','film','2009-05-01','fox-xmen'],
  ['x-men-first-class','X-Men: First Class','film','2011-06-03','fox-xmen'],['the-wolverine','The Wolverine','film','2013-07-26','fox-xmen'],['x-men-days-future-past','X-Men: Days of Future Past','film','2014-05-23','fox-xmen'],['deadpool','Deadpool','film','2016-02-12','fox-xmen'],
  ['x-men-apocalypse','X-Men: Apocalypse','film','2016-05-27','fox-xmen'],['logan-film','Logan','film','2017-03-03','fox-xmen'],['deadpool-2','Deadpool 2','film','2018-05-18','fox-xmen'],['dark-phoenix','Dark Phoenix','film','2019-06-07','fox-xmen'],['new-mutants','The New Mutants','film','2020-08-28','fox-xmen'],
  ['legion','Legion','series','2017-02-08','fox-xmen'],['the-gifted','The Gifted','series','2017-10-02','fox-xmen'],['x-men-97','X-Men ’97 — Season 1','series','2024-03-20','fox-xmen'],
  // Spider-Man screen universes
  ['spider-man-2002','Spider-Man','film','2002-05-03','sony-raimi'],['spider-man-2','Spider-Man 2','film','2004-06-30','sony-raimi'],['spider-man-3','Spider-Man 3','film','2007-05-04','sony-raimi'],
  ['amazing-spider-man','The Amazing Spider-Man','film','2012-07-03','sony-amazing'],['amazing-spider-man-2','The Amazing Spider-Man 2','film','2014-05-02','sony-amazing'],
  ['venom','Venom','film','2018-10-05','sony-ssu'],['venom-let-there-be-carnage','Venom: Let There Be Carnage','film','2021-10-01','sony-ssu'],['morbius','Morbius','film','2022-04-01','sony-ssu'],['madame-web','Madame Web','film','2024-02-14','sony-ssu'],['venom-last-dance','Venom: The Last Dance','film','2024-10-25','sony-ssu'],['kraven-hunter','Kraven the Hunter','film','2024-12-13','sony-ssu'],
  ['into-spider-verse','Spider-Man: Into the Spider-Verse','film','2018-12-14','spider-verse'],['across-spider-verse','Spider-Man: Across the Spider-Verse','film','2023-06-02','spider-verse'],['beyond-spider-verse','Spider-Man: Beyond the Spider-Verse','film','2027-06-25','spider-verse','announced'],
  // Marvel Television legacy
  ['agents-of-shield','Marvel’s Agents of S.H.I.E.L.D.','series','2013-09-24','marvel-television'],['agent-carter','Marvel’s Agent Carter','series','2015-01-06','marvel-television'],['daredevil','Marvel’s Daredevil','series','2015-04-10','marvel-television'],['jessica-jones','Marvel’s Jessica Jones','series','2015-11-20','marvel-television'],
  ['luke-cage','Marvel’s Luke Cage','series','2016-09-30','marvel-television'],['iron-fist','Marvel’s Iron Fist','series','2017-03-17','marvel-television'],['defenders','Marvel’s The Defenders','series','2017-08-18','marvel-television'],['inhumans','Marvel’s Inhumans','series','2017-09-29','marvel-television'],
  ['punisher','Marvel’s The Punisher','series','2017-11-17','marvel-television'],['runaways','Marvel’s Runaways','series','2017-11-21','marvel-television'],['cloak-dagger','Marvel’s Cloak & Dagger','series','2018-06-07','marvel-television'],['helstrom','Helstrom','series','2020-10-16','marvel-television'],
  ['modok','Marvel’s M.O.D.O.K.','series','2021-05-21','marvel-television'],['hit-monkey','Marvel’s Hit-Monkey','series','2021-11-17','marvel-television'],
  // Legacy feature films and television
  ['howard-duck','Howard the Duck','film','1986-08-01','legacy-films'],['punisher-1989','The Punisher','film','1989-10-05','legacy-films'],['captain-america-1990','Captain America','film','1990-12-14','legacy-films'],['fantastic-four-1994','The Fantastic Four','film','1994-05-31','legacy-films'],
  ['blade','Blade','film','1998-08-21','legacy-films'],['blade-2','Blade II','film','2002-03-22','legacy-films'],['daredevil-2003','Daredevil','film','2003-02-14','legacy-films'],['hulk-2003','Hulk','film','2003-06-20','legacy-films'],['punisher-2004','The Punisher','film','2004-04-16','legacy-films'],
  ['blade-trinity','Blade: Trinity','film','2004-12-08','legacy-films'],['elektra','Elektra','film','2005-01-14','legacy-films'],['fantastic-four-2005','Fantastic Four','film','2005-07-08','legacy-films'],['ghost-rider','Ghost Rider','film','2007-02-16','legacy-films'],['fantastic-four-silver-surfer','Fantastic Four: Rise of the Silver Surfer','film','2007-06-15','legacy-films'],
  ['punisher-war-zone','Punisher: War Zone','film','2008-12-05','legacy-films'],['ghost-rider-vengeance','Ghost Rider: Spirit of Vengeance','film','2012-02-17','legacy-films'],['fant4stic','Fantastic Four','film','2015-08-07','legacy-films'],
  ['mutant-x','Mutant X','series','2001-10-06','legacy-films'],['blade-series','Blade: The Series','series','2006-06-28','legacy-films'],
  // Major animated television eras
  ['x-men-animated','X-Men: The Animated Series','series','1992-10-31','legacy-films'],['spider-man-animated-1994','Spider-Man: The Animated Series','series','1994-11-19','legacy-films'],['fantastic-four-animated-1994','Fantastic Four','series','1994-09-24','legacy-films'],['iron-man-animated','Iron Man','series','1994-09-24','legacy-films'],
  ['silver-surfer-series','Silver Surfer','series','1998-02-07','legacy-films'],['spider-man-unlimited','Spider-Man Unlimited','series','1999-10-02','legacy-films'],['x-men-evolution','X-Men: Evolution','series','2000-11-04','legacy-films'],['spectacular-spider-man','The Spectacular Spider-Man','series','2008-03-08','legacy-films'],
  ['wolverine-xmen','Wolverine and the X-Men','series','2009-01-23','legacy-films'],['avengers-earths-mightiest-heroes','The Avengers: Earth’s Mightiest Heroes','series','2010-10-20','legacy-films'],['ultimate-spider-man','Ultimate Spider-Man','series','2012-04-01','legacy-films'],['avengers-assemble','Avengers Assemble','series','2013-05-26','legacy-films'],
  ['hulk-agents-smash','Hulk and the Agents of S.M.A.S.H.','series','2013-08-11','legacy-films'],['guardians-animated','Marvel’s Guardians of the Galaxy','series','2015-09-26','legacy-films'],['spider-man-2017','Marvel’s Spider-Man','series','2017-08-19','legacy-films'],['moon-girl-devil-dinosaur','Moon Girl and Devil Dinosaur','series','2023-02-10','legacy-films'],
  // Historical serials, television films, and additional animation
  ['captain-america-serial','Captain America','series','1944-02-05','legacy-films'],['marvel-super-heroes','The Marvel Super Heroes','series','1966-09-01','legacy-films'],['fantastic-four-1967','Fantastic Four','series','1967-09-09','legacy-films'],['spider-man-1967','Spider-Man','series','1967-09-09','legacy-films'],
  ['incredible-hulk-tv','The Incredible Hulk','series','1977-11-04','legacy-films'],['amazing-spider-man-tv','The Amazing Spider-Man','series','1977-09-14','legacy-films'],['doctor-strange-1978','Dr. Strange','film','1978-09-06','legacy-films'],['spider-man-japan','Spider-Man','series','1978-05-17','legacy-films'],['new-fantastic-four','The New Fantastic Four','series','1978-09-09','legacy-films'],
  ['captain-america-tv','Captain America','film','1979-01-19','legacy-films'],['captain-america-2-death-too-soon','Captain America II: Death Too Soon','film','1979-11-23','legacy-films'],['spider-woman-1979','Spider-Woman','series','1979-09-22','legacy-films'],['spider-man-1981','Spider-Man','series','1981-09-12','legacy-films'],['spider-man-amazing-friends','Spider-Man and His Amazing Friends','series','1981-09-12','legacy-films'],['incredible-hulk-1982','The Incredible Hulk','series','1982-09-18','legacy-films'],
  ['pryde-xmen','Pryde of the X-Men','film','1989-09-16','legacy-films'],['trial-incredible-hulk','The Trial of the Incredible Hulk','film','1989-05-07','legacy-films'],['death-incredible-hulk','The Death of the Incredible Hulk','film','1990-02-18','legacy-films'],['generation-x','Generation X','film','1996-02-20','legacy-films'],['nick-fury-agent-shield','Nick Fury: Agent of S.H.I.E.L.D.','film','1998-05-26','legacy-films'],
  ['avengers-united-they-stand','The Avengers: United They Stand','series','1999-10-30','legacy-films'],['spider-man-new-animated','Spider-Man: The New Animated Series','series','2003-07-11','legacy-films'],['fantastic-four-worlds-greatest','Fantastic Four: World’s Greatest Heroes','series','2006-09-02','legacy-films'],['iron-man-armored-adventures','Iron Man: Armored Adventures','series','2009-04-24','legacy-films'],['super-hero-squad','The Super Hero Squad Show','series','2009-09-14','legacy-films'],
  ['ultimate-avengers','Ultimate Avengers: The Movie','film','2006-02-21','legacy-films'],['ultimate-avengers-2','Ultimate Avengers 2: Rise of the Panther','film','2006-08-08','legacy-films'],['invincible-iron-man','The Invincible Iron Man','film','2007-01-23','legacy-films'],['doctor-strange-animated','Doctor Strange: The Sorcerer Supreme','film','2007-08-14','legacy-films'],['next-avengers','Next Avengers: Heroes of Tomorrow','film','2008-09-02','legacy-films'],['hulk-vs','Hulk Vs.','film','2009-01-27','legacy-films'],['planet-hulk','Planet Hulk','film','2010-02-02','legacy-films'],['thor-tales-asgard','Thor: Tales of Asgard','film','2011-05-17','legacy-films'],
  ['iron-man-rise-technovore','Iron Man: Rise of Technovore','film','2013-04-16','legacy-films'],['avengers-confidential','Avengers Confidential: Black Widow & Punisher','film','2014-03-25','legacy-films'],['big-hero-6','Big Hero 6','film','2014-11-07','legacy-films'],['hulk-where-monsters-dwell','Hulk: Where Monsters Dwell','film','2016-10-21','legacy-films'],
  ['iron-man-anime','Marvel Anime: Iron Man','series','2010-10-01','legacy-films'],['wolverine-anime','Marvel Anime: Wolverine','series','2011-01-07','legacy-films'],['x-men-anime','Marvel Anime: X-Men','series','2011-04-01','legacy-films'],['blade-anime','Marvel Anime: Blade','series','2011-07-01','legacy-films'],['disk-wars-avengers','Marvel Disk Wars: The Avengers','series','2014-04-02','legacy-films'],['future-avengers','Marvel Future Avengers','series','2017-07-22','legacy-films'],
  ['spidey-amazing-friends','Spidey and His Amazing Friends','series','2021-08-06','legacy-films'],['hit-monkey-s2','Marvel’s Hit-Monkey — Season 2','series','2024-07-15','marvel-television']
];

const existing = new Set(detailed.map((title) => title.id));
const compact = rows.filter(([id]) => !existing.has(id)).map(([id,title,mediaType,releaseDate,universeId,status='released']) => {
  const encoded = encodeURIComponent(title);
  const isMarvelOwned = universeId === 'mcu-616' || universeId === 'marvel-television';
  return {
    id,title,mediaType,releaseDate,status,
    synopsis:`A ${mediaType} entry in the ${universeId.replaceAll('-', ' ')} screen catalog. Detailed editorial metadata is queued for verification.`,
    universeIds:[universeId],sagaIds:[],collectionIds:[],releaseOrder:0,
    appearances:[],creditScenes:[],
    links:[
      ...(isMarvelOwned ? [{provider:'Marvel',url:`https://www.marvel.com/search?limit=20&query=${encoded}`,kind:'official'}] : []),
      ...(isMarvelOwned ? [{provider:'Disney+',url:`https://www.disneyplus.com/search?q=${encoded}`,kind:'stream',canonical:true}] : []),
      {provider:'IMDb',url:`https://www.imdb.com/find/?q=${encoded}&s=tt`,kind:'reference'}
    ],
    dataQuality:'catalog'
  };
});

const all = [...detailed.map((title) => ({dataQuality:'verified-core', ...title})), ...compact]
  .sort((a,b) => a.releaseDate.localeCompare(b.releaseDate) || a.title.localeCompare(b.title));

// MCU phase membership is explicit source data. Saga membership is derived from
// the phase so pre-Endgame titles can never drift into the Multiverse Saga.
const phaseMembership = {
  'mcu-phase-1':['iron-man','incredible-hulk','iron-man-2','thor','captain-america-first-avenger','avengers'],
  'mcu-phase-2':['iron-man-3','thor-dark-world','captain-america-winter-soldier','guardians-galaxy','avengers-age-ultron','ant-man'],
  'mcu-phase-3':['captain-america-civil-war','doctor-strange','guardians-galaxy-2','spider-man-homecoming','thor-ragnarok','black-panther','avengers-infinity-war','ant-man-wasp','captain-marvel','avengers-endgame','spider-man-far-from-home'],
  'mcu-phase-4':['wandavision','falcon-winter-soldier','loki-s1','black-widow','what-if-s1','shang-chi','eternals','hawkeye','spider-man-no-way-home','moon-knight','doctor-strange-multiverse','ms-marvel','thor-love-thunder','i-am-groot-s1','she-hulk','werewolf-by-night','black-panther-wakanda-forever','guardians-holiday-special'],
  'mcu-phase-5':['ant-man-quantumania','guardians-galaxy-3','secret-invasion','i-am-groot-s2','loki-s2','the-marvels','what-if-s2','echo','deadpool-wolverine','agatha-all-along','what-if-s3','your-friendly-neighborhood-spider-man','captain-america-brave-new-world','daredevil-born-again-s1','thunderbolts','ironheart'],
  'mcu-phase-6':['fantastic-four-first-steps','eyes-of-wakanda','marvel-zombies','wonder-man','daredevil-born-again-s2','punisher-one-last-kill','spider-man-brand-new-day','visionquest','avengers-doomsday','avengers-secret-wars']
};
const titleById = new Map(all.map((title) => [title.id, title]));
Object.entries(phaseMembership).forEach(([phaseId,titleIds],phaseIndex) => {
  const sagaId = phaseIndex < 3 ? 'infinity-saga' : 'multiverse-saga';
  for (const id of titleIds) {
    const title = titleById.get(id);
    if (!title) throw new Error(`Unknown MCU title in ${phaseId}: ${id}`);
    title.phaseId = phaseId;
    title.sagaIds = [sagaId];
    title.arcIds = [];
  }
});
const arcMembership = {
  'infinity-stones': [...phaseMembership['mcu-phase-1'], ...phaseMembership['mcu-phase-2'], ...phaseMembership['mcu-phase-3']],
  'thanos-endgame':['avengers-infinity-war','ant-man-wasp','captain-marvel','avengers-endgame'],
  'multiverse-incursions':['loki-s1','what-if-s1','spider-man-no-way-home','doctor-strange-multiverse','ant-man-quantumania','loki-s2','deadpool-wolverine','fantastic-four-first-steps','avengers-doomsday','avengers-secret-wars'],
  'doomsday-secret-wars':['fantastic-four-first-steps','spider-man-brand-new-day','visionquest','avengers-doomsday','avengers-secret-wars']
};
for (const [arcId,titleIds] of Object.entries(arcMembership)) {
  for (const id of titleIds) {
    const title = titleById.get(id);
    if (title) title.arcIds = [...new Set([...(title.arcIds ?? []), arcId])];
  }
}
for (const id of ['avengers-endgame','avengers-doomsday','avengers-secret-wars']) {
  const title = titleById.get(id);
  if (title) title.isSagaCulmination = true;
}
const mcuTimeline = [
  'captain-america-first-avenger','captain-marvel','iron-man','iron-man-2','thor','incredible-hulk','avengers','thor-dark-world','iron-man-3','captain-america-winter-soldier','guardians-galaxy','guardians-galaxy-2','i-am-groot-s1','i-am-groot-s2','avengers-age-ultron','ant-man','captain-america-civil-war','black-widow','black-panther','spider-man-homecoming','doctor-strange','thor-ragnarok','ant-man-wasp','avengers-infinity-war','avengers-endgame','loki-s1','what-if-s1','wandavision','shang-chi','falcon-winter-soldier','spider-man-far-from-home','eternals','spider-man-no-way-home','doctor-strange-multiverse','hawkeye','moon-knight','black-panther-wakanda-forever','echo','she-hulk','ms-marvel','thor-love-thunder','ironheart','werewolf-by-night','guardians-holiday-special','ant-man-quantumania','guardians-galaxy-3','secret-invasion','the-marvels','deadpool-wolverine','agatha-all-along','captain-america-brave-new-world','daredevil-born-again-s1','thunderbolts','fantastic-four-first-steps'
];
const timelineRank = new Map(mcuTimeline.map((id,index) => [id,index + 1]));
all.forEach((title) => { if (timelineRank.has(title.id)) title.timelineOrder = timelineRank.get(title.id); });
all.forEach((title,index) => {
  title.releaseOrder = index + 1;
  title.previousByRelease = index ? {id:all[index - 1].id} : undefined;
  title.nextByRelease = index < all.length - 1 ? {id:all[index + 1].id} : undefined;
});
all.forEach((title) => {
  const encoded = encodeURIComponent(title.title);
  if (!title.links.some((link) => link.provider === 'Apple TV')) title.links.push({provider:'Apple TV',url:`https://tv.apple.com/search?term=${encoded}`,kind:'purchase'});
  if (!title.links.some((link) => link.provider === 'Amazon')) title.links.push({provider:'Amazon',url:`https://www.amazon.com/s?k=${encoded}&i=instant-video`,kind:'purchase'});
  const official = title.links.find((link) => link.kind === 'official');
  if (official && !title.links.some((link) => link.kind === 'artwork')) title.links.push({provider:'Official artwork',url:official.url,kind:'artwork'});
});
for (const universeId of new Set(all.flatMap((title) => title.universeIds))) {
  const sequence = all.filter((title) => title.universeIds.includes(universeId)).sort((a,b) => (a.timelineOrder ?? 10000) - (b.timelineOrder ?? 10000) || a.releaseDate.localeCompare(b.releaseDate));
  sequence.forEach((title,index) => { title.previousInTimeline = index ? {id:sequence[index - 1].id} : undefined; title.nextInTimeline = index < sequence.length - 1 ? {id:sequence[index + 1].id} : undefined; });
}
all.forEach((title) => { title.collectionNavigation = []; });
for (const collection of collections) {
  collection.titleIds.forEach((id,index) => {
    const title = all.find((item) => item.id === id); if (!title) return;
    title.collectionNavigation ??= [];
    title.collectionNavigation.push({collectionId:collection.id,position:index + 1,previousId:index ? collection.titleIds[index - 1] : undefined,nextId:index < collection.titleIds.length - 1 ? collection.titleIds[index + 1] : undefined});
  });
}
writeFileSync(path, `${JSON.stringify(all, null, 2)}\n`);
console.log(`Catalog expanded to ${all.length} records.`);
