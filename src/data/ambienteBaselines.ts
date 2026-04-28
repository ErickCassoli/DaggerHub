import type { Patamar } from '@/types/adversary';

export interface AmbienteBaseline {
  /** Dificuldade típica de testes feitos contra o ambiente. */
  dificuldade: number;
  /** Sugestão de orçamento de Medo para acionar habilidades narrativas. */
  potencialMedo: number;
}

/**
 * Baselines por patamar para ambientes — alinhados ao tom dos exemplos
 * do Livro Básico (Cap. 4, pp. 242–...). Servem como ponto de partida
 * editável; o mestre ajusta livremente.
 */
export const AMBIENTE_TIER_BASELINES: Record<Patamar, AmbienteBaseline> = {
  1: { dificuldade: 11, potencialMedo: 2 },
  2: { dificuldade: 14, potencialMedo: 3 },
  3: { dificuldade: 17, potencialMedo: 4 },
  4: { dificuldade: 20, potencialMedo: 5 },
};

export function getAmbienteBaseline(patamar: Patamar): AmbienteBaseline {
  return AMBIENTE_TIER_BASELINES[patamar];
}
