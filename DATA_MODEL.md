# Marvel Archive data model

The browser loads versioned JSON documents, then mirrors the primary entity sets into IndexedDB. JSON remains the portable source of truth; IndexedDB is a device-local performance and offline cache.

## Core entities

- `titles`: films, series, specials, and shorts. Holds release chronology, continuity chronology, external links, appearances, credit scenes, and data-quality state.
- `universes`: a continuity graph. `parentUniverseId` represents a branch or nested continuity; `continuityType` distinguishes a primary universe, branch, reboot, or adjacent continuity.
- `sagas`: named story arcs inside a universe, such as the Infinity Saga or an X-Men timeline.
- `collections`: ordered title groups, including trilogies, character series, teams, and studio eras.
- `characters`: canonical character identity, aliases, and public reference/artwork links.
- `appearances`: a derived many-to-many relation between titles and characters, with `lead`, `supporting`, or `cameo` role.
- `credit-scenes`: a derived title relation with position, count, spoiler level, and summary.
- `sources`: public provenance used to verify dates, identifiers, availability, and official links.

Every relation uses stable string IDs instead of nesting copies. Derived previous/next links are materialized in `titles.json` so a static client can navigate without recomputing the full graph.

## Versioning

`metadata.json` declares separate semantic versions for the dataset and schema. A content-only correction increments the dataset patch version. Backward-compatible fields increment the schema minor version; breaking shape changes increment its major version.

Records marked `verified-core` contain editorially checked detail. `catalog` records establish coverage and public links while richer appearances, artwork, storefronts, and credit-scene metadata await source-level verification.
