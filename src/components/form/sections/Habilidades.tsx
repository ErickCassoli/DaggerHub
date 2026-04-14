import { useRef, type MutableRefObject } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import type { Adversary } from '@/types/adversary';
import { Section } from '@/components/ui/Section';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { FieldError } from '../FieldError';
import { KeywordChips } from '../KeywordChips';
import { blankAbility } from '@/lib/defaults';

export function Habilidades() {
  const form = useFormContext<Adversary>();
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'habilidades' });
  const errors = form.formState.errors;

  return (
    <Section
      title="Habilidades"
      subtitle="Ações, reações e passivas. Clique nas keywords para inserir no texto."
      actions={
        <Button type="button" variant="secondary" size="sm" onClick={() => append(blankAbility())}>
          + Adicionar habilidade
        </Button>
      }
    >
      <div className="space-y-4">
        {fields.length === 0 ? (
          <p className="text-sm text-ink/60">Nenhuma habilidade adicionada.</p>
        ) : null}
        {fields.map((f, idx) => (
          <HabilidadeRow key={f.id} idx={idx} onRemove={() => remove(idx)} err={errors.habilidades?.[idx]} />
        ))}
        {typeof errors.habilidades?.message === 'string' ? <FieldError message={errors.habilidades.message} /> : null}
      </div>
    </Section>
  );
}

function HabilidadeRow({
  idx,
  onRemove,
  err,
}: {
  idx: number;
  onRemove: () => void;
  err?: {
    nome?: { message?: string };
    tipo?: { message?: string };
    descricao?: { message?: string };
  };
}) {
  const form = useFormContext<Adversary>();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null) as MutableRefObject<HTMLTextAreaElement | null>;

  return (
    <div className="space-y-2 rounded border border-ink/10 p-3">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_180px_auto]">
        <div>
          <label className="field-label">Nome</label>
          <Input {...form.register(`habilidades.${idx}.nome`)} placeholder="Bode Expiatório" />
          <FieldError message={err?.nome?.message} />
        </div>
        <div>
          <label className="field-label">Tipo</label>
          <Select {...form.register(`habilidades.${idx}.tipo`)}>
            <option value="acao">Ação</option>
            <option value="reacao">Reação</option>
            <option value="passiva">Passiva</option>
          </Select>
          <FieldError message={err?.tipo?.message} />
        </div>
        <div className="flex items-end">
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            Remover
          </Button>
        </div>
      </div>

      <div>
        <label className="field-label">Descrição</label>
        <Controller
          control={form.control}
          name={`habilidades.${idx}.descricao`}
          render={({ field }) => (
            <>
              <Textarea
                rows={4}
                ref={(el) => {
                  field.ref(el);
                  textareaRef.current = el;
                }}
                name={field.name}
                value={field.value}
                onBlur={field.onBlur}
                onChange={field.onChange}
                placeholder="gaste 1 **Ponto de Medo** para marcar um personagem como alvo..."
              />
              <div className="mt-2">
                <KeywordChips
                  textareaRef={textareaRef}
                  value={field.value}
                  onInsert={(next) => field.onChange(next)}
                />
              </div>
            </>
          )}
        />
        <FieldError message={err?.descricao?.message} />
      </div>
    </div>
  );
}
