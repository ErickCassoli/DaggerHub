import { useCallback, useEffect, useState } from 'react';
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

  useEffect(() => {
    saveTransformacoes(store);
  }, [store]);

  const get = useCallback(
    (id: string) => store.items.find((i) => i.id === id),
    [store.items],
  );

  const upsert = useCallback((t: Transformacao) => {
    const now = new Date().toISOString();
    const withTimestamps: Transformacao = {
      ...t,
      criadoEm: t.criadoEm || now,
      atualizadoEm: now,
    };
    setStore((s) => upsertTransformacao(s, withTimestamps));
    return withTimestamps;
  }, []);

  const remove = useCallback((id: string) => {
    setStore((s) => removeTransformacao(s, id));
  }, []);

  const duplicate = useCallback(
    (id: string) => {
      const original = store.items.find((i) => i.id === id);
      if (!original) return undefined;
      const now = new Date().toISOString();
      const copy: Transformacao = {
        ...original,
        id: nanoid(10),
        nome: `${original.nome} (cópia)`,
        criadoEm: now,
        atualizadoEm: now,
      };
      setStore((s) => upsertTransformacao(s, copy));
      return copy;
    },
    [store.items],
  );

  const importOne = useCallback((t: Transformacao) => {
    const now = new Date().toISOString();
    setStore((s) => {
      const collides = s.items.some((i) => i.id === t.id);
      const toAdd: Transformacao = collides
        ? { ...t, id: nanoid(10), nome: `${t.nome} (cópia)`, atualizadoEm: now }
        : t;
      return upsertTransformacao(s, toAdd);
    });
  }, []);

  return { items: store.items, get, upsert, remove, duplicate, importOne };
}
