import type { Tipo } from '@/types/adversary';
import type { EncounterAdjustmentKey } from '@/types/encounter';

/**
 * Regras de construção de encontros — Livro Básico de Daggerheart PT-BR,
 * p.197 ("Escolhendo Adversários → Guia de Batalha").
 *
 * Fórmula base: (3 × nº de personagens no combate) + 2 = Pontos de Batalha (PB).
 *
 * Os toggles em `ADJUSTMENTS` somam/subtraem do orçamento conforme a tabela
 * "Ajustando Pontos de Batalha". Os custos por adversário ficam em
 * `BATTLE_POINT_COST`. Lacaios têm regra especial: gasta-se 1 PB por conjunto
 * de lacaios igual ao nº de PCs — essa lógica vive em `src/lib/encounter.ts`.
 */

/** Pontos base por personagem (multiplicador da fórmula). */
export const BASE_POINTS_PER_PC = 3;

/** Acréscimo fixo ao total de pontos. */
export const BASE_POINTS_FLAT = 2;

/**
 * Custo de Pontos de Batalha por adversária (indivíduo).
 * Lacaio = 1 PB por conjunto do tamanho do grupo → custo efetivo é calculado
 * em tempo de execução em `entryCost` (veja src/lib/encounter.ts).
 */
export const BATTLE_POINT_COST: Record<Tipo, number> = {
  lacaio: 1, // valor nominal; custo real = ceil(qtd / nPC)
  manipulador: 1,
  assistente: 1,
  horda: 2,
  atirador: 2,
  oportunista: 2,
  comum: 2,
  lider: 3,
  brutamonte: 4,
  solo: 5,
};

export interface AdjustmentInfo {
  key: EncounterAdjustmentKey;
  label: string;
  /** Delta aplicado ao orçamento (positivo = mais PB disponíveis). */
  delta: number;
  descricao: string;
}

/**
 * Ajustes da tabela "Ajustando Pontos de Batalha" (p.197).
 * Ordem dos itens segue o livro: primeiro as reduções, depois os acréscimos.
 */
export const ADJUSTMENTS: AdjustmentInfo[] = [
  {
    key: 'maisFacil',
    label: 'Luta mais fácil ou curta',
    delta: -1,
    descricao: 'Reduza 1 PB se a luta deve ser mais fácil ou curta.',
  },
  {
    key: 'doisOuMaisSolo',
    label: 'Dois ou mais Solos no encontro',
    delta: -2,
    descricao: 'Reduza 2 PB se estiver usando 2 ou mais adversários Solo.',
  },
  {
    key: 'danoExtraBonus',
    label: 'Somar +1d4 (ou +2) ao dano de todos',
    delta: -2,
    descricao:
      'Reduza 2 PB. Aumenta o desafio sem alongar o combate: todos os adversários ganham +1d4 (ou +2) em dano.',
  },
  {
    key: 'patamarInferior',
    label: 'Incluir adversário de patamar inferior',
    delta: +1,
    descricao: 'Acrescente 1 PB se escolher um adversário de patamar inferior.',
  },
  {
    key: 'semGrandesAmeacas',
    label: 'Sem brutamonte, horda, líder ou solo',
    delta: +1,
    descricao:
      'Acrescente 1 PB se o encontro não incluir nenhum adversário brutamonte, horda, líder ou solo.',
  },
  {
    key: 'maisPerigoso',
    label: 'Luta mais perigosa ou duradoura',
    delta: +2,
    descricao: 'Acrescente 2 PB se a luta precisar ser mais perigosa ou duradoura.',
  },
];

export const ADJUSTMENT_BY_KEY: Record<EncounterAdjustmentKey, AdjustmentInfo> = ADJUSTMENTS.reduce(
  (acc, a) => ({ ...acc, [a.key]: a }),
  {} as Record<EncounterAdjustmentKey, AdjustmentInfo>,
);

/** Tolerância para considerar o orçamento "equilibrado" (em pontos). */
export const BALANCE_TOLERANCE = 0;
