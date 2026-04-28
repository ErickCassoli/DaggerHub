import type { AmbienteTipo } from '@/types/ambiente';

export interface AmbienteTipoInfo {
  value: AmbienteTipo;
  label: string;
  descricao: string;
}

/**
 * Tipos oficiais de ambiente — Livro Básico p.241 ("Tipos de Ambientes").
 */
export const AMBIENTE_TIPOS: AmbienteTipoInfo[] = [
  {
    value: 'batalha',
    label: 'Batalha',
    descricao: 'Lugares marcados por violência ou disputas armadas em larga escala.',
  },
  {
    value: 'exploracao',
    label: 'Exploração',
    descricao: 'Lugares onde os personagens descobrem segredos e desbravam o desconhecido.',
  },
  {
    value: 'evento',
    label: 'Evento',
    descricao: 'Cenas centradas em uma situação ou ocorrência específica.',
  },
  {
    value: 'social',
    label: 'Social',
    descricao: 'Cenas de diálogo entre personagens, facções ou comunidades.',
  },
  {
    value: 'travessia',
    label: 'Travessia',
    descricao: 'Lugares perigosos com algum tipo de obstáculo natural a transpor.',
  },
];

export const AMBIENTE_TIPO_LABEL: Record<AmbienteTipo, string> = AMBIENTE_TIPOS.reduce(
  (acc, t) => ({ ...acc, [t.value]: t.label }),
  {} as Record<AmbienteTipo, string>,
);
