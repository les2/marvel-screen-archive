export type MediaType = 'film' | 'series' | 'special' | 'short';
export type RoleType = 'lead' | 'supporting' | 'cameo';
export interface EntityRef { id: string; label?: string; }
export interface ExternalLink { provider: string; url: string; kind: 'official' | 'stream' | 'purchase' | 'artwork' | 'reference'; canonical?: boolean; region?: string; }
export interface CreditScene { position: 'mid' | 'post' | 'tag'; count: number; summary: string; spoilerLevel: 'light' | 'full'; }
export interface TitleRecord {
  id:string; title:string; mediaType:MediaType; releaseDate:string; status:'released'|'announced'; synopsis:string;
  universeIds:string[]; sagaIds:string[]; collectionIds:string[]; releaseOrder:number; timelineOrder?:number; timelineYear?:string;
  previousByRelease?:EntityRef; nextByRelease?:EntityRef; previousInTimeline?:EntityRef; nextInTimeline?:EntityRef;
  appearances:Array<{characterId:string;role:RoleType}>; creditScenes:CreditScene[]; links:ExternalLink[]; searchAliases?:string[];
  dataQuality?: 'verified-core' | 'catalog';
  collectionNavigation?: Array<{collectionId:string;position:number;previousId?:string;nextId?:string}>;
}
export interface Universe { id:string; name:string; shortName:string; color:string; description:string; parentUniverseId?:string; continuityType:'primary'|'branch'|'reboot'|'adjacent'; }
export interface Character { id:string; name:string; aliases:string[]; officialUrl?:string; wikipediaUrl?:string; artworkUrl?:string; }
export interface Collection { id:string; name:string; kind:'trilogy'|'series'|'saga'|'team'|'studio-era'; titleIds:string[]; }
