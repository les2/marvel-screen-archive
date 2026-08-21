# Marvel Archive data model

The browser loads versioned JSON documents, then mirrors the primary entity sets into IndexedDB. JSON remains the portable source of truth; IndexedDB is a device-local performance and offline cache.

## Core entities

- `titles`: films, series, specials, and shorts. Holds release chronology, continuity chronology, external links, appearances, credit scenes, data-quality state, and a labeled AI-assisted editorial description.
- `universes`: a continuity graph. `parentUniverseId` represents a branch or nested continuity; `continuityType` distinguishes a primary universe, branch, reboot, or adjacent continuity.
- `sagas`: top-level eras inside a universe. For the MCU, the Infinity Saga contains Phases One–Three and the Multiverse Saga contains Phases Four–Six.
- `phases`: numbered release-program groups that belong to a saga. Phase Six is the current phase of the Multiverse Saga.
- `story-arcs`: overlapping thematic paths such as the Infinity Stones, Thanos/Endgame, multiversal incursions, or the road to Doomsday and Secret Wars. These are intentionally separate from official saga and phase membership.
- `collections`: ordered title groups, including trilogies, character series, teams, and studio eras.
- `characters`: canonical or credited screen identity, aliases, continuity membership, first/latest appearance, appearance count, AI-assisted profile, comic-origin confidence, and public reference/artwork links.
- `appearances`: a derived many-to-many relation between titles and characters, with `lead`, `major`, `supporting`, `minor`, or `cameo` role, credited performer order, source scope, and verified/inferred confidence.
- `credit-scenes`: a derived title relation with position, count, spoiler level, and summary.
- `sources`: public provenance used to verify dates, identifiers, availability, and official links.

Every relation uses stable string IDs instead of nesting copies. Derived previous/next links are materialized in `titles.json` so a static client can navigate without recomputing the full graph.

## Character coverage and confidence

IMDb's public non-commercial title and principal-credit files provide stable title IDs, credited character names, and performer order. Curated identity groups merge established aliases such as Tony Stark/Iron Man and Logan/Wolverine; all other identities remain conservative screen-credit records. `comicOrigin` distinguishes confirmed identities from probable comic-derived characters, while `profileConfidence` and each appearance's `roleConfidence` prevent inferred classifications from being presented as editorial fact.

Role inference uses the credited performer's order: the first two performers are `lead`, the next three `major`, the next five `supporting`, and later named roles `minor`; uncredited or archival appearances are `cameo`. Secondary roles played by the same performer default to `minor`. Hand-verified core records override the inference.

## External links and showtimes

Every outbound link declares `resolution`: `direct`, `search`, or `live-search`. IMDb title IDs come from IMDb's dataset. Apple TV, Prime Video, and Disney+ IDs are resolved through Wikidata and formatted with each property's declared URL pattern. Search links remain only when no stable public ID exists and the UI labels them as fallbacks.

Announced films include a `theater` link using Google Maps URLs. This is keyless and lets Google use the visitor's current map area without the archive collecting location. Fully inline showtimes require a licensed provider: MovieGlu offers nearby showtimes and booking deep links, but requires credentials, territory licensing, and a request quota. Amazon affiliate links likewise require the site's owner to enroll in Amazon Associates/Creators API; no affiliate ID is fabricated or embedded.

## MCU era hierarchy

`TitleRecord.phaseId` points to one phase, while `sagaIds` is materialized for direct browser filtering. `arcIds` can contain several overlapping story arcs, and `isSagaCulmination` identifies capstone titles such as *Avengers: Endgame*. The generator derives MCU saga membership from phase membership, preventing Phase One–Three titles from being mislabeled as Multiverse Saga entries.

## Versioning

`metadata.json` declares separate semantic versions for the dataset and schema. A content-only correction increments the dataset patch version. Backward-compatible fields increment the schema minor version; breaking shape changes increment its major version.

Records marked `verified-core` contain editorially checked detail. `catalog` records establish coverage and public links while richer appearances, artwork, storefronts, and credit-scene metadata await source-level verification.

## Browser navigation state

The catalog serializes non-default search state into stable query parameters: `q`, `universe`, `saga`, `phase`, `format`, and `order`. Saga availability is derived from titles in the selected universe; phase availability is derived from both universe and saga. Invalid or incompatible URL values safely fall back to `all`, which keeps copied links durable as the dataset evolves.

`editorialDescription` is display copy generated with AI assistance and is labeled by `descriptionSource: "ai-assisted"`. It does not replace factual provenance or the separately maintained `synopsis` field.
