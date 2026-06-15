import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { nanoid } from 'nanoid';
import clsx from 'clsx';
import { AppHeader } from '@/components/nav/AppHeader';
import { BestiarioCard } from '@/components/bestiario/BestiarioCard';
import { ExportFavoritesButton } from '@/components/library/ExportFavoritesButton';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BESTIARIO } from '@/data/bestiario';
import { TIPOS } from '@/data/tipos';
import { PATAMARES } from '@/data/patamares';
import { reTierAdversary } from '@/data/baselines';
import { useAdversaryLibrary } from '@/hooks/useAdversaryLibrary';
import { useBestiarioFavorites } from '@/hooks/useBestiarioFavorites';
import { cloneBestiarioToLibrary } from '@/lib/adversarySources';
import { normalizeSearch } from '@/lib/normalize';
import type { Adversary, Patamar, Tipo } from '@/types/adversary';

const PAGE_SIZE = 10;

/** Chip de filtro multi-seleção (tags clicáveis no lugar de dropdowns). */
function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        'rounded border px-2.5 py-0.5 text-sm font-semibold transition-colors',
        active
          ? 'border-gold bg-gold/20 text-amber-800'
          : 'border-ink/30 bg-parchment text-ink/60 hover:border-gold/50 hover:text-ink/80',
      )}
    >
      {children}
    </button>
  );
}

function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

