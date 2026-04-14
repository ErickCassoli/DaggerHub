import { useFieldArray, useFormContext } from 'react-hook-form';
import type { Adversary } from '@/types/adversary';
import { Section } from '@/components/ui/Section';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FieldError } from '../FieldError';
import { blankExperience } from '@/lib/defaults';

export function Experiencias() {
  const form = useFormContext<Adversary>();
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'experiencias' });
  const errors = form.formState.errors;

  return (
    <Section
      title="Experiências"
      subtitle="Competências com bônus (ex: Socialite +3)"
      actions={
        <Button type="button" variant="secondary" size="sm" onClick={() => append(blankExperience())}>
          + Adicionar experiência
        </Button>
      }
    >
      <div className="space-y-3">
        {fields.length === 0 ? (
          <p className="text-sm text-ink/60">Nenhuma experiência adicionada.</p>
        ) : null}
        {fields.map((f, idx) => {
          const err = errors.experiencias?.[idx];
          return (
            <div key={f.id} className="grid grid-cols-[1fr_120px_auto] gap-2 rounded border border-ink/10 p-3">
              <div>
                <label className="field-label">Nome</label>
                <Input {...form.register(`experiencias.${idx}.nome`)} placeholder="Socialite" />
                <FieldError message={err?.nome?.message} />
              </div>
              <div>
                <label className="field-label">Bônus</label>
                <Input type="number" {...form.register(`experiencias.${idx}.bonus`, { valueAsNumber: true })} />
                <FieldError message={err?.bonus?.message} />
              </div>
              <div className="flex items-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(idx)}>
                  Remover
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
