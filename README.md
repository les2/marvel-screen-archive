# Marvel Archive

Marvel Archive is a public, browser-only screen chronology explorer and open JSON dataset. It currently indexes 191 feature films, television series, specials, shorts, serials, and major animated releases across nine continuity groups.

## What it does

- Instant local search by title, character, or alias
- Filters by screen universe and format
- Release-date, universe-timeline, and alphabetical order
- Ordered collections for trilogies, sagas, teams, and series
- Character roles (`lead`, `supporting`, `cameo`) and credit-scene metadata
- Official, Disney+, IMDb, artwork, and purchase-link slots
- PWA installability, Angular service-worker caching, and IndexedDB fallback
- Versioned entity files and JSON Schemas under `public/data`

## Technology

Angular 22 standalone components, signals, strict TypeScript, Tailwind CSS 4, native IndexedDB, and an offline-first service worker. There is no application backend.

## Local development

Use Node 22.22.3 or newer, install dependencies, then run `npm run dev`. A production bundle is created with `npm run build`.

## Data maintenance

`scripts/expand-catalog.mjs` expands catalog-level coverage and derives release navigation. `scripts/derive-entities.mjs` materializes the appearance and credit-scene relation files. See [DATA_MODEL.md](DATA_MODEL.md) for entity and versioning decisions.

The original metadata is available under CC BY 4.0. Linked names, trademarks, artwork, and third-party data remain subject to their respective owners and terms. This is an independent reference project and is not affiliated with Marvel.
