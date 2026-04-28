import { useRef, type MutableRefObject } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import type { Ambiente, AmbienteFeatureKind } from '@/types/ambiente';
import { Section } from '@/components/ui/Section';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { FieldError } from '@/components/form/FieldError';
import { KeywordChips } from '@/components/form/KeywordChips';
import { blankFeature } from '@/lib/ambienteDefaults';

type FieldName = 'habilidades' | 'caracteristicas';

interface AmbienteFeaturesProps {
  fieldName: FieldName;
  title: string;
  subtitle: string;
  /** Restringe os tipos disponíveis (ex.: características só passivas). */
  allowedKinds?: AmbienteFeatureKind[];
}

const KIND_LABEL: Record<AmbienteFeatureKind, string> = {
  acao: 'Ação',
  reacao: 'Reação',
  passiva: 'Passiva',
  medo: 'Medo',
};

export function AmbienteFeatures({
  fieldName,
  title,
  subtitle,
  allowedKinds = ['acao', 'reacao', 'passiva', 'medo'],
}: AmbienteFeaturesProps) {
  const form = useFormContext<Ambiente>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: fieldName,
  });
  const errors = form.formState.errors;
  const sectionErrs = errors[fieldName] as
    | Array<{ nome?: { message?: string }; tipo?: { message?: string }; descricao?: { message?: string } }>
    | undefined;

  const defaultKind: AmbienteFeatureKind = allowedKinds[0] ?? 'passiva';

  return (
    <Section
      title={title}
      subtitle={subtitle}
      actions={
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => append({ ...blankFeature(), tipo: defaultKind })}
        >
          + Adicionar
        </Button>
      }
    >
      <div className="space-y-4">
        {fields.length === 0 ? (
          <p className="text-sm text-ink/60">Nenhum item adicionado.</p>
        ) : null}
        {fields.map((f, idx) => (
          <FeatureRow
            key={f.id}
            fieldName={fieldName}
            idx={idx}
            allowedKinds={allowedKinds}
            err={sectionErrs?.[idx]}
            onRemove={() => remove(idx)}
          />
        ))}
      </div>
    </Section>
  );
}

function FeatureRow({
  fieldName,
  idx,
  allowedKinds,
  err,
  onRemove,
}: {
  fieldName: FieldName;
  idx: number;
  allowedKinds: AmbienteFeatureKind[];
  err?: { nome?: { message?: string }; tipo?: { message?: string }; descricao?: { message?: string } };
  onRemove: () => void;
}) {
  const form = useFormContext<Ambiente>();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null) as MutableRefObject<HTMLTextAreaElement | null>;

  return (
    <div className="space-y-2 rounded border border-ink/10 p-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_180px_auto]">
        <div>
          <label className="field-label">Nome</label>
          <Input
            {...form.register(`${fieldName}.${idx}.nome` as const)}
            placeholder="Ex.: Bestas Abomináveis"
          />
          <FieldError message={err?.nome?.message} />
        </div>
        <div>
          <label className="field-label">Tipo</label>
          <Select {...form.register(`${fieldName}.${idx}.tipo` as const)}>
            {allowedKinds.map((k) => (
              <option key={k} value={k}>{KIND_LABEL[k]}</option>
            ))}
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
          name={`${fieldName}.${idx}.descricao` as const}
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
                placeholder="gaste 1 **Ponto de Medo** para que o ambiente reaja…"
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
