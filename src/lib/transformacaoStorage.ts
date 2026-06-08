import type { Transformacao, TransformacaoStore } from '@/types/transformacao';

const STORAGE_KEY = 'daggerhub:transformacoes:v1';

function emptyStore(): TransformacaoStore {
  return { version: 1, items: [] };
}

export function loadTransformacoes(): TransformacaoStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as TransformacaoStore;
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.items)) {
      return emptyStore();
    }
    return { version: 1, items: parsed.items };
  } catch (err) {
    console.warn('[DaggerHub] localStorage de transformações corrompido, resetando.', err);
    return emptyStore();
  }
}

export function saveTransformacoes(store: TransformacaoStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function upsertTransformacao(
  store: TransformacaoStore,
  t: Transformacao,
): TransformacaoStore {
  const idx = store.items.findIndex((i) => i.id === t.id);
  const items =
    idx >= 0 ? store.items.map((i) => (i.id === t.id ? t : i)) : [...store.items, t];
  return { ...store, items };
}

export function removeTransformacao(store: TransformacaoStore, id: string): TransformacaoStore {
  return { ...store, items: store.items.filter((i) => i.id !== id) };
}
