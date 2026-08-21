# Marvel Archive data model

The browser loads versioned JSON documents, then mirrors the primary entity sets into IndexedDB. JSON remains the portable source of truth; IndexedDB is a device-local performance and offline cache.

## Core entities

- `titles`: films, series, specials, and shorts. Holds release chronology, continuity chronology, external links, appearances, credit scenes, data-quality state, and a labeled AI-assisted editorial description.
- `universes`: a continuity graph. `parentUniverseId` represents a branch or nested continuity; `continuityType` distinguishes a primary universe, branch, reboot, or adjacent continuity.
- `sagas`: top-level eras inside a universe. For the MCU, the Infinity Saga contains Phases One–Three and the Multiverse Saga contains Phases Four–Six.
- `phases`: numbered release-program groups that belong to a saga. Phase Six is the current phase of the Multiverse Saga.
- `story-arcs`: overlapping thematic paths such as the Infinity Stones, Thanos/Endgame, multiversal incursions, or the road to Doomsday and Secret Wars. These are intentionally separate from official saga and phase membership.
- `collections`: ordered title groups, including trilogies, character series, teams, and studio eras.
- `characters`: canonical character identity, aliases, and public reference/artwork links.
- `appearances`: a derived many-to-many relation between titles and characters, with `lead`, `supporting`, or `cameo` role.
- `credit-scenes`: a derived title relation with position, count, spoiler level, and summary.
- `sources`: public provenance used to verify dates, identifiers, availability, and official links.

Every relation uses stable string IDs instead of nesting copies. Derived previous/next links are materialized in `titles.json` so a static client can navigate without recomputing the full graph.

## MCU era hierarchy

`TitleRecord.phaseId` points to one phase, while `sagaIds` is materialized for direct browser filtering. `arcIds` can contain several overlapping story arcs, and `isSagaCulmination` identifies capstone titles such as *Avengers: Endgame*. The generator derives MCU saga membership from phase membership, preventing Phase One–Three titles from being mislabeled as Multiverse Saga entries.

## Versioning

`metadata.json` declares separate semantic versions for the dataset and schema. A content-only correction increments the dataset patch version. Backward-compatible fields increment the schema minor version; breaking shape changes increment its major version.

Records marked `verified-core` contain editorially checked detail. `catalog` records establish coverage and public links while richer appearances, artwork, storefronts, and credit-scene metadata await source-level verification.

## Browser navigation state

The catalog serializes non-default search state into stable query parameters: `q`, `universe`, `saga`, `phase`, `format`, and `order`. Saga availability is derived from titles in the selected universe; phase availability is derived from both universe and saga. Invalid or incompatible URL values safely fall back to `all`, which keeps copied links durable as the dataset evolves.

`editorialDescription` is display copy generated with AI assistance and is labeled by `descriptionSource: "ai-assisted"`. It does not replace factual provenance or the separately maintained `synopsis` field.
