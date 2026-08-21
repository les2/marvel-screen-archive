export type MediaType = 'film' | 'series' | 'special' | 'short';
export type RoleType = 'lead' | 'major' | 'supporting' | 'minor' | 'cameo';
export interface EntityRef { id: string; label?: string; }
export interface ExternalLink { provider: string; url: string; kind: 'official' | 'stream' | 'purchase' | 'artwork' | 'reference' | 'theater'; canonical?: boolean; region?: string; resolution?: 'direct' | 'search' | 'live-search'; sourceId?: string; lastVerified?: string; }
export interface CreditScene { position: 'mid' | 'post' | 'tag'; count: number; summary: string; spoilerLevel: 'light' | 'full'; }
export interface TitleRecord {
  id:string; title:string; mediaType:MediaType; releaseDate:string; status:'released'|'announced'; synopsis:string;
  universeIds:string[]; sagaIds:string[]; collectionIds:string[]; releaseOrder:number; timelineOrder?:number; timelineYear?:string;
  previousByRelease?:EntityRef; nextByRelease?:EntityRef; previousInTimeline?:EntityRef; nextInTimeline?:EntityRef;
  appearances:Array<{characterId:string;role:RoleType;billingOrder?:number;roleConfidence?:'verified'|'inferred';sourceId?:string;sourceScope?:'title'|'series'}>; creditScenes:CreditScene[]; links:ExternalLink[]; searchAliases?:string[];
  dataQuality?: 'verified-core' | 'catalog';
  editorialDescription?: string;
  descriptionSource?: 'ai-assisted';
  collectionNavigation?: Array<{collectionId:string;position:number;previousId?:string;nextId?:string}>;
  phaseId?: string;
  arcIds?: string[];
  isSagaCulmination?: boolean;
  externalIds?: Record<string,string>;
}
export interface Universe { id:string; name:string; shortName:string; color:string; description:string; parentUniverseId?:string; continuityType:'primary'|'branch'|'reboot'|'adjacent'; }
export interface Character { id:string; name:string; aliases:string[]; description?:string; descriptionSource?:'ai-assisted'; universeIds?:string[]; appearanceCount?:number; firstAppearanceId?:string; latestAppearanceId?:string; primaryRole?:RoleType; comicOrigin?:'confirmed'|'probable'|'screen-original'|'unclassified'; profileConfidence?:'curated'|'inferred'; sourceIds?:string[]; performerIds?:string[]; officialUrl?:string; wikipediaUrl?:string; artworkUrl?:string; }
export interface Collection { id:string; name:string; kind:'trilogy'|'series'|'saga'|'team'|'studio-era'; titleIds:string[]; description?:string; }
export interface Saga { id:string; name:string; universeId:string; phases?:number[]; description:string; }
export interface Phase { id:string; name:string; number:number; sagaId:string; status:'completed'|'current'|'announced'; startDate:string; endDate?:string; description:string; }
export interface StoryArc { id:string; name:string; sagaId:string; description:string; }
export type WatchGuidePriority = 'studio-pick' | 'archive-bonus';
export interface WatchGuideItem {
  titleId:string;
  order:number;
  priority:WatchGuidePriority;
  rationale:string;
  estimatedMinutes:number;
  runtimeLabel:string;
  selectionNote?:string;
  countsTowardCoreRuntime:boolean;
  watchSearchUrl:string;
}
export interface WatchGuideSection {
  id:string;
  name:string;
  description:string;
  items:WatchGuideItem[];
}
export interface WatchGuide {
  id:string;
  targetTitleId:string;
  name:string;
  eyebrow:string;
  description:string;
  version:string;
  updatedAt:string;
  status:'featured'|'published';
  estimatedCoreMinutes:number;
  sourceLinks:Array<{sourceId:string;label:string;url:string}>;
  sections:WatchGuideSection[];
}
