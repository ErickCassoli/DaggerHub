/**
 * Módulo de Transformações — Daggerheart: Hope & Fear
 * Transformações são modificadores que se aplicam a personagens e adversárias.
 * Os campos são intencionalmente genéricos para acomodar as regras finais.
 */
export const TRANSFORMACAO_ABILITY_KIND_VALUES = [
  'acao',
  'reacao',
  'passiva',
  'gatilho',
] as const;
export type TransformacaoAbilityKind = (typeof TRANSFORMACAO_ABILITY_KIND_VALUES)[number];

export interface TransformacaoAbility {
  id: string;
  nome: string;
  tipo: TransformacaoAbilityKind;
  descricao: string;
}

export interface TransformacaoFormaAlternativa {
  nome: string;
  descricao: string;
}

export interface TransformacaoTokens {
  nome: string;
  maximo: number;
  descricao: string;
}

export interface Transformacao {
  id: string;
  nome: string;
  descricao: string;
  /** Forma alternativa (ex.: Forma de Lobo, Forma Espectral). */
  formaAlternativa?: TransformacaoFormaAlternativa;
  habilidades: TransformacaoAbility[];
  /** Sistema de tokens/recursos próprio (ex.: Dado do Lobo, Pontos de Assombro). */
  tokens?: TransformacaoTokens;
  notas: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface TransformacaoStore {
  version: 1;
  items: Transformacao[];
}