export function BestiarioPage() {
  const { importOne } = useAdversaryLibrary();
  const { favorites, toggle } = useBestiarioFavorites();
  const [query, setQuery] = useState('');
  const [tipos, setTipos] = useState<Set<Tipo>>(new Set());
  const [patamares, setPatamares] = useState<Set<Patamar>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const results = useMemo(() => {
    const q = normalizeSearch(query.trim());
    return BESTIARIO.filter((adv) => {
      if (showFavoritesOnly && !favorites.has(adv.id)) return false;
      if (tipos.size > 0 && !tipos.has(adv.tipo)) return false;
      if (patamares.size > 0 && !patamares.has(adv.patamar)) return false;
      if (!q) return true;
      const hay = normalizeSearch(`${adv.nome} ${adv.descricao ?? ''}`);
      return hay.includes(q);
    });
  }, [query, tipos, patamares, showFavoritesOnly, favorites]);

  const favoriteItems = useMemo(
    () => BESTIARIO.filter((adv) => favorites.has(adv.id)),
    [favorites],
  );

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));

  // `favorites` fica de fora: favoritar não deve resetar a paginação
  // (o clamp abaixo cobre o caso da lista encolher no modo "só favoritas").
  useEffect(() => {
    setPage(1);
  }, [query, tipos, patamares, showFavoritesOnly]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return results.slice(start, start + PAGE_SIZE);
  }, [results, page]);

  const onCopy = (id: string) => {
    const source = BESTIARIO.find((a) => a.id === id);
    if (!source) return;
    const copy = cloneBestiarioToLibrary(source, nanoid(10));
    importOne(copy);
    setToast(`"${copy.nome}" copiada para sua biblioteca.`);
    setTimeout(() => setToast(null), 3000);
  };

  const onCopyAsTier = (id: string, newPatamar: Patamar) => {
    const source = BESTIARIO.find((a) => a.id === id);
    if (!source) return;
    const now = new Date().toISOString();
    const copy: Adversary = {
      ...reTierAdversary(source, newPatamar),
      id: nanoid(10),
      nome: `${source.nome} (Patamar ${newPatamar})`,
      criadoEm: now,
      atualizadoEm: now,
    };
    importOne(copy);
    setToast(`"${copy.nome}" copiada para sua biblioteca.`);
    setTimeout(() => setToast(null), 3000);
  };

  const goTo = (next: number) => {
    const clamped = Math.min(Math.max(1, next), totalPages);
    setPage(clamped);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <AppHeader subtitle="Bestiário oficial — Livro Básico pp.209–239" />

      <div className="mb-3">
        <Input
          type="search"
          placeholder="Buscar por nome…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span className="field-label mr-1">Tipo:</span>
        {TIPOS.map((t) => (
          <FilterChip
            key={t.value}
            active={tipos.has(t.value)}
            onClick={() => setTipos((prev) => toggleInSet(prev, t.value))}
          >
            {t.label}
          </FilterChip>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="field-label mr-1">Patamar:</span>
        {PATAMARES.map((p) => (
          <FilterChip
            key={p.value}
            active={patamares.has(p.value)}
            onClick={() => setPatamares((prev) => toggleInSet(prev, p.value))}
          >
            {p.label}
          </FilterChip>
        ))}
        {tipos.size > 0 || patamares.size > 0 ? (
          <button
            onClick={() => {
              setTipos(new Set());
              setPatamares(new Set());
            }}
            className="ml-1 text-sm text-ink/60 underline hover:text-ink/80"
          >
            Limpar filtros
          </button>
        ) : null}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowFavoritesOnly((v) => !v)}
          aria-pressed={showFavoritesOnly}
          className={clsx(
            'flex items-center gap-1.5 rounded border px-3 py-1 text-sm font-semibold transition-colors',
            showFavoritesOnly
              ? 'border-gold bg-gold/20 text-amber-800'
              : 'border-ink/30 bg-parchment text-ink/60 hover:border-gold/50 hover:text-ink/80',
          )}
        >
          <span>{showFavoritesOnly ? '★' : '☆'}</span>
          <span>Favoritos</span>
          {favorites.size > 0 && (
            <span className="rounded-full bg-ink/10 px-1.5 py-0.5 text-xs leading-none">
              {favorites.size}
            </span>
          )}
        </button>
        <ExportFavoritesButton adversaries={favoriteItems} filename="favoritos-bestiario" />
      </div>

      {toast ? (
        <p className="mb-3 rounded border border-green-800/30 bg-green-50 px-3 py-2 text-sm text-green-900 dark:border-green-700/30 dark:bg-green-950 dark:text-green-200">
          {toast}
        </p>
      ) : null}

      {BESTIARIO.length === 0 ? (
        <div className="rounded-md border border-dashed border-ink/30 bg-white/40 dark:bg-white/5 p-8 text-center">
          <p className="text-ink/70">O bestiário ainda não foi populado.</p>
          <p className="mt-1 text-sm text-ink/60">
            As adversárias do Livro Básico (pp.209–239) serão adicionadas aqui conforme o conteúdo
            for incorporado.
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-md border border-dashed border-ink/30 bg-white/40 p-8 text-center">
          {showFavoritesOnly && favorites.size === 0 ? (
            <>
              <p className="text-ink/70">Nenhum favorito salvo ainda.</p>
              <p className="mt-1 text-sm text-ink/60">
                Use o botão ☆ em qualquer adversária para marcá-la como favorita.
              </p>
            </>
          ) : (
            <p className="text-ink/70">Nenhuma adversária corresponde aos filtros.</p>
          )}
        </div>
      ) : (
        <>
          <p className="mb-3 text-xs text-ink/60">
            Mostrando {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, results.length)} de {results.length}
          </p>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {pageItems.map((adv) => (
              <div key={adv.id}>
                <BestiarioCard
                  adversary={adv}
                  isFavorite={favorites.has(adv.id)}
                  onToggleFavorite={() => toggle(adv.id)}
                  onCopy={() => onCopy(adv.id)}
                  onCopyAsTier={(newPatamar) => onCopyAsTier(adv.id, newPatamar)}
                />
              </div>
            ))}
          </div>

          {totalPages > 1 ? (
            <nav
              aria-label="Paginação do bestiário"
              className="mt-6 flex flex-wrap items-center justify-center gap-2"
            >
              <Button
                size="sm"
                variant="secondary"
                onClick={() => goTo(page - 1)}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="px-2 text-sm text-ink/70">
                Página {page} de {totalPages}
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => goTo(page + 1)}
                disabled={page === totalPages}
              >
                Próxima
              </Button>
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}
