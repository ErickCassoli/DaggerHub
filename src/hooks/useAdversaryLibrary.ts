import { useCallback, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import type { Adversary, LibraryStore, Patamar } from '@/types/adversary';
import { loadStore, removeAdversary, saveStore, upsertAdversary } from '@/lib/storage';
import { reTierAdversary } from '@/data/baselines';

export function useAdversaryLibrary() {
  const [store, setStore] = useState<LibraryStore>(() => loadStore());

  // Persistência síncrona no momento da mutação: salvar via useEffect perde a
  // escrita quando a página navega na mesma interação (a página desmonta antes
  // do efeito rodar) — ex.: "Converter de 5e" importa e abre o editor no
  // mesmo clique.
  const storeRef = useRef(store);
  const commit = useCallback((next: LibraryStore) => {
    storeRef.current = next;
    saveStore(next);
    setStore(next);
  }, []);

  const list = useCallback(() => store.items, [store]);

  const get = useCallback(
    (id: string) => store.items.find((i) => i.id === id),
    [store.items],
  );

  const upsert = useCallback(
    (adv: Adversary) => {
      const now = new Date().toISOString();
      const withTimestamps: Adversary = {
        ...adv,
        criadoEm: adv.criadoEm || now,
        atualizadoEm: now,
      };
      commit(upsertAdversary(storeRef.current, withTimestamps));
      return withTimestamps;
    },
    [commit],
  );

  const remove = useCallback(
    (id: string) => {
      commit(removeAdversary(storeRef.current, id));
    },
    [commit],
  );

  const duplicate = useCallback(
    (id: string) => {
      const original = storeRef.current.items.find((i) => i.id === id);
      if (!original) return undefined;
      const now = new Date().toISOString();
      const copy: Adversary = {
        ...original,
        id: nanoid(10),
        nome: `${original.nome} (cópia)`,
        criadoEm: now,
        atualizadoEm: now,
      };
      commit(upsertAdversary(storeRef.current, copy));
      return copy;
    },
    [commit],
  );

  const importOne = useCallback(
    (adv: Adversary) => {
      const now = new Date().toISOString();
      const collides = storeRef.current.items.some((i) => i.id === adv.id);
      const toAdd: Adversary = collides
        ? { ...adv, id: nanoid(10), nome: `${adv.nome} (cópia)`, atualizadoEm: now }
        : adv;
      commit(upsertAdversary(storeRef.current, toAdd));
      return toAdd;
    },
    [commit],
  );

  const reTier = useCallback(
    (id: string, newPatamar: Patamar) => {
      const original = storeRef.current.items.find((i) => i.id === id);
      if (!original) return undefined;
      const now = new Date().toISOString();
      const copy: Adversary = {
        ...reTierAdversary(original, newPatamar),
        id: nanoid(10),
        nome: `${original.nome} (Patamar ${newPatamar})`,
        criadoEm: now,
        atualizadoEm: now,
      };
      commit(upsertAdversary(storeRef.current, copy));
      return copy;
    },
    [commit],
  );

  return { items: store.items, list, get, upsert, remove, duplicate, importOne, reTier };
}
