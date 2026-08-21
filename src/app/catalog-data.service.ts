import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Character, Collection, Phase, Saga, StoryArc, TitleRecord, Universe } from './models';

export interface CatalogBundle { titles:TitleRecord[]; universes:Universe[]; characters:Character[]; collections:Collection[]; sagas:Saga[]; phases:Phase[]; storyArcs:StoryArc[]; }

@Injectable({ providedIn: 'root' })
export class CatalogDataService {
  private readonly http = inject(HttpClient);
  private readonly dbName = 'marvel-screen-archive';
  private readonly storeName = 'entities';

  async load(): Promise<CatalogBundle> {
    try {
      const [titles, universes, characters, collections, sagas, phases, storyArcs] = await Promise.all([
        firstValueFrom(this.http.get<TitleRecord[]>('/data/titles.json')),
        firstValueFrom(this.http.get<Universe[]>('/data/universes.json')),
        firstValueFrom(this.http.get<Character[]>('/data/characters.json')),
        firstValueFrom(this.http.get<Collection[]>('/data/collections.json')),
        firstValueFrom(this.http.get<Saga[]>('/data/sagas.json')),
        firstValueFrom(this.http.get<Phase[]>('/data/phases.json')),
        firstValueFrom(this.http.get<StoryArc[]>('/data/story-arcs.json'))
      ]);
      const bundle = { titles, universes, characters, collections, sagas, phases, storyArcs };
      await this.writeCache(bundle);
      return bundle;
    } catch (error) {
      const cached = await this.readCache();
      if (cached) return cached;
      throw error;
    }
  }

  private openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(this.storeName);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async writeCache(bundle: CatalogBundle): Promise<void> {
    if (!('indexedDB' in window)) return;
    const db = await this.openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      Object.entries(bundle).forEach(([key, value]) => store.put(value, key));
      store.put({ version:'0.4.0', cachedAt:new Date().toISOString() }, 'manifest');
      tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
    });
    db.close();
  }

  private async readCache(): Promise<CatalogBundle | null> {
    if (!('indexedDB' in window)) return null;
    const db = await this.openDb();
    const keys: Array<keyof CatalogBundle> = ['titles','universes','characters','collections','sagas','phases','storyArcs'];
    const values = await new Promise<unknown[]>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const requests = keys.map((key) => store.get(key));
      tx.oncomplete = () => resolve(requests.map((request) => request.result));
      tx.onerror = () => reject(tx.error);
    });
    db.close();
    if (values.some((value) => !Array.isArray(value))) return null;
    return Object.fromEntries(keys.map((key,index) => [key, values[index]])) as unknown as CatalogBundle;
  }
}
