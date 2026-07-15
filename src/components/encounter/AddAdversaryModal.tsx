import { useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import type { Adversary, Patamar, Tipo } from '@/types/adversary';
import { TIPOS, TIPO_LABEL } from '@/data/tipos';
import { PATAMARES, PATAMAR_LABEL } from '@/data/patamares';
import { BATTLE_POINT_COST } from '@/data/encounterRules';
import { searchAdversaries } from '@/lib/adversarySources';
import { useBestiarioFavorites } from '@/hooks/useBestiarioFavorites';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { EncounterEntry } from '@/types/encounter';

interface AddAdversaryModalProps {
  open: boolean;
  biblioteca: Adversary[];
  onClose: () => void;
  onPick: (adversary: Adversary, origem: EncounterEntry['origem']) => void;
}

type OrigemFilter = 'todos' | 'biblioteca' | 'bestiario';

function toggleSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function AddAdversaryModal({ open, biblioteca, onClose, onPick }: AddAdversaryModalProps) {
  const [query, setQuery] = useState('');
  const [origem, setOrigem] = useState<OrigemFilter>('todos');
  const [tipo, setTipo] = useState<Tipo | ''>('');
  const [patamar, setPatamar] = useState<Patamar | ''>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const { favorites } = useBestiarioFavorites();
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open, onClose);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    biblioteca.forEach((adv) => (adv.tags ?? []).forEach((t) => tagSet.add(t)));
    return [...tagSet].sort();
  }, [biblioteca]);

  const results = useMemo(() => {
    const base = searchAdversaries(biblioteca, {
      query,
      origem,
      tipo: tipo || undefined,
      patamar: patamar || undefined,
      tags: selectedTags.size > 0 ? selectedTags : undefined,
    });
    if (!showFavoritesOnly) return base;
    return base.filter(
      ({ adversary, origem: o }) => o !== 'bestiario' || favorites.has(adversary.id),
    );
  }, [biblioteca, query, origem, tipo, patamar, showFavoritesOnly, favorites, selectedTags]);

  if (!open) return null;

  const showTagFilter = allTags.length > 0 && origem !== 'bestiario';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 dark:bg-black/60 p-2 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-adv-modal-title"
        className="flex max-h-[calc(100vh-1rem)] w-full max-w-3xl flex-col rounded-md border border-ink/30 bg-parchment shadow-xl sm:max-h-[min(90vh,800px)]"
      >
        <header className="flex items-center justify-between border-b border-ink/20 px-4 py-3">
          <h2 id="add-adv-modal-title" className="font-display text-lg uppercase tracking-wide text-ink">
            Adicionar adversária
          </h2>
          <Button size="sm" variant="ghost" onClick={onClose} aria-label="Fechar">✕</Button>
        </header>

        <div className="border-b border-ink/20 px-4 py-3 space-y-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              type="search"
              placeholder="Buscar por nome…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="sm:col-span-2 lg:col-span-2"
            />
            <Select value={origem} onChange={(e) => setOrigem(e.target.value as OrigemFilter)}>
              <option value="todos">Origem: todos</option>
              <option value="biblioteca">Biblioteca</option>
              <option value="bestiario">Bestiário</option>
            </Select>
            <div className="grid grid-cols-2 gap-2">
              <Select value={tipo} onChange={(e) => setTipo(e.target.value as Tipo | '')}>
                <option value="">Tipo</option>
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
              <Select
                value={patamar === '' ? '' : String(patamar)}
                onChange={(e) => setPatamar(e.target.value === '' ? '' : (Number(e.target.value) as Patamar))}
              >
                <option value="">Patamar</option>
                {PATAMARES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFavoritesOnly((v) => !v)}
              aria-pressed={showFavoritesOnly}
              className={clsx(
                'flex items-center gap-1.5 rounded border px-3 py-1 text-sm font-semibold transition-colors',
                showFavoritesOnly
                  ? 'border-gold bg-gold/20 text-amber-800 dark:text-amber-400'
                  : 'border-ink/30 bg-parchment dark:bg-white/5 text-ink/60 hover:border-gold/50 hover:text-ink/80',
              )}
            >
              <span>{showFavoritesOnly ? '★' : '☆'}</span>
              <span>Favoritos do bestiário</span>
              {favorites.size > 0 && (
                <span className="rounded-full bg-ink/10 px-1.5 py-0.5 text-xs leading-none">
                  {favorites.size}
                </span>
              )}
            </button>
          </div>

          {showTagFilter && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="field-label mr-1 shrink-0">Tags:</span>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTags((prev) => toggleSet(prev, tag))}
                  aria-pressed={selectedTags.has(tag)}
                  className={clsx(
                    'rounded border px-2 py-0.5 text-xs font-semibold transition-colors',
                    selectedTags.has(tag)
                      ? 'border-gold bg-gold/20 text-amber-800 dark:text-amber-400'
                      : 'border-ink/30 bg-parchment dark:bg-white/5 text-ink/60 hover:border-gold/50 hover:text-ink/80',
                  )}
                >
                  {tag}
                </button>
              ))}
              {selectedTags.size > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedTags(new Set())}
                  className="text-xs text-ink/60 underline hover:text-ink/80"
                >
                  Limpar
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {results.length === 0 ? (
            <p className="rounded border border-dashed border-ink/30 bg-white/40 dark:bg-white/5 p-6 text-center text-sm text-ink/70">
              {showFavoritesOnly
                ? 'Nenhuma adversária favoritada corresponde aos filtros. Adicione favoritos no Bestiário primeiro.'
                : selectedTags.size > 0
                  ? 'Nenhuma adversária da biblioteca tem essas tags. Ajuste os filtros ou adicione tags às adversárias na Biblioteca.'
                  : origem === 'bestiario'
                    ? 'O bestiário oficial ainda não foi populado.'
                    : 'Nada encontrado. Ajuste os filtros ou crie uma adversária na biblioteca.'}
            </p>
          ) : (
            <ul className="space-y-2">
              {results.map(({ adversary, origem: resultOrigem }) => {
                const tags = resultOrigem === 'biblioteca' ? (adversary.tags ?? []) : [];
                return (
                  <li
                    key={`${resultOrigem}:${adversary.id}`}
                    className="flex flex-wrap items-center gap-3 rounded border border-ink/20 bg-white/60 dark:bg-white/5 px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink">
                        {resultOrigem === 'bestiario' && favorites.has(adversary.id) && (
                          <span
                            className="mr-1 text-amber-500 dark:text-amber-400"
                            aria-label="Favoritada no bestiário"
                          >
                            ★
                          </span>
                        )}
                        {adversary.nome}
                        {resultOrigem === 'bestiario' ? (
                          <span className="ml-2 rounded bg-gold/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink/70">
                            oficial
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-ink/60">
                        {TIPO_LABEL[adversary.tipo]} · {PATAMAR_LABEL[adversary.patamar]} ·{' '}
                        {adversary.tipo === 'lacaio'
                          ? '1 PB / conjunto de PCs'
                          : `${BATTLE_POINT_COST[adversary.tipo]} PB`}
                      </p>
                      {tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className={clsx(
                                'rounded px-1.5 py-0.5 text-[10px] leading-none',
                                selectedTags.has(tag)
                                  ? 'bg-gold/30 text-amber-800 dark:text-amber-400'
                                  : 'bg-ink/10 text-ink/60 dark:bg-white/10 dark:text-ink/50',
                              )}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      type="button"
                      onClick={() => onPick(adversary, resultOrigem)}
                    >
                      Adicionar
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
