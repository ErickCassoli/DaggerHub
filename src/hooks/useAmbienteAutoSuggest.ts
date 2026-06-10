import { useEffect, useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { Patamar } from '@/types/adversary';
import type { Ambiente } from '@/types/ambiente';
import { getAmbienteBaseline } from '@/data/ambienteBaselines';

type Form = UseFormReturn<Ambiente>;

const TARGET_FIELDS = ['dificuldade', 'potencialMedo'] as const;

/**
 * Observa o `patamar`. Quando muda, aplica o baseline em `dificuldade` e
 * `potencialMedo`, exceto onde o usuário já editou manualmente.
 */
export function useAmbienteAutoSuggest(form: Form) {
  const patamar = form.watch('patamar');
  const last = useRef<Patamar | null>(null);

  useEffect(() => {
    if (!patamar) return;
    if (last.current === patamar) return;
    last.current = patamar as Patamar;

    const base = getAmbienteBaseline(patamar as Patamar);
    const dirty = form.formState.dirtyFields;

    TARGET_FIELDS.forEach((field) => {
      if (!dirty[field]) {
        form.setValue(field, base[field] as never, { shouldDirty: false });
      }
    });
  }, [patamar, form]);
}

export function applyAmbienteBaselineOverride(form: Form) {
  const values = form.getValues();
  const base = getAmbienteBaseline(values.patamar);

  // Apenas setValue campo a campo (sem form.reset) — mesmo racional do
  // applyBaselineOverride de adversárias.
  for (const field of TARGET_FIELDS) {
    form.setValue(field, base[field] as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }
}
