import type { Adversary } from '@/types/adversary';
import type { EncounterEntry } from '@/types/encounter';
import { BESTIARIO, findBestiarioEntry } from '@/data/bestiario';
import { normalizeSearch } from '@/lib/normalize';

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
  /** Filtra adversárias da biblioteca pelo conjunto de tags (OR). Não afeta entradas do bestiário. */
  tags?: Set<string>;
}

export function searchAdversaries(
  biblioteca: Adversary[],
  options: SearchOptions = {},
): AdversarySearchResult[] {
  const { query, origem = 'todos', tipo, patamar, tags } = options;
  const q = normalizeSearch(query?.trim() ?? '');

  const fromLibrary: AdversarySearchResult[] =
    origem === 'bestiario'
      ? []
      : biblioteca.map((adversary) => ({ adversary, origem: 'biblioteca' as const }));

  const fromBestiary: AdversarySearchResult[] =
    origem === 'biblioteca'
      ? []
      : BESTIARIO.map((adversary) => ({ adversary, origem: 'bestiario' as const }));

  const all = [...fromLibrary, ...fromBestiary];

  return all.filter(({ adversary, origem: entryOrigem }) => {
    if (tipo && adversary.tipo !== tipo) return false;
    if (patamar && adversary.patamar !== patamar) return false;
    // Tags são metadados de homebrew; adversárias do bestiário não as têm.
    if (tags && tags.size > 0 && entryOrigem === 'biblioteca') {
      const advTags = adversary.tags ?? [];
      if (!advTags.some((t) => tags.has(t))) return false;
    }
    if (!q) return true;
    const haystack = normalizeSearch(
      `${adversary.nome} ${adversary.descricao ?? ''} ${adversary.motivacoes?.join(' ') ?? ''}`,
    );
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
