import type { Adversary } from '@/types/adversary';
import type {
  EncounterAdjustmentKey,
  EncounterEntry,
  EncounterPartyConfig,
} from '@/types/encounter';
import {
  ADJUSTMENT_BY_KEY,
  BALANCE_TOLERANCE,
  BASE_POINTS_FLAT,
  BASE_POINTS_PER_PC,
  BATTLE_POINT_COST,
} from '@/data/encounterRules';

export type BalanceVerdict = 'abaixo' | 'equilibrado' | 'acima';

export function calculateBudget(
  party: EncounterPartyConfig,
  ajustes: EncounterAdjustmentKey[],
): number {
  const base = BASE_POINTS_PER_PC * Math.max(0, party.numPC) + BASE_POINTS_FLAT;
  const delta = ajustes.reduce((sum, key) => sum + (ADJUSTMENT_BY_KEY[key]?.delta ?? 0), 0);
  return base + delta;
}

/**
 * Custo em PB de uma entrada. Lacaios têm regra especial (p.197):
 * 1 PB por conjunto do tamanho do grupo de PCs. Logo, `ceil(qtd / nPC)` PB.
 * Demais tipos: custo unitário × quantidade.
 */
export function entryCost(adv: Adversary, quantidade: number, numPC: number): number {
  const qty = Math.max(0, quantidade);
  if (qty === 0) return 0;
  if (adv.tipo === 'lacaio') {
    const denom = Math.max(1, numPC);
    return Math.ceil(qty / denom);
  }
  const unit = BATTLE_POINT_COST[adv.tipo] ?? 0;
  return unit * qty;
}

export interface EncounterCostBreakdown {
  total: number;
  porEntry: Array<{ entryId: string; custo: number; adversary: Adversary | undefined }>;
}

export function encounterCost(
  entries: EncounterEntry[],
  resolve: (ref: string, origem: EncounterEntry['origem']) => Adversary | undefined,
  party: EncounterPartyConfig,
): EncounterCostBreakdown {
  const porEntry = entries.map((e) => {
    const adv = resolve(e.adversaryRef, e.origem);
    return {
      entryId: e.id,
      custo: adv ? entryCost(adv, e.quantidade, party.numPC) : 0,
      adversary: adv,
    };
  });
  const total = porEntry.reduce((s, p) => s + p.custo, 0);
  return { total, porEntry };
}

export function balanceVerdict(budget: number, total: number): BalanceVerdict {
  const diff = total - budget;
  if (diff > BALANCE_TOLERANCE) return 'acima';
  if (diff < -BALANCE_TOLERANCE) return 'abaixo';
  return 'equilibrado';
}
