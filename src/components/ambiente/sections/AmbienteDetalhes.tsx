import { useFormContext } from 'react-hook-form';
import type { Ambiente } from '@/types/ambiente';
import { Section } from '@/components/ui/Section';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FieldError } from '@/components/form/FieldError';
import { applyAmbienteBaselineOverride } from '@/hooks/useAmbienteAutoSuggest';

export function AmbienteDetalhes() {
  const form = useFormContext<Ambiente>();
  const errors = form.formState.errors;

  const onReset = () => {
    const ok = confirm('Sobrescrever Dificuldade e Potencial de Medo com os valores padrão do patamar?');
    if (!ok) return;
    applyAmbienteBaselineOverride(form);
  };

  return (
    <Section
      title="Detalhes"
      subtitle="Dificuldade do ambiente e orçamento de Medo (auto-sugeridos pelo patamar)"
      actions={
        <Button type="button" variant="secondary" size="sm" onClick={onReset}>
          Aplicar padrões do patamar
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div>
          <label className="field-label">Dificuldade</label>
          <Input type="number" hasError={!!errors.dificuldade} {...form.register('dificuldade', { valueAsNumber: true })} />
          <FieldError message={errors.dificuldade?.message} />
        </div>
        <div>
          <label className="field-label">Potencial de Medo</label>
          <Input
            type="number"
            placeholder="opcional"
            {...form.register('potencialMedo', {
              setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
            })}
          />
          <FieldError message={errors.potencialMedo?.message} />
        </div>
      </div>
    </Section>
  );
}
