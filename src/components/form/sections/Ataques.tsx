import { useFieldArray, useFormContext } from 'react-hook-form';
import type { Adversary } from '@/types/adversary';
import { Section } from '@/components/ui/Section';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FieldError } from '../FieldError';
import { blankAttack } from '@/lib/defaults';

export function Ataques() {
  const form = useFormContext<Adversary>();
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'ataques' });
  const errors = form.formState.errors;

  return (
    <Section
      title="Ataques"
      subtitle="Formato do dano: 1d8+2 fís ou 2d6 mág"
      actions={
        <Button type="button" variant="secondary" size="sm" onClick={() => append(blankAttack())}>
          + Adicionar ataque
        </Button>
      }
    >
      <div className="space-y-3">
        {fields.map((f, idx) => {
          const err = errors.ataques?.[idx];
          return (
            <div key={f.id} className="grid grid-cols-1 gap-2 rounded border border-ink/10 p-3 md:grid-cols-[1fr_1fr_1fr_auto]">
              <div>
                <label className="field-label">Nome</label>
                <Input {...form.register(`ataques.${idx}.nome`)} placeholder="Adaga" />
                <FieldError message={err?.nome?.message} />
              </div>
              <div>
                <label className="field-label">Alcance</label>
                <Input {...form.register(`ataques.${idx}.alcance`)} placeholder="corpo a corpo" />
                <FieldError message={err?.alcance?.message} />
              </div>
              <div>
                <label className="field-label">Dano</label>
                <Input {...form.register(`ataques.${idx}.dano`)} placeholder="1d4+2 fís" />
                <FieldError message={err?.dano?.message} />
              </div>
              <div className="flex items-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(idx)} disabled={fields.length === 1}>
                  Remover
                </Button>
              </div>
            </div>
          );
        })}
        {typeof errors.ataques?.message === 'string' ? <FieldError message={errors.ataques.message} /> : null}
      </div>
    </Section>
  );
}
