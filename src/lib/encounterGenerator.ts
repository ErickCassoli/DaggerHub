import { BESTIARIO } from '@/data/bestiario';
import { BASE_POINTS_FLAT, BASE_POINTS_PER_PC, BATTLE_POINT_COST } from '@/data/encounterRules';
import type { Adversary, Patamar, Tipo } from '@/types/adversary';

/** Limite máximo de unidades por tipo para manter variedade no encontro. */
const MAX_QTY: Record<Tipo, number> = {
  solo: 1,
  brutamonte: 1,
  lider: 1,
  horda: 1,
  atirador: 3,
  oportunista: 3,
  comum: 3,
  manipulador: 2,
  assistente: 2,
  lacaio: 999,
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface GeneratedEntry {
  adversary: Adversary;
  adversaryRef: string;
  origem: 'bestiario';
  quantidade: number;
}

/**
 * Retorna o custo em PB de uma entrada gerada.
 * Lacaios: ceil(qtd / numPC); demais: custo_unitário × qtd.
 */
export function generatedEntryCost(entry: GeneratedEntry, numPC: number): number {
  if (entry.adversary.tipo === 'lacaio') {
    return Math.ceil(entry.quantidade / Math.max(1, numPC));
  }
  return BATTLE_POINT_COST[entry.adversary.tipo] * entry.quantidade;
}

/**
 * Gera uma lista de entradas balanceadas para um encontro usando adversárias
 * do bestiário oficial. Algoritmo:
 * 1. Se orçamento permite, âncora com solo ou brutamonte.
 * 2. Preenche com tipos variados (embaralhados) até esgotar o orçamento.
 * 3. Adiciona horda se restar ≥ 2 PB.
 * 4. Preenchimento final com lacaios (conjuntos do tamanho do grupo).
 */
export function generateEncounterEntries(numPC: number, patamar: Patamar): GeneratedEntry[] {
  const safeNumPC = Math.max(1, numPC);
  const budget = BASE_POINTS_PER_PC * safeNumPC + BASE_POINTS_FLAT;

  const candidates = BESTIARIO.filter((a) => a.patamar === patamar);
  if (candidates.length === 0) return [];

  const byTipo: Partial<Record<Tipo, Adversary[]>> = {};
  for (const adv of candidates) {
    (byTipo[adv.tipo] ??= []).push(adv);
  }

  const result: GeneratedEntry[] = [];
  let remaining = budget;
  const usedTipos = new Set<Tipo>();

  // Fase 1 — Âncora: solo se orçamento ≥ custo(solo) + 2, senão brutamonte
  const soloCost = BATTLE_POINT_COST.solo;
  const bruteCost = BATTLE_POINT_COST.brutamonte;

  if (byTipo.solo && remaining >= soloCost + 2) {
    const adv = pick(byTipo.solo);
    result.push({ adversary: adv, adversaryRef: adv.id, origem: 'bestiario', quantidade: 1 });
    remaining -= soloCost;
    usedTipos.add('solo');
  } else if (byTipo.brutamonte && remaining >= bruteCost + 2) {
    const adv = pick(byTipo.brutamonte);
    result.push({ adversary: adv, adversaryRef: adv.id, origem: 'bestiario', quantidade: 1 });
    remaining -= bruteCost;
    usedTipos.add('brutamonte');
  }

  // Fase 2 — Preenchimento variado (tipos embaralhados, exclui âncora, horda, lacaio)
  const fillTipos = shuffle(
    (['lider', 'atirador', 'oportunista', 'comum', 'manipulador', 'assistente', 'brutamonte'] as Tipo[]).filter(
      (t) => !usedTipos.has(t) && byTipo[t] && byTipo[t]!.length > 0,
    ),
  );

  for (const tipo of fillTipos) {
    if (remaining <= 0) break;
    const cost = BATTLE_POINT_COST[tipo];
    if (remaining < cost) continue;

    const maxAffordable = Math.floor(remaining / cost);
    const cap = MAX_QTY[tipo];
    const maxQty = Math.min(maxAffordable, cap);
    // Tipos mais baratos (≤ 2 PB) podem ter 1–2 unidades; mais caros ficam em 1
    const qty = cost <= 2 ? 1 + Math.floor(Math.random() * Math.min(2, maxQty - 1 + 1)) : 1;

    const adv = pick(byTipo[tipo]!);
    result.push({ adversary: adv, adversaryRef: adv.id, origem: 'bestiario', quantidade: qty });
    remaining -= cost * qty;
    usedTipos.add(tipo);
  }

  // Fase 3 — Horda com orçamento restante ≥ 2 PB
  if (remaining >= 2 && byTipo.horda && !usedTipos.has('horda')) {
    const adv = pick(byTipo.horda);
    result.push({ adversary: adv, adversaryRef: adv.id, origem: 'bestiario', quantidade: 1 });
    remaining -= BATTLE_POINT_COST.horda;
    usedTipos.add('horda');
  }

  // Fase 4 — Lacaios para absorver 1 PB restante por conjunto de tamanho numPC
  if (remaining >= 1 && byTipo.lacaio && !usedTipos.has('lacaio')) {
    // ceil(qty / numPC) = remaining  →  qty = remaining * numPC (conjuntos completos)
    const qty = remaining * safeNumPC;
    const adv = pick(byTipo.lacaio);
    result.push({ adversary: adv, adversaryRef: adv.id, origem: 'bestiario', quantidade: qty });
    remaining = 0;
  }

  return result;
}
