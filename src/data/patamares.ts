import type { Patamar } from '@/types/adversary';

export interface PatamarInfo {
  value: Patamar;
  label: string;
  niveisPJ: string;
}

export const PATAMARES: PatamarInfo[] = [
  { value: 1, label: '1º patamar', niveisPJ: 'Nível 1' },
  { value: 2, label: '2º patamar', niveisPJ: 'Níveis 2–4' },
  { value: 3, label: '3º patamar', niveisPJ: 'Níveis 5–7' },
  { value: 4, label: '4º patamar', niveisPJ: 'Níveis 8–10' },
];

export const PATAMAR_LABEL: Record<Patamar, string> = PATAMARES.reduce(
  (acc, p) => ({ ...acc, [p.value]: p.label }),
  {} as Record<Patamar, string>,
);
