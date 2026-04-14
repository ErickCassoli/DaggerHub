import { FormProvider, type UseFormReturn } from 'react-hook-form';
import type { Adversary } from '@/types/adversary';
import { useAutoSuggest } from '@/hooks/useAutoSuggest';
import { Identidade } from './sections/Identidade';
import { Combate } from './sections/Combate';
import { Ataques } from './sections/Ataques';
import { Experiencias } from './sections/Experiencias';
import { Habilidades } from './sections/Habilidades';

interface AdversaryFormProps {
  form: UseFormReturn<Adversary>;
  onSubmit: (data: Adversary) => void;
}

export function AdversaryForm({ form, onSubmit }: AdversaryFormProps) {
  useAutoSuggest(form);

  return (
    <FormProvider {...form}>
      <form id="adversary-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Identidade />
        <Combate />
        <Ataques />
        <Experiencias />
        <Habilidades />
      </form>
    </FormProvider>
  );
}
