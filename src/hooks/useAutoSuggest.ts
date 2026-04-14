import { useEffect, useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { Adversary, Patamar, Tipo } from '@/types/adversary';
import { getBaseline } from '@/data/baselines';

type Form = UseFormReturn<Adversary>;

const TARGET_FIELDS = ['dificuldade', 'limiarMaior', 'limiarGrave', 'pv', 'pf', 'atq'] as const;

/**
 * Observa `tipo` e `patamar`. Quando mudam, aplica os valores do baseline
 * em cada campo-alvo APENAS se o campo ainda não estiver sujo
 * (o usuário não editou manualmente). Preserva edições do usuário.
 */
export function useAutoSuggest(form: Form) {
  const tipo = form.watch('tipo');
  const patamar = form.watch('patamar');
  const lastKey = useRef<string>('');

  useEffect(() => {
    if (!tipo || !patamar) return;
    const key = `${tipo}:${patamar}`;
    if (lastKey.current === key) return;
    lastKey.current = key;

    const base = getBaseline(patamar as Patamar, tipo as Tipo);
    const dirty = form.formState.dirtyFields;

    TARGET_FIELDS.forEach((field) => {
      if (!dirty[field]) {
        form.setValue(field, base[field], { shouldDirty: false });
      }
    });

    // Primeira ataque sugerido se o usuário não editou o dano
    const ataques = form.getValues('ataques');
    const dirtyDano = dirty.ataques?.[0]?.dano;
    if (ataques[0] && !dirtyDano) {
      form.setValue('ataques.0.dano', base.danoSugerido, { shouldDirty: false });
    }
  }, [tipo, patamar, form]);
}

/** Força sobrescrever todos os stats com o baseline do par atual. */
export function applyBaselineOverride(form: Form) {
  const tipo = form.getValues('tipo');
  const patamar = form.getValues('patamar');
  const base = getBaseline(patamar, tipo);
  TARGET_FIELDS.forEach((field) => {
    form.setValue(field, base[field], { shouldDirty: true });
  });
  const ataques = form.getValues('ataques');
  if (ataques[0]) {
    form.setValue('ataques.0.dano', base.danoSugerido, { shouldDirty: true });
  }
}
