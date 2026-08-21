import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Character, Collection, TitleRecord, Universe } from './models';
import { CatalogDataService } from './catalog-data.service';

type SortMode = 'release' | 'timeline' | 'title';

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
  readonly query = signal('');
  readonly selectedUniverse = signal('all');
  readonly selectedType = signal('all');
  readonly sortMode = signal<SortMode>('release');
  readonly selectedTitle = signal<TitleRecord | null>(null);
  readonly loading = signal(true);
  readonly canInstall = signal(false);

  readonly releasedCount = computed(() => this.titles().filter((title) => title.status === 'released').length);
  readonly creditSceneCount = computed(() => this.titles().reduce((sum, title) => sum + title.creditScenes.reduce((n, scene) => n + scene.count, 0), 0));
  readonly filteredTitles = computed(() => {
    const query = this.normalize(this.query());
    const universe = this.selectedUniverse();
    const type = this.selectedType();
    const characters = new Map(this.characters().map((character) => [character.id, character]));
    const records = this.titles().filter((title) => {
      if (universe !== 'all' && !title.universeIds.includes(universe)) return false;
      if (type !== 'all' && title.mediaType !== type) return false;
      if (!query) return true;
      const people = title.appearances.flatMap((appearance) => {
        const character = characters.get(appearance.characterId);
        return character ? [character.name, ...character.aliases] : [];
      });
      const haystack = this.normalize([title.title, title.synopsis, title.timelineYear, ...(title.searchAliases ?? []), ...people].join(' '));
      return query.split(' ').every((term) => haystack.includes(term));
    });
    return [...records].sort((a, b) => {
      if (this.sortMode() === 'title') return a.title.localeCompare(b.title);
      if (this.sortMode() === 'timeline') return (a.timelineOrder ?? 9999) - (b.timelineOrder ?? 9999);
      return a.releaseDate.localeCompare(b.releaseDate);
    });
  });

  async ngOnInit(): Promise<void> {
    try {
      const { titles, universes, characters, collections } = await this.data.load();
      this.titles.set(titles); this.universes.set(universes); this.characters.set(characters); this.collections.set(collections);
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
  creditSceneCountFor(title: TitleRecord): number { return title.creditScenes.reduce((sum, scene) => sum + scene.count, 0); }
  setSort(value: string): void { this.sortMode.set(value as SortMode); }
  setQuery(value: string): void { this.query.set(value); }
  openTitle(title: TitleRecord): void { this.selectedTitle.set(title); document.body.classList.add('drawer-open'); }
  closeTitle(): void { this.selectedTitle.set(null); document.body.classList.remove('drawer-open'); }
  clearFilters(): void { this.query.set(''); this.selectedUniverse.set('all'); this.selectedType.set('all'); }
  formatDate(date: string): string { return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`)); }
  private normalize(value = ''): string { return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
}
