import { useCallback, useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import type { Adversary, LibraryStore } from '@/types/adversary';
import { loadStore, removeAdversary, saveStore, upsertAdversary } from '@/lib/storage';

export function useAdversaryLibrary() {
  const [store, setStore] = useState<LibraryStore>(() => loadStore());

  useEffect(() => {
    saveStore(store);
  }, [store]);

  const list = useCallback(() => store.items, [store]);

  const get = useCallback(
    (id: string) => store.items.find((i) => i.id === id),
    [store.items],
  );

  const upsert = useCallback((adv: Adversary) => {
    const now = new Date().toISOString();
    const withTimestamps: Adversary = {
      ...adv,
      criadoEm: adv.criadoEm || now,
      atualizadoEm: now,
    };
    setStore((s) => upsertAdversary(s, withTimestamps));
    return withTimestamps;
  }, []);

  const remove = useCallback((id: string) => {
    setStore((s) => removeAdversary(s, id));
  }, []);

  const duplicate = useCallback((id: string) => {
    const original = store.items.find((i) => i.id === id);
    if (!original) return undefined;
    const now = new Date().toISOString();
    const copy: Adversary = {
      ...original,
      id: nanoid(10),
      nome: `${original.nome} (cópia)`,
      criadoEm: now,
      atualizadoEm: now,
    };
    setStore((s) => upsertAdversary(s, copy));
    return copy;
  }, [store.items]);

  const importOne = useCallback((adv: Adversary) => {
    const now = new Date().toISOString();
    setStore((s) => {
      const collides = s.items.some((i) => i.id === adv.id);
      const toAdd: Adversary = collides
        ? { ...adv, id: nanoid(10), nome: `${adv.nome} (cópia)`, atualizadoEm: now }
        : adv;
      return upsertAdversary(s, toAdd);
    });
  }, []);

  return { items: store.items, list, get, upsert, remove, duplicate, importOne };
}
