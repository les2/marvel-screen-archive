import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Character, Collection, ExternalLink, Phase, RoleType, Saga, StoryArc, TitleRecord, Universe, WatchGuide, WatchGuideItem } from './models';
import { CatalogDataService } from './catalog-data.service';
import { availablePhaseIds, availableSagaIds, compatiblePhaseSelection, filterAndSortTitles, type CatalogSortMode } from './catalog-query';
import { parseCatalogState, serializeCatalogState } from './catalog-url-state';
import { filterAndSortCharacters, type CharacterSortMode } from './character-query';
import { applyCharacterState, parseCharacterState } from './character-url-state';
import { createWatchProgressSnapshot, parseWatchProgress, toggleWatchedTitle } from './watch-progress';
import { watchGuideHash, watchGuideIdFromHash } from './watch-guide-navigation';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;
  private readonly data = inject(CatalogDataService);
  private installEvent: (Event & { prompt():Promise<void>; userChoice:Promise<{outcome:string}> }) | null = null;
  readonly titles = signal<TitleRecord[]>([]);
  readonly universes = signal<Universe[]>([]);
  readonly characters = signal<Character[]>([]);
  readonly collections = signal<Collection[]>([]);
  readonly sagas = signal<Saga[]>([]);
  readonly phases = signal<Phase[]>([]);
  readonly storyArcs = signal<StoryArc[]>([]);
  readonly watchGuides = signal<WatchGuide[]>([]);
  readonly watchedGuideTitleIds = signal<Set<string>>(new Set());
  readonly query = signal('');
  readonly selectedUniverse = signal('all');
  readonly selectedSaga = signal('all');
  readonly selectedPhase = signal('all');
  readonly selectedType = signal('all');
  readonly sortMode = signal<CatalogSortMode>('release');
  readonly characterQuery = signal('');
  readonly selectedCharacterUniverse = signal('all');
  readonly selectedCharacterRole = signal<RoleType | 'all'>('all');
  readonly selectedCharacterOrigin = signal<NonNullable<Character['comicOrigin']> | 'all'>('all');
  readonly characterSortMode = signal<CharacterSortMode>('appearances');
  readonly visibleCharacterLimit = signal(60);
  readonly selectedTitle = signal<TitleRecord | null>(null);
  readonly selectedGuide = signal<WatchGuide | null>(null);
  readonly loading = signal(true);
  readonly canInstall = signal(false);
  readonly updateReady = signal(false);
  private readonly urlReady = signal(false);

  readonly releasedCount = computed(() => this.titles().filter((title) => title.status === 'released').length);
  readonly creditSceneCount = computed(() => this.titles().reduce((sum, title) => sum + title.creditScenes.reduce((n, scene) => n + scene.count, 0), 0));
  readonly currentPhase = computed(() => this.phases().find((phase) => phase.status === 'current'));
  readonly currentSaga = computed(() => this.sagas().find((saga) => saga.id === this.currentPhase()?.sagaId));
  readonly availableSagas = computed(() => availableSagaIds(this.titles(),this.selectedUniverse()));
  readonly availablePhases = computed(() => availablePhaseIds(this.titles(),this.selectedUniverse(),this.selectedSaga()));
  readonly hasCustomState = computed(() => Boolean(this.query()) || this.selectedUniverse() !== 'all' || this.selectedSaga() !== 'all' || this.selectedPhase() !== 'all' || this.selectedType() !== 'all' || this.sortMode() !== 'release');
  readonly selectedUniverseInfo = computed(() => this.universes().find(({id}) => id === this.selectedUniverse()));
  readonly selectedSagaInfo = computed(() => this.sagas().find(({id}) => id === this.selectedSaga()));
  readonly selectedPhaseInfo = computed(() => this.phases().find(({id}) => id === this.selectedPhase()));
  readonly filteredTitles = computed(() => filterAndSortTitles(this.titles(), this.characters(), {
    query:this.query(), universeId:this.selectedUniverse(), sagaId:this.selectedSaga(), phaseId:this.selectedPhase(), mediaType:this.selectedType(), sortMode:this.sortMode()
  }));
  readonly availableCharacterUniverses = computed(() => {
    const ids = new Set(this.characters().flatMap(({universeIds}) => universeIds ?? []));
    return this.universes().filter(({id}) => ids.has(id));
  });
  readonly selectedCharacterUniverseInfo = computed(() => this.universes().find(({id}) => id === this.selectedCharacterUniverse()));
  readonly hasCharacterFilters = computed(() => Boolean(this.characterQuery()) || this.selectedCharacterUniverse() !== 'all' || this.selectedCharacterRole() !== 'all' || this.selectedCharacterOrigin() !== 'all' || this.characterSortMode() !== 'appearances');
  readonly filteredCharacters = computed(() => filterAndSortCharacters(this.characters(),this.titles(),this.currentCharacterState()));
  readonly visibleCharacters = computed(() => this.filteredCharacters().slice(0,this.visibleCharacterLimit()));
  readonly activeGuide = computed(() => this.watchGuides().find(({status}) => status === 'featured') ?? this.watchGuides()[0]);
  readonly currentGuide = computed(() => this.selectedGuide() ?? this.activeGuide());
  readonly guideItems = computed(() => this.currentGuide()?.sections.flatMap(({items}) => items) ?? []);
  readonly coreGuideItems = computed(() => this.guideItems().filter(({countsTowardCoreRuntime}) => countsTowardCoreRuntime));
  readonly guideWatchedCount = computed(() => this.guideItems().filter(({titleId}) => this.watchedGuideTitleIds().has(titleId)).length);
  readonly guideCoreWatchedCount = computed(() => this.coreGuideItems().filter(({titleId}) => this.watchedGuideTitleIds().has(titleId)).length);
  readonly guideWatchedMinutes = computed(() => this.guideItems().filter(({titleId}) => this.watchedGuideTitleIds().has(titleId)).reduce((sum,{estimatedMinutes}) => sum + estimatedMinutes,0));
  readonly guideProgressPercent = computed(() => this.guideItems().length ? Math.round(this.guideWatchedCount() / this.guideItems().length * 100) : 0);
  private readonly syncUrl = effect(() => {
    if (!this.urlReady()) return;
    const params = applyCharacterState(new URLSearchParams(serializeCatalogState(this.currentQueryState())),this.currentCharacterState());
    const search = params.toString();
    const next = `${location.pathname}${search ? `?${search}` : ''}${location.hash}`;
    history.replaceState(null,'',next);
  });

  async ngOnInit(): Promise<void> {
    try {
      const { titles, universes, characters, collections, sagas, phases, storyArcs, watchGuides } = await this.data.load();
      this.titles.set(titles); this.universes.set(universes); this.characters.set(characters); this.collections.set(collections); this.sagas.set(sagas); this.phases.set(phases); this.storyArcs.set(storyArcs); this.watchGuides.set(watchGuides);
      this.restoreGuideProgress();
      this.restoreUrlState();
      this.restoreGuideFromHash();
      this.urlReady.set(true);
    } finally { this.loading.set(false); }
  }

  @HostListener('window:keydown', ['$event'])
  handleShortcut(event: KeyboardEvent): void { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); this.searchInput?.nativeElement.focus(); } if (event.key === 'Escape' && this.selectedTitle()) this.closeTitle(); else if (event.key === 'Escape' && this.selectedGuide()) this.closeGuide(); }
  @HostListener('window:beforeinstallprompt', ['$event'])
  handleInstallPrompt(event: Event): void { event.preventDefault(); this.installEvent = event as typeof this.installEvent; this.canInstall.set(true); }
  @HostListener('window:popstate')
  handlePopState(): void { this.restoreUrlState(); }
  @HostListener('window:hashchange')
  handleHashChange(): void { this.restoreGuideFromHash(); }
  @HostListener('window:marvel-app-update-ready')
  handleAppUpdateReady(): void { this.updateReady.set(true); }
  async install(): Promise<void> { if (!this.installEvent) return; await this.installEvent.prompt(); await this.installEvent.userChoice; this.installEvent = null; this.canInstall.set(false); }
  applyAppUpdate(): void { location.reload(); }
  dismissAppUpdate(): void { this.updateReady.set(false); }

  universeFor(title: TitleRecord): Universe | undefined { return this.universes().find((item) => item.id === title.universeIds[0]); }
  characterFor(id: string): Character | undefined { return this.characters().find((character) => character.id === id); }
  collectionFor(id: string): Collection | undefined { return this.collections().find((collection) => collection.id === id); }
  sagaFor(id?: string): Saga | undefined { return this.sagas().find((saga) => saga.id === id); }
  phaseFor(id?: string): Phase | undefined { return this.phases().find((phase) => phase.id === id); }
  storyArcFor(id: string): StoryArc | undefined { return this.storyArcs().find((arc) => arc.id === id); }
  titleFor(id:string): TitleRecord | undefined { return this.titles().find((title) => title.id === id); }
  guideForTitle(id:string): WatchGuide | undefined { return this.watchGuides().find(({targetTitleId}) => targetTitleId === id); }
  watchLinks(title: TitleRecord): ExternalLink[] { return title.links.filter(({kind}) => kind !== 'theater'); }
  theaterLinks(title: TitleRecord): ExternalLink[] { return title.links.filter(({kind}) => kind === 'theater'); }
  linkResolutionLabel(link: ExternalLink): string { return link.resolution === 'live-search' ? 'Live nearby search' : link.resolution === 'search' ? 'Search fallback' : 'Direct'; }
  directGuideLink(item:WatchGuideItem): ExternalLink | undefined {
    const title = this.titleFor(item.titleId);
    return title?.links.find(({provider,resolution,kind}) => provider === 'Apple TV' && resolution === 'direct' && (kind === 'stream' || kind === 'purchase'))
      ?? title?.links.find(({provider,resolution,kind}) => provider === 'Disney+' && resolution === 'direct' && kind === 'stream');
  }
  isGuideItemWatched(titleId:string): boolean { return this.watchedGuideTitleIds().has(titleId); }
  toggleGuideItem(item:WatchGuideItem, watched:boolean): void {
    this.watchedGuideTitleIds.set(toggleWatchedTitle(this.watchedGuideTitleIds(),item.titleId,watched));
    this.persistGuideProgress();
  }
  clearGuideProgress(): void {
    if (this.guideWatchedCount() && !window.confirm('Clear every checked title in this mission file?')) return;
    this.watchedGuideTitleIds.set(new Set());
    this.persistGuideProgress();
  }
  exportGuideProgress(): void {
    const guide = this.currentGuide(); if (!guide) return;
    const snapshot = createWatchProgressSnapshot(guide.id,guide.version,this.watchedGuideTitleIds());
    const url = URL.createObjectURL(new Blob([JSON.stringify(snapshot,null,2)],{type:'application/json'}));
    const link = document.createElement('a'); link.href = url; link.download = `${guide.id}-progress.json`; link.click(); URL.revokeObjectURL(url);
  }
  formatMinutes(minutes:number): string { const hours = Math.floor(minutes / 60); const remainder = minutes % 60; return hours ? `${hours}h ${remainder.toString().padStart(2,'0')}m` : `${remainder}m`; }
  creditSceneCountFor(title: TitleRecord): number { return title.creditScenes.reduce((sum, scene) => sum + scene.count, 0); }
  sagaAvailable(id: string): boolean { return this.availableSagas().has(id); }
  phaseAvailable(id: string): boolean { return this.availablePhases().has(id); }
  setSort(value: string): void { this.sortMode.set(value as CatalogSortMode); }
  setQuery(value: string): void { this.query.set(value); }
  setUniverse(value: string): void { this.selectedUniverse.set(value); if (this.selectedSaga() !== 'all' && !this.sagaAvailable(this.selectedSaga())) this.selectedSaga.set('all'); if (this.selectedPhase() !== 'all' && !this.phaseAvailable(this.selectedPhase())) this.selectedPhase.set('all'); }
  setSaga(value: string): void { this.selectedSaga.set(value); const compatible = compatiblePhaseSelection(this.phases(),this.selectedPhase(),value); this.selectedPhase.set(compatible !== 'all' && this.phaseAvailable(compatible) ? compatible : 'all'); }
  setPhase(value: string): void { if (value === 'all' || this.phaseAvailable(value)) this.selectedPhase.set(value); }
  setCharacterQuery(value:string):void { this.characterQuery.set(value); this.resetCharacterWindow(); }
  setCharacterUniverse(value:string):void { this.selectedCharacterUniverse.set(value); this.resetCharacterWindow(); }
  setCharacterRole(value:string):void { this.selectedCharacterRole.set(value as RoleType | 'all'); this.resetCharacterWindow(); }
  setCharacterOrigin(value:string):void { this.selectedCharacterOrigin.set(value as NonNullable<Character['comicOrigin']> | 'all'); this.resetCharacterWindow(); }
  setCharacterSort(value:string):void { this.characterSortMode.set(value as CharacterSortMode); this.resetCharacterWindow(); }
  clearCharacterFilters():void {
    this.characterQuery.set(''); this.selectedCharacterUniverse.set('all'); this.selectedCharacterRole.set('all'); this.selectedCharacterOrigin.set('all'); this.characterSortMode.set('appearances'); this.resetCharacterWindow();
  }
  loadMoreCharacters():void { this.visibleCharacterLimit.update((limit) => limit + 60); }
  characterUniverseNames(character:Character):string { return (character.universeIds ?? []).map((id) => this.universes().find((item) => item.id === id)?.shortName ?? id).join(' · '); }
  characterAppearances(character:Character):Array<{title:TitleRecord;role:RoleType}> {
    return this.titles().flatMap((title) => title.appearances.filter(({characterId}) => characterId === character.id).map(({role}) => ({title,role}))).sort((a,b) => a.title.releaseOrder - b.title.releaseOrder);
  }
  openTitle(title: TitleRecord): void { this.selectedTitle.set(title); document.body.classList.add('drawer-open'); }
  openTitleById(id:string): void { const title = this.titleFor(id); if (title) this.openTitle(title); }
  closeTitle(): void { this.selectedTitle.set(null); document.body.classList.remove('drawer-open'); }
  openGuide(guide:WatchGuide): void {
    this.closeTitle();
    this.selectedGuide.set(guide);
    this.restoreGuideProgress(guide);
    document.body.classList.add('guide-open');
    history.replaceState(null,'',`${location.pathname}${location.search}${watchGuideHash(guide.id)}`);
  }
  openGuideForTitle(titleId:string): void { const guide = this.guideForTitle(titleId); if (guide) this.openGuide(guide); }
  closeGuide(): void {
    this.selectedGuide.set(null);
    document.body.classList.remove('guide-open');
    if (watchGuideIdFromHash(location.hash)) history.replaceState(null,'',`${location.pathname}${location.search}`);
  }
  clearFilter(filter: 'query'|'universe'|'saga'|'phase'|'format'|'order'): void {
    if (filter === 'query') this.query.set('');
    if (filter === 'universe') this.setUniverse('all');
    if (filter === 'saga') this.setSaga('all');
    if (filter === 'phase') this.selectedPhase.set('all');
    if (filter === 'format') this.selectedType.set('all');
    if (filter === 'order') this.sortMode.set('release');
  }
  clearFilters(): void { this.query.set(''); this.selectedUniverse.set('all'); this.selectedSaga.set('all'); this.selectedPhase.set('all'); this.selectedType.set('all'); this.sortMode.set('release'); }
  formatDate(date: string): string { return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`)); }
  private currentQueryState() { return {query:this.query(),universeId:this.selectedUniverse(),sagaId:this.selectedSaga(),phaseId:this.selectedPhase(),mediaType:this.selectedType(),sortMode:this.sortMode()}; }
  private currentCharacterState() { return {query:this.characterQuery(),universeId:this.selectedCharacterUniverse(),role:this.selectedCharacterRole(),comicOrigin:this.selectedCharacterOrigin(),sortMode:this.characterSortMode()}; }
  private resetCharacterWindow():void { this.visibleCharacterLimit.set(60); }
  private restoreUrlState(): void {
    const state = parseCatalogState(location.search);
    const universeId = this.universes().some(({id}) => id === state.universeId) ? state.universeId : 'all';
    this.selectedUniverse.set(universeId);
    const sagaIds = availableSagaIds(this.titles(),universeId);
    const sagaId = this.sagas().some(({id}) => id === state.sagaId) && sagaIds.has(state.sagaId) ? state.sagaId : 'all';
    this.selectedSaga.set(sagaId);
    const phaseIds = availablePhaseIds(this.titles(),universeId,sagaId);
    const phaseId = this.phases().some(({id}) => id === state.phaseId) && phaseIds.has(state.phaseId) ? state.phaseId : 'all';
    this.query.set(state.query); this.selectedPhase.set(phaseId); this.selectedType.set(state.mediaType); this.sortMode.set(state.sortMode);
    const characterState = parseCharacterState(location.search);
    this.characterQuery.set(characterState.query);
    this.selectedCharacterUniverse.set(this.universes().some(({id}) => id === characterState.universeId) ? characterState.universeId : 'all');
    this.selectedCharacterRole.set(characterState.role); this.selectedCharacterOrigin.set(characterState.comicOrigin); this.characterSortMode.set(characterState.sortMode);
    this.resetCharacterWindow();
  }
  private restoreGuideFromHash(): void {
    const id = watchGuideIdFromHash(location.hash);
    const guide = this.watchGuides().find((item) => item.id === id) ?? null;
    this.selectedGuide.set(guide);
    document.body.classList.toggle('guide-open',Boolean(guide));
    if (guide) this.restoreGuideProgress(guide);
  }
  private guideStorageKey(guideId:string): string { return `marvel-archive:watch-progress:v1:${guideId}`; }
  private restoreGuideProgress(guide = this.currentGuide()): void {
    if (!guide || !('localStorage' in globalThis)) return;
    const ids = guide.sections.flatMap(({items}) => items.map(({titleId}) => titleId));
    try { this.watchedGuideTitleIds.set(parseWatchProgress(localStorage.getItem(this.guideStorageKey(guide.id)),guide.id,ids)); } catch { this.watchedGuideTitleIds.set(new Set()); }
  }
  private persistGuideProgress(): void {
    const guide = this.currentGuide(); if (!guide || !('localStorage' in globalThis)) return;
    try { localStorage.setItem(this.guideStorageKey(guide.id),JSON.stringify(createWatchProgressSnapshot(guide.id,guide.version,this.watchedGuideTitleIds()))); } catch { /* The checklist remains usable for the current session. */ }
  }
}
