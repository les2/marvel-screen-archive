import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Character, Collection, Phase, Saga, TitleRecord, Universe } from './models';
import { CatalogDataService } from './catalog-data.service';
import { compatiblePhaseSelection, filterAndSortTitles, phasesForSaga, type CatalogSortMode } from './catalog-query';

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
  readonly query = signal('');
  readonly selectedUniverse = signal('all');
  readonly selectedSaga = signal('all');
  readonly selectedPhase = signal('all');
  readonly selectedType = signal('all');
  readonly sortMode = signal<CatalogSortMode>('release');
  readonly selectedTitle = signal<TitleRecord | null>(null);
  readonly loading = signal(true);
  readonly canInstall = signal(false);

  readonly releasedCount = computed(() => this.titles().filter((title) => title.status === 'released').length);
  readonly creditSceneCount = computed(() => this.titles().reduce((sum, title) => sum + title.creditScenes.reduce((n, scene) => n + scene.count, 0), 0));
  readonly currentPhase = computed(() => this.phases().find((phase) => phase.status === 'current'));
  readonly currentSaga = computed(() => this.sagas().find((saga) => saga.id === this.currentPhase()?.sagaId));
  readonly visiblePhases = computed(() => phasesForSaga(this.phases(), this.selectedSaga()));
  readonly filteredTitles = computed(() => filterAndSortTitles(this.titles(), this.characters(), {
    query:this.query(), universeId:this.selectedUniverse(), sagaId:this.selectedSaga(), phaseId:this.selectedPhase(), mediaType:this.selectedType(), sortMode:this.sortMode()
  }));

  async ngOnInit(): Promise<void> {
    try {
      const { titles, universes, characters, collections, sagas, phases } = await this.data.load();
      this.titles.set(titles); this.universes.set(universes); this.characters.set(characters); this.collections.set(collections); this.sagas.set(sagas); this.phases.set(phases);
    } finally { this.loading.set(false); }
  }

  @HostListener('window:keydown', ['$event'])
  handleShortcut(event: KeyboardEvent): void { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); this.searchInput?.nativeElement.focus(); } if (event.key === 'Escape' && this.selectedTitle()) this.closeTitle(); }
  @HostListener('window:beforeinstallprompt', ['$event'])
  handleInstallPrompt(event: Event): void { event.preventDefault(); this.installEvent = event as typeof this.installEvent; this.canInstall.set(true); }
  async install(): Promise<void> { if (!this.installEvent) return; await this.installEvent.prompt(); await this.installEvent.userChoice; this.installEvent = null; this.canInstall.set(false); }

  universeFor(title: TitleRecord): Universe | undefined { return this.universes().find((item) => item.id === title.universeIds[0]); }
  characterFor(id: string): Character | undefined { return this.characters().find((character) => character.id === id); }
  collectionFor(id: string): Collection | undefined { return this.collections().find((collection) => collection.id === id); }
  sagaFor(id?: string): Saga | undefined { return this.sagas().find((saga) => saga.id === id); }
  phaseFor(id?: string): Phase | undefined { return this.phases().find((phase) => phase.id === id); }
  creditSceneCountFor(title: TitleRecord): number { return title.creditScenes.reduce((sum, scene) => sum + scene.count, 0); }
  setSort(value: string): void { this.sortMode.set(value as CatalogSortMode); }
  setQuery(value: string): void { this.query.set(value); }
  setSaga(value: string): void { this.selectedSaga.set(value); this.selectedPhase.set(compatiblePhaseSelection(this.phases(), this.selectedPhase(), value)); }
  openTitle(title: TitleRecord): void { this.selectedTitle.set(title); document.body.classList.add('drawer-open'); }
  closeTitle(): void { this.selectedTitle.set(null); document.body.classList.remove('drawer-open'); }
  clearFilters(): void { this.query.set(''); this.selectedUniverse.set('all'); this.selectedSaga.set('all'); this.selectedPhase.set('all'); this.selectedType.set('all'); }
  formatDate(date: string): string { return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`)); }
}
