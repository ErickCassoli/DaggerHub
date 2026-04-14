import { useFormContext } from 'react-hook-form';
import type { Adversary } from '@/types/adversary';
import { Section } from '@/components/ui/Section';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FieldError } from '../FieldError';
import { applyBaselineOverride } from '@/hooks/useAutoSuggest';

export function Combate() {
  const form = useFormContext<Adversary>();
  const errors = form.formState.errors;

  const onReset = () => {
    const ok = confirm('Sobrescrever Dificuldade, Limiares, PV, PF, ATQ e dano com os valores padrão do patamar?');
    if (!ok) return;
    applyBaselineOverride(form);
  };

  return (
    <Section
      title="Combate"
      subtitle="Valores auto-sugeridos pelo patamar/tipo; editáveis"
      actions={
        <Button type="button" variant="secondary" size="sm" onClick={onReset}>
          Aplicar padrões do patamar
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <NumField label="Dificuldade" reg={form.register('dificuldade', { valueAsNumber: true })} err={errors.dificuldade?.message} />
        <NumField label="Limiar Maior" reg={form.register('limiarMaior', { valueAsNumber: true })} err={errors.limiarMaior?.message} />
        <NumField label="Limiar Grave" reg={form.register('limiarGrave', { valueAsNumber: true })} err={errors.limiarGrave?.message} />
        <NumField label="PV" reg={form.register('pv', { valueAsNumber: true })} err={errors.pv?.message} />
        <NumField label="PF" reg={form.register('pf', { valueAsNumber: true })} err={errors.pf?.message} />
        <NumField label="ATQ (±)" reg={form.register('atq', { valueAsNumber: true })} err={errors.atq?.message} />
      </div>
    </Section>
  );
}

type Reg = ReturnType<ReturnType<typeof useFormContext<Adversary>>['register']>;

function NumField({ label, reg, err }: { label: string; reg: Reg; err?: string }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <Input type="number" {...reg} />
      <FieldError message={err} />
    </div>
  );
}
