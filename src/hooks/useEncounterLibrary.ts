import { useCallback, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import type { Encounter, EncounterStore } from '@/types/encounter';
import {
  loadEncounters,
  removeEncounter,
  saveEncounters,
  upsertEncounter,
} from '@/lib/encounterStorage';

export function useEncounterLibrary() {
  const [store, setStore] = useState<EncounterStore>(() => loadEncounters());

  // Persistência síncrona no momento da mutação (mesmo racional do
  // useAdversaryLibrary): efeitos não rodam quando a página navega na mesma
  // interação, o que perderia o save.
  const storeRef = useRef(store);
  const commit = useCallback((next: EncounterStore) => {
    storeRef.current = next;
    saveEncounters(next);
    setStore(next);
  }, []);

  const get = useCallback(
    (id: string) => store.items.find((i) => i.id === id),
    [store.items],
  );

  const upsert = useCallback(
    (enc: Encounter) => {
      const now = new Date().toISOString();
      const withTimestamps: Encounter = {
        ...enc,
        criadoEm: enc.criadoEm || now,
        atualizadoEm: now,
      };
      commit(upsertEncounter(storeRef.current, withTimestamps));
      return withTimestamps;
    },
    [commit],
  );

  const remove = useCallback(
    (id: string) => {
      commit(removeEncounter(storeRef.current, id));
    },
    [commit],
  );

  const duplicate = useCallback(
    (id: string) => {
      const original = storeRef.current.items.find((i) => i.id === id);
      if (!original) return undefined;
      const now = new Date().toISOString();
      const copy: Encounter = {
        ...original,
        id: nanoid(10),
        nome: `${original.nome} (cópia)`,
        criadoEm: now,
        atualizadoEm: now,
      };
      commit(upsertEncounter(storeRef.current, copy));
      return copy;
    },
    [commit],
  );

  const importOne = useCallback(
    (enc: Encounter) => {
      const now = new Date().toISOString();
      const collides = storeRef.current.items.some((i) => i.id === enc.id);
      const toAdd: Encounter = collides
        ? { ...enc, id: nanoid(10), nome: `${enc.nome} (cópia)`, atualizadoEm: now }
        : enc;
      commit(upsertEncounter(storeRef.current, toAdd));
      return toAdd;
    },
    [commit],
  );

  return { items: store.items, get, upsert, remove, duplicate, importOne };
}
