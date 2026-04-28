import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { nanoid } from 'nanoid';
import type { Ambiente } from '@/types/ambiente';
import type { Adversary } from '@/types/adversary';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { TIPO_LABEL } from '@/data/tipos';
import { PATAMAR_LABEL } from '@/data/patamares';
import { AddAdversaryModal } from '@/components/encounter/AddAdversaryModal';
import { useAdversaryLibrary } from '@/hooks/useAdversaryLibrary';
import { resolveAdversary } from '@/lib/adversarySources';

export function AmbienteAdversarios() {
  const form = useFormContext<Ambiente>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'adversariosSugeridos',
  });
  const { items: biblioteca } = useAdversaryLibrary();
  const [open, setOpen] = useState(false);

  const onPick = (adversary: Adversary, origem: 'biblioteca' | 'bestiario') => {
    const dup = fields.find(
      (f) => f.adversaryRef === adversary.id && f.origem === origem,
    );
    if (!dup) {
      append({ id: nanoid(8), adversaryRef: adversary.id, origem });
    }
    setOpen(false);
  };

  return (
    <Section
      title="Adversários sugeridos"
      subtitle="Refs para a biblioteca do usuário ou para o bestiário oficial"
      actions={
        <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
          + Adicionar adversária
        </Button>
      }
    >
      {fields.length === 0 ? (
        <p className="text-sm text-ink/60">
          Nenhuma adversária sugerida. Adversárias do bestiário também aparecem na busca.
        </p>
      ) : (
        <ul className="space-y-2">
          {fields.map((f, idx) => {
            const adv = resolveAdversary(f.adversaryRef, f.origem, biblioteca);
            return (
              <li
                key={f.id}
                className="flex items-center gap-3 rounded border border-ink/20 bg-white/60 px-3 py-2"
              >
                <div className="flex-1 min-w-0">
                  {adv ? (
                    <>
                      <p className="truncate font-semibold text-ink">
                        {adv.nome}
                        {f.origem === 'bestiario' ? (
                          <span className="ml-2 rounded bg-gold/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink/70">
                            oficial
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-ink/60">
                        {TIPO_LABEL[adv.tipo]} · {PATAMAR_LABEL[adv.patamar]}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-red-900">
                      Referência quebrada ({f.origem}: {f.adversaryRef})
                    </p>
                  )}
                </div>
                <Button size="sm" variant="danger" type="button" onClick={() => remove(idx)}>
                  Remover
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <AddAdversaryModal
        open={open}
        biblioteca={biblioteca}
        onClose={() => setOpen(false)}
        onPick={onPick}
      />
    </Section>
  );
}
