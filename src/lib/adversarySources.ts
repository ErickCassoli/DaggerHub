import type { Adversary } from '@/types/adversary';
import type { EncounterEntry } from '@/types/encounter';
import { BESTIARIO, findBestiarioEntry } from '@/data/bestiario';

export interface AdversarySearchResult {
  adversary: Adversary;
  origem: EncounterEntry['origem'];
}

export function resolveAdversary(
  ref: string,
  origem: EncounterEntry['origem'],
  biblioteca: Adversary[],
): Adversary | undefined {
  if (origem === 'bestiario') return findBestiarioEntry(ref);
  return biblioteca.find((a) => a.id === ref);
}

interface SearchOptions {
  query?: string;
  origem?: 'todos' | 'biblioteca' | 'bestiario';
  tipo?: Adversary['tipo'];
  patamar?: Adversary['patamar'];
}

export function searchAdversaries(
  biblioteca: Adversary[],
  options: SearchOptions = {},
): AdversarySearchResult[] {
  const { query, origem = 'todos', tipo, patamar } = options;
  const q = query?.trim().toLowerCase() ?? '';

  const fromLibrary: AdversarySearchResult[] =
    origem === 'bestiario'
      ? []
      : biblioteca.map((adversary) => ({ adversary, origem: 'biblioteca' as const }));

  const fromBestiary: AdversarySearchResult[] =
    origem === 'biblioteca'
      ? []
      : BESTIARIO.map((adversary) => ({ adversary, origem: 'bestiario' as const }));

  const all = [...fromLibrary, ...fromBestiary];

  return all.filter(({ adversary }) => {
    if (tipo && adversary.tipo !== tipo) return false;
    if (patamar && adversary.patamar !== patamar) return false;
    if (!q) return true;
    const haystack = `${adversary.nome} ${adversary.descricao ?? ''} ${adversary.motivacoes?.join(' ') ?? ''}`.toLowerCase();
    return haystack.includes(q);
  });
}

/** Converte uma entrada do bestiário em uma nova adversária da biblioteca do usuário. */
export function cloneBestiarioToLibrary(
  bestiarioEntry: Adversary,
  newId: string,
): Adversary {
  const now = new Date().toISOString();
  return {
    ...bestiarioEntry,
    id: newId,
    criadoEm: now,
    atualizadoEm: now,
  };
}
