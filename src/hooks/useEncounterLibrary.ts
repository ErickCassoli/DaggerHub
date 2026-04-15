import { useCallback, useEffect, useState } from 'react';
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

  useEffect(() => {
    saveEncounters(store);
  }, [store]);

  const get = useCallback(
    (id: string) => store.items.find((i) => i.id === id),
    [store.items],
  );

  const upsert = useCallback((enc: Encounter) => {
    const now = new Date().toISOString();
    const withTimestamps: Encounter = {
      ...enc,
      criadoEm: enc.criadoEm || now,
      atualizadoEm: now,
    };
    setStore((s) => upsertEncounter(s, withTimestamps));
    return withTimestamps;
  }, []);

  const remove = useCallback((id: string) => {
    setStore((s) => removeEncounter(s, id));
  }, []);

  const duplicate = useCallback((id: string) => {
    const original = store.items.find((i) => i.id === id);
    if (!original) return undefined;
    const now = new Date().toISOString();
    const copy: Encounter = {
      ...original,
      id: nanoid(10),
      nome: `${original.nome} (cópia)`,
      criadoEm: now,
      atualizadoEm: now,
    };
    setStore((s) => upsertEncounter(s, copy));
    return copy;
  }, [store.items]);

  return { items: store.items, get, upsert, remove, duplicate };
}
