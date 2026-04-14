import type { Adversary, LibraryStore, Tipo } from '@/types/adversary';

const STORAGE_KEY = 'daggerhub:adversaries:v1';

/**
 * Remapeamento de tipos legados para os nomes oficiais do Livro Básico PT-BR
 * (Cap. 4, pp. 193–208). Mantém bibliotecas salvas funcionando após rename.
 */
const LEGACY_TIPO_MAP: Record<string, Tipo> = {
  brutamontes: 'brutamonte',
  distancia: 'atirador',
  furtivo: 'oportunista',
  padrao: 'comum',
  suporte: 'assistente',
};

function migrateLegacyTipo(item: Adversary): Adversary {
  const legacy = LEGACY_TIPO_MAP[item.tipo as unknown as string];
  return legacy ? { ...item, tipo: legacy } : item;
}

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
    const items = parsed.items.map(migrateLegacyTipo);
    return { version: 1, items };
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
