import { Controller, useFormContext } from 'react-hook-form';
import type { Ambiente } from '@/types/ambiente';
import { Section } from '@/components/ui/Section';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { TagInput } from '@/components/ui/TagInput';
import { AMBIENTE_TIPOS } from '@/data/ambienteTipos';
import { PATAMARES } from '@/data/patamares';
import { FieldError } from '@/components/form/FieldError';

export function AmbienteIdentidade() {
  const form = useFormContext<Ambiente>();
  const errors = form.formState.errors;

  return (
    <Section title="Identidade" subtitle="Nome, tipo, patamar e descrição">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="field-label" htmlFor="ambNome">Nome</label>
          <Input id="ambNome" {...form.register('nome')} placeholder="Ex.: Manancial Raivoso" />
          <FieldError message={errors.nome?.message} />
        </div>

        <div>
          <label className="field-label" htmlFor="ambTipo">Tipo</label>
          <Select id="ambTipo" {...form.register('tipo')}>
            {AMBIENTE_TIPOS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
          <FieldError message={errors.tipo?.message} />
        </div>

        <div>
          <label className="field-label" htmlFor="ambPatamar">Patamar</label>
          <Select id="ambPatamar" {...form.register('patamar', { valueAsNumber: true })}>
            {PATAMARES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label} ({p.niveisPJ})
              </option>
            ))}
          </Select>
          <FieldError message={errors.patamar?.message} />
        </div>

        <div className="md:col-span-2">
          <label className="field-label" htmlFor="ambDescricao">Descrição (uma frase)</label>
          <Textarea
            id="ambDescricao"
            rows={2}
            {...form.register('descricao')}
            placeholder="Uma fenda na rocha por onde escorre uma corrente turbulenta…"
          />
          <FieldError message={errors.descricao?.message} />
        </div>

        <div className="md:col-span-2">
          <label className="field-label" htmlFor="ambImpulsos">
            Impulsos (Enter ou vírgula para adicionar)
          </label>
          <Controller
            control={form.control}
            name="impulsos"
            render={({ field }) => (
              <TagInput
                id="ambImpulsos"
                value={field.value}
                onChange={field.onChange}
                placeholder="afogar incautos, esconder segredos…"
              />
            )}
          />
          <FieldError message={errors.impulsos?.message as string | undefined} />
        </div>
      </div>
    </Section>
  );
}
