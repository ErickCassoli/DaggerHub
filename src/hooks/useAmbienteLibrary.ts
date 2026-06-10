import { useCallback, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import type { Ambiente, AmbienteStore } from '@/types/ambiente';
import {
  loadAmbientes,
  removeAmbiente,
  saveAmbientes,
  upsertAmbiente,
} from '@/lib/ambienteStorage';

export function useAmbienteLibrary() {
  const [store, setStore] = useState<AmbienteStore>(() => loadAmbientes());

  // Persistência síncrona no momento da mutação (mesmo racional do
  // useAdversaryLibrary): efeitos não rodam quando a página navega na mesma
  // interação, o que perderia o save.
  const storeRef = useRef(store);
  const commit = useCallback((next: AmbienteStore) => {
    storeRef.current = next;
    saveAmbientes(next);
    setStore(next);
  }, []);

  const get = useCallback(
    (id: string) => store.items.find((i) => i.id === id),
    [store.items],
  );

  const upsert = useCallback(
    (amb: Ambiente) => {
      const now = new Date().toISOString();
      const withTimestamps: Ambiente = {
        ...amb,
        criadoEm: amb.criadoEm || now,
        atualizadoEm: now,
      };
      commit(upsertAmbiente(storeRef.current, withTimestamps));
      return withTimestamps;
    },
    [commit],
  );

  const remove = useCallback(
    (id: string) => {
      commit(removeAmbiente(storeRef.current, id));
    },
    [commit],
  );

  const duplicate = useCallback(
    (id: string) => {
      const original = storeRef.current.items.find((i) => i.id === id);
      if (!original) return undefined;
      const now = new Date().toISOString();
      const copy: Ambiente = {
        ...original,
        id: nanoid(10),
        nome: `${original.nome} (cópia)`,
        criadoEm: now,
        atualizadoEm: now,
      };
      commit(upsertAmbiente(storeRef.current, copy));
      return copy;
    },
    [commit],
  );

  const importOne = useCallback(
    (amb: Ambiente) => {
      const now = new Date().toISOString();
      const collides = storeRef.current.items.some((i) => i.id === amb.id);
      const toAdd: Ambiente = collides
        ? { ...amb, id: nanoid(10), nome: `${amb.nome} (cópia)`, atualizadoEm: now }
        : amb;
      commit(upsertAmbiente(storeRef.current, toAdd));
      return toAdd;
    },
    [commit],
  );

  return { items: store.items, get, upsert, remove, duplicate, importOne };
}
