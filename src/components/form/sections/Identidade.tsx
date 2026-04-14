import { Controller, useFormContext } from 'react-hook-form';
import type { Adversary } from '@/types/adversary';
import { Section } from '@/components/ui/Section';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { TagInput } from '@/components/ui/TagInput';
import { TIPOS } from '@/data/tipos';
import { PATAMARES } from '@/data/patamares';
import { FieldError } from '../FieldError';

export function Identidade() {
  const form = useFormContext<Adversary>();
  const errors = form.formState.errors;
  const tipo = form.watch('tipo');

  return (
    <Section title="Identidade" subtitle="Nome, papel e descrição breve">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="field-label" htmlFor="nome">
            Nome
          </label>
          <Input id="nome" {...form.register('nome')} placeholder="Ex: Palaciano" />
          <FieldError message={errors.nome?.message} />
        </div>

        <div>
          <label className="field-label" htmlFor="tipo">
            Tipo
          </label>
          <Select id="tipo" {...form.register('tipo')}>
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
          <FieldError message={errors.tipo?.message} />
        </div>

        <div>
          <label className="field-label" htmlFor="patamar">
            Patamar
          </label>
          <Select
            id="patamar"
            {...form.register('patamar', { valueAsNumber: true })}
          >
            {PATAMARES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label} ({p.niveisPJ})
              </option>
            ))}
          </Select>
          <FieldError message={errors.patamar?.message} />
        </div>

        {tipo === 'horda' ? (
          <div className="md:col-span-2">
            <label className="field-label" htmlFor="hordaRatio">
              Razão de criaturas por PV (ex.: 1/PV, 2/PV)
            </label>
            <Input
              id="hordaRatio"
              {...form.register('hordaRatio')}
              placeholder="2/PV"
            />
            <FieldError message={errors.hordaRatio?.message} />
          </div>
        ) : null}

        <div className="md:col-span-2">
          <label className="field-label" htmlFor="descricao">
            Descrição (uma frase)
          </label>
          <Textarea
            id="descricao"
            rows={2}
            {...form.register('descricao')}
            placeholder="Um socialite ambicioso vestido de maneira ostensiva."
          />
          <FieldError message={errors.descricao?.message} />
        </div>

        <div className="md:col-span-2">
          <label className="field-label" htmlFor="motivacoes">
            Motivações e táticas (Enter ou vírgula para adicionar)
          </label>
          <Controller
            control={form.control}
            name="motivacoes"
            render={({ field }) => (
              <TagInput
                id="motivacoes"
                value={field.value}
                onChange={field.onChange}
                placeholder="bajular, descreditar, manobrar..."
              />
            )}
          />
          <FieldError message={errors.motivacoes?.message as string | undefined} />
        </div>
      </div>
    </Section>
  );
}
