import type { Encounter, EncounterStore } from '@/types/encounter';

const STORAGE_KEY = 'daggerhub:encounters:v1';

function emptyStore(): EncounterStore {
  return { version: 1, items: [] };
}

export function loadEncounters(): EncounterStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as EncounterStore;
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.items)) {
      return emptyStore();
    }
    return { version: 1, items: parsed.items };
  } catch (err) {
    console.warn('[DaggerHub] localStorage de encontros corrompido, resetando.', err);
    return emptyStore();
  }
}

export function saveEncounters(store: EncounterStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function upsertEncounter(store: EncounterStore, enc: Encounter): EncounterStore {
  const idx = store.items.findIndex((i) => i.id === enc.id);
  const items = idx >= 0
    ? store.items.map((i) => (i.id === enc.id ? enc : i))
    : [...store.items, enc];
  return { ...store, items };
}

export function removeEncounter(store: EncounterStore, id: string): EncounterStore {
  return { ...store, items: store.items.filter((i) => i.id !== id) };
}
