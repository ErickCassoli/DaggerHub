/**
 * Tipos do construtor de encontros.
 * Regras de pontuação ficam em src/data/encounterRules.ts (Livro Básico p.197).
 */

export interface EncounterEntry {
  /** ID local da entrada (não o id da adversária). */
  id: string;
  /** Referência: id da adversária na biblioteca do usuário OU no bestiário oficial. */
  adversaryRef: string;
  /** Origem da referência. */
  origem: 'biblioteca' | 'bestiario';
  /** Quantidade dessa adversária no encontro. */
  quantidade: number;
  /** Anotações específicas dessa entrada (opcional). */
  notas?: string;
}

export interface EncounterPartyConfig {
  /** Número de personagens na mesa. */
  numPC: number;
  /** Nível médio do grupo (1–10). Determina patamar sugerido. */
  nivelPC: number;
}

/**
 * Chaves dos ajustes da tabela "Ajustando Pontos de Batalha" (Livro Básico p.197).
 * Descrições, deltas e labels vivem em src/data/encounterRules.ts.
 */
export type EncounterAdjustmentKey =
  | 'maisFacil'
  | 'doisOuMaisSolo'
  | 'danoExtraBonus'
  | 'patamarInferior'
  | 'semGrandesAmeacas'
  | 'maisPerigoso';

export interface Encounter {
  id: string;
  nome: string;
  descricao: string;
  party: EncounterPartyConfig;
  /** Ajustes ativos (toggles). */
  ajustes: EncounterAdjustmentKey[];
  entries: EncounterEntry[];
  /** Anotações livres do mestre sobre o encontro. */
  notas: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface EncounterStore {
  version: 1;
  items: Encounter[];
}
