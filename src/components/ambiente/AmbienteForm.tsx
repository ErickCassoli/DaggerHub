import { FormProvider, type UseFormReturn } from 'react-hook-form';
import type { Ambiente } from '@/types/ambiente';
import { useAmbienteAutoSuggest } from '@/hooks/useAmbienteAutoSuggest';
import { AmbienteIdentidade } from './sections/AmbienteIdentidade';
import { AmbienteDetalhes } from './sections/AmbienteDetalhes';
import { AmbienteAdversarios } from './sections/AmbienteAdversarios';
import { AmbienteFeatures } from './sections/AmbienteFeatures';

interface AmbienteFormProps {
  form: UseFormReturn<Ambiente>;
  onSubmit: (data: Ambiente) => void;
}

export function AmbienteForm({ form, onSubmit }: AmbienteFormProps) {
  useAmbienteAutoSuggest(form);

  return (
    <FormProvider {...form}>
      <form id="ambiente-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <AmbienteIdentidade />
        <AmbienteDetalhes />
        <AmbienteAdversarios />
        <AmbienteFeatures
          fieldName="caracteristicas"
          title="Características"
          subtitle="Traços passivos e persistentes do ambiente"
          allowedKinds={['passiva']}
        />
        <AmbienteFeatures
          fieldName="habilidades"
          title="Habilidades"
          subtitle="Ações, reações e gatilhos de Medo do ambiente"
          allowedKinds={['acao', 'reacao', 'passiva', 'medo']}
        />
      </form>
    </FormProvider>
  );
}
