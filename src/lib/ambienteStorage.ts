import type { Ambiente, AmbienteStore } from '@/types/ambiente';

const STORAGE_KEY = 'daggerhub:ambientes:v1';

function emptyStore(): AmbienteStore {
  return { version: 1, items: [] };
}

export function loadAmbientes(): AmbienteStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as AmbienteStore;
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.items)) {
      return emptyStore();
    }
    return { version: 1, items: parsed.items };
  } catch (err) {
    console.warn('[DaggerHub] localStorage de ambientes corrompido, resetando.', err);
    return emptyStore();
  }
}

export function saveAmbientes(store: AmbienteStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function upsertAmbiente(store: AmbienteStore, amb: Ambiente): AmbienteStore {
  const idx = store.items.findIndex((i) => i.id === amb.id);
  const items = idx >= 0
    ? store.items.map((i) => (i.id === amb.id ? amb : i))
    : [...store.items, amb];
  return { ...store, items };
}

export function removeAmbiente(store: AmbienteStore, id: string): AmbienteStore {
  return { ...store, items: store.items.filter((i) => i.id !== id) };
}
