export type Patamar = 1 | 2 | 3 | 4;

export const TIPO_VALUES = [
  'brutamontes',
  'horda',
  'lider',
  'lacaio',
  'distancia',
  'furtivo',
  'manipulador',
  'solo',
  'padrao',
  'suporte',
] as const;
export type Tipo = (typeof TIPO_VALUES)[number];

export const ABILITY_KIND_VALUES = ['acao', 'reacao', 'passiva'] as const;
export type AbilityKind = (typeof ABILITY_KIND_VALUES)[number];

export interface Attack {
  id: string;
  nome: string;
  alcance: string;
  dano: string; // Formato: "1d4+2 fís" ou "2d6 mág"
}

export interface Experience {
  id: string;
  nome: string;
  bonus: number;
}

export interface Ability {
  id: string;
  nome: string;
  tipo: AbilityKind;
  descricao: string;
}

export interface Adversary {
  id: string;
  nome: string;
  tipo: Tipo;
  patamar: Patamar;
  descricao: string;
  motivacoes: string[];
  dificuldade: number;
  limiarMaior: number;
  limiarGrave: number;
  pv: number;
  pf: number;
  atq: number;
  ataques: Attack[];
  experiencias: Experience[];
  habilidades: Ability[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface LibraryStore {
  version: 1;
  items: Adversary[];
}
