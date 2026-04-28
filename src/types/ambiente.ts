import type { Patamar } from '@/types/adversary';

/**
 * Tipos oficiais de ambiente — Livro Básico de Daggerheart PT-BR
 * (Cap. 4 — Ambientes, pp. 240–243).
 */
export const AMBIENTE_TIPO_VALUES = [
  'travessia',
  'exploracao',
  'evento',
  'social',
  'batalha',
] as const;
export type AmbienteTipo = (typeof AMBIENTE_TIPO_VALUES)[number];

/** Reaproveita o vocabulário de habilidades dos adversários, com 'medo' extra. */
export const AMBIENTE_FEATURE_KIND_VALUES = ['acao', 'reacao', 'passiva', 'medo'] as const;
export type AmbienteFeatureKind = (typeof AMBIENTE_FEATURE_KIND_VALUES)[number];

export interface AmbienteFeature {
  id: string;
  nome: string;
  tipo: AmbienteFeatureKind;
  descricao: string;
}

/** Adversária sugerida pelo ambiente — referência à biblioteca ou ao bestiário. */
export interface AmbienteAdversaryRef {
  id: string;
  adversaryRef: string;
  origem: 'biblioteca' | 'bestiario';
}

export interface Ambiente {
  id: string;
  nome: string;
  tipo: AmbienteTipo;
  patamar: Patamar;
  descricao: string;
  /** Vontades/forças do ambiente. Equivalente a "motivações" das adversárias. */
  impulsos: string[];
  dificuldade: number;
  /** Potencial de ameaça em Pontos de Medo (livre, opcional). */
  potencialMedo?: number;
  adversariosSugeridos: AmbienteAdversaryRef[];
  /** Habilidades acionáveis do ambiente (gastam Medo, reagem, etc.). */
  habilidades: AmbienteFeature[];
  /** Características passivas/persistentes do ambiente. */
  caracteristicas: AmbienteFeature[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface AmbienteStore {
  version: 1;
  items: Ambiente[];
}
