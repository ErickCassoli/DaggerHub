import type { Adversary, LibraryStore } from '@/types/adversary';

const STORAGE_KEY = 'daggerhub:adversaries:v1';

function emptyStore(): LibraryStore {
  return { version: 1, items: [] };
}

export function loadStore(): LibraryStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as LibraryStore;
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.items)) {
      return emptyStore();
    }
    return { version: 1, items: parsed.items };
  } catch (err) {
    console.warn('[DaggerHub] localStorage corrompido, resetando.', err);
    return emptyStore();
  }
}

export function saveStore(store: LibraryStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function upsertAdversary(store: LibraryStore, adv: Adversary): LibraryStore {
  const idx = store.items.findIndex((i) => i.id === adv.id);
  const items = idx >= 0
    ? store.items.map((i) => (i.id === adv.id ? adv : i))
    : [...store.items, adv];
  return { ...store, items };
}

export function removeAdversary(store: LibraryStore, id: string): LibraryStore {
  return { ...store, items: store.items.filter((i) => i.id !== id) };
}
