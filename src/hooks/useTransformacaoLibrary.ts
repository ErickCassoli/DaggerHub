import { useCallback, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import type { Transformacao, TransformacaoStore } from '@/types/transformacao';
import {
  loadTransformacoes,
  removeTransformacao,
  saveTransformacoes,
  upsertTransformacao,
} from '@/lib/transformacaoStorage';

export function useTransformacaoLibrary() {
  const [store, setStore] = useState<TransformacaoStore>(() => loadTransformacoes());

  // Persistência síncrona no momento da mutação (mesmo racional do
  // useAdversaryLibrary): efeitos não rodam quando a página navega na mesma
  // interação, o que perderia o save.
  const storeRef = useRef(store);
  const commit = useCallback((next: TransformacaoStore) => {
    storeRef.current = next;
    saveTransformacoes(next);
    setStore(next);
  }, []);

  const get = useCallback(
    (id: string) => store.items.find((i) => i.id === id),
    [store.items],
  );

  const upsert = useCallback(
    (t: Transformacao) => {
      const now = new Date().toISOString();
      const withTimestamps: Transformacao = {
        ...t,
        criadoEm: t.criadoEm || now,
        atualizadoEm: now,
      };
      commit(upsertTransformacao(storeRef.current, withTimestamps));
      return withTimestamps;
    },
    [commit],
  );

  const remove = useCallback(
    (id: string) => {
      commit(removeTransformacao(storeRef.current, id));
    },
    [commit],
  );

  const duplicate = useCallback(
    (id: string) => {
      const original = storeRef.current.items.find((i) => i.id === id);
      if (!original) return undefined;
      const now = new Date().toISOString();
      const copy: Transformacao = {
        ...original,
        id: nanoid(10),
        nome: `${original.nome} (cópia)`,
        criadoEm: now,
        atualizadoEm: now,
      };
      commit(upsertTransformacao(storeRef.current, copy));
      return copy;
    },
    [commit],
  );

  const importOne = useCallback(
    (t: Transformacao) => {
      const now = new Date().toISOString();
      const collides = storeRef.current.items.some((i) => i.id === t.id);
      const toAdd: Transformacao = collides
        ? { ...t, id: nanoid(10), nome: `${t.nome} (cópia)`, atualizadoEm: now }
        : t;
      commit(upsertTransformacao(storeRef.current, toAdd));
      return toAdd;
    },
    [commit],
  );

  return { items: store.items, get, upsert, remove, duplicate, importOne };
}
