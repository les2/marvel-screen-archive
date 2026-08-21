# Marvel Archive

Marvel Archive is a public, browser-only screen chronology explorer and open JSON dataset. It currently indexes 191 feature films, television series, specials, shorts, serials, and major animated releases across nine continuity groups.

## What it does

- Instant local search by title, character, or alias
- Filters by screen universe, MCU saga, phase, and format
- Release-date, universe-timeline, and alphabetical order
- Ordered collections for trilogies, sagas, teams, and series
- Character roles (`lead`, `supporting`, `cameo`) and credit-scene metadata
- Official, Disney+, IMDb, artwork, and purchase-link slots
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

`scripts/expand-catalog.mjs` expands catalog-level coverage and derives release navigation. `scripts/derive-entities.mjs` materializes the appearance and credit-scene relation files. See [DATA_MODEL.md](DATA_MODEL.md) for entity and versioning decisions.

The original metadata is available under CC BY 4.0. Linked names, trademarks, artwork, and third-party data remain subject to their respective owners and terms. This is an independent reference project and is not affiliated with Marvel.
