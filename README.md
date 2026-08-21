# Marvel Archive

Marvel Archive is a public, browser-only screen chronology explorer and open JSON dataset. It currently indexes 191 feature films, television series, specials, shorts, serials, and major animated releases across nine continuity groups.

## What it does

- Instant local search by title, character, alias, or editorial description
- Shareable URL state for search, universe, saga, phase, format, and ordering
- Context-aware universe, saga, and phase filters with unavailable branches disabled
- Fast button controls for format and release-date, universe-timeline, or alphabetical order
- Short context blurbs for universes, sagas, phases, story arcs, and collections
- A distinct, clearly labeled AI-assisted editorial description for every catalog title
- Ordered collections for trilogies, sagas, teams, and series
- More than 1,400 character profiles and 2,300 classified appearances, with `lead`, `major`, `supporting`, `minor`, and `cameo` roles
- AI-assisted character summaries, aliases, continuity membership, first/latest appearances, and clearly labeled inference confidence
- Direct IMDb links for every title plus direct Apple TV and Disney+ destinations wherever stable public IDs exist
- Honest search fallbacks where a provider—especially Amazon—does not expose a reusable public ID
- Keyless, location-aware Google Maps theater discovery for announced films
- PWA installability, Angular service-worker caching, and IndexedDB fallback
- Versioned entity files and JSON Schemas under `public/data`

The MCU hierarchy is modeled explicitly as **Saga → Phase → Title**. The Infinity Saga contains Phases One–Three; the current Multiverse Saga contains Phases Four–Six. *Avengers: Doomsday* is a Phase Six culmination title, not the name of the saga.

## Technology

Angular 22 standalone components, signals, strict TypeScript, Tailwind CSS 4, native IndexedDB, and an offline-first service worker. There is no application backend.

Production builds run Angular's library linker before bundling, emit content-fingerprinted JavaScript and CSS, and use network-first navigation caching so a deployment cannot be shadowed by an obsolete application shell.

## Local development

Use Node 22.22.3 or newer (the workflow uses Node 24), install dependencies, then run `npm run dev`. Run the core unit suite with `npm test`; a production bundle is created with `npm run build`.

The public repository runs both tests and the production build in GitHub Actions for every push and pull request. It uses one standard Ubuntu runner, which is free for public repositories, and does not upload paid artifacts.

## Data maintenance

`scripts/expand-catalog.mjs` expands catalog-level coverage, generates labeled editorial descriptions, and derives release navigation. `scripts/enrich-catalog-data.mjs` consumes IMDb's `title.basics.tsv.gz` and `title.principals.tsv.gz`, resolves public Wikidata identifiers, expands characters, classifies appearances, and replaces search links with direct destinations when possible. `scripts/derive-entities.mjs` materializes relation files. See [DATA_MODEL.md](DATA_MODEL.md) for entity and versioning decisions.

To reproduce the enrichment, download IMDb's daily non-commercial files into `work/imdb`, then run `npm run enrich:data`. The large source files are intentionally excluded from the repository. IMDb-derived fields remain subject to IMDb's non-commercial dataset terms.

The original metadata is available under CC BY 4.0. IMDb-derived data is used under IMDb's non-commercial dataset terms. Linked names, trademarks, artwork, and third-party data remain subject to their respective owners and terms. This is an independent reference project and is not affiliated with Marvel.
