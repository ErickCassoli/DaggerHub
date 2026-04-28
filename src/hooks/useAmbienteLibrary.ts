import { useCallback, useEffect, useState } from 'react';
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

  useEffect(() => {
    saveAmbientes(store);
  }, [store]);

  const get = useCallback(
    (id: string) => store.items.find((i) => i.id === id),
    [store.items],
  );

  const upsert = useCallback((amb: Ambiente) => {
    const now = new Date().toISOString();
    const withTimestamps: Ambiente = {
      ...amb,
      criadoEm: amb.criadoEm || now,
      atualizadoEm: now,
    };
    setStore((s) => upsertAmbiente(s, withTimestamps));
    return withTimestamps;
  }, []);

  const remove = useCallback((id: string) => {
    setStore((s) => removeAmbiente(s, id));
  }, []);

  const duplicate = useCallback((id: string) => {
    const original = store.items.find((i) => i.id === id);
    if (!original) return undefined;
    const now = new Date().toISOString();
    const copy: Ambiente = {
      ...original,
      id: nanoid(10),
      nome: `${original.nome} (cópia)`,
      criadoEm: now,
      atualizadoEm: now,
    };
    setStore((s) => upsertAmbiente(s, copy));
    return copy;
  }, [store.items]);

  const importOne = useCallback((amb: Ambiente) => {
    const now = new Date().toISOString();
    setStore((s) => {
      const collides = s.items.some((i) => i.id === amb.id);
      const toAdd: Ambiente = collides
        ? { ...amb, id: nanoid(10), nome: `${amb.nome} (cópia)`, atualizadoEm: now }
        : amb;
      return upsertAmbiente(s, toAdd);
    });
  }, []);

  return { items: store.items, get, upsert, remove, duplicate, importOne };
}
