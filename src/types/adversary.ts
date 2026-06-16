export type Patamar = 1 | 2 | 3 | 4;

export const ADVERSARY_FONTE_VALUES = ['livro_basico', 'hope_and_fear'] as const;
export type AdversaryFonte = (typeof ADVERSARY_FONTE_VALUES)[number];

export const ADVERSARY_FONTE_LABEL: Record<AdversaryFonte, string> = {
  livro_basico: 'Livro Básico',
  hope_and_fear: 'Hope & Fear',
};

export const TIPO_VALUES = [
  'brutamonte',
  'horda',
  'lider',
  'lacaio',
  'atirador',
  'oportunista',
  'manipulador',
  'solo',
  'comum',
  'assistente',
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
  /** Pode ser null (ex.: lacaios têm "Limiar: nenhum"). */
  limiarMaior: number | null;
  /** Pode ser null (ex.: manipuladores com limiar "6/Nenhum"). */
  limiarGrave: number | null;
  pv: number;
  pf: number;
  atq: number;
  /** Apenas hordas. Formato: "1/PV", "2/PV", "3/PV" etc. */
  hordaRatio?: string;
  ataques: Attack[];
  experiencias: Experience[];
  habilidades: Ability[];
  /** Origem do conteúdo oficial; ausente em homebrew do usuário. */
  fonte?: AdversaryFonte;
  /** Tags de organização (metadado, não aparece no stat block). */
  tags?: string[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface LibraryStore {
  version: 1;
  items: Adversary[];
}
