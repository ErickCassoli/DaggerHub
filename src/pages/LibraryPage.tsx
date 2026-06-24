import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import type { Adversary, Patamar, Tipo } from '@/types/adversary';
import type { Encounter } from '@/types/encounter';
import type { Ambiente } from '@/types/ambiente';
import type { Transformacao } from '@/types/transformacao';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AppHeader } from '@/components/nav/AppHeader';
import { LibraryGrid } from '@/components/library/LibraryGrid';
import { ImportButton } from '@/components/library/ImportButton';
import { BundleButtons } from '@/components/library/BundleButtons';
import { ConvertFrom5eModal } from '@/components/library/ConvertFrom5eModal';
import { ExportFavoritesButton } from '@/components/library/ExportFavoritesButton';
import { useAdversaryLibrary } from '@/hooks/useAdversaryLibrary';
import { useEncounterLibrary } from '@/hooks/useEncounterLibrary';
import { useAmbienteLibrary } from '@/hooks/useAmbienteLibrary';
import { useTransformacaoLibrary } from '@/hooks/useTransformacaoLibrary';
import { useLibraryFavorites } from '@/hooks/useLibraryFavorites';
import { exportJson } from '@/lib/export';
import { TIPOS } from '@/data/tipos';
import { PATAMARES } from '@/data/patamares';
import { normalizeSearch } from '@/lib/normalize';

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

function toggleSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function LibraryPage() {
  const navigate = useNavigate();
  const { items, remove, duplicate, importOne, reTier } = useAdversaryLibrary();
  const { importOne: importEncounter } = useEncounterLibrary();
  const { importOne: importAmbiente } = useAmbienteLibrary();
  const { importOne: importTransformacao } = useTransformacaoLibrary();
  const { favorites, toggle } = useLibraryFavorites();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedTipos, setSelectedTipos] = useState<Set<Tipo>>(new Set());
  const [selectedPatamares, setSelectedPatamares] = useState<Set<Patamar>>(new Set());
  const [sortKey, setSortKey] = useState<'recente' | 'nome'>('recente');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [convertOpen, setConvertOpen] = useState(false);

  const favoriteItems = useMemo(
    () => items.filter((i) => favorites.has(i.id)),
    [items, favorites],
  );

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach((adv) => (adv.tags ?? []).forEach((t) => tagSet.add(t)));
    return [...tagSet].sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = normalizeSearch(query.trim());
    const base = showFavoritesOnly ? favoriteItems : items;
    const filtered = base.filter((adv) => {
      if (selectedTipos.size > 0 && !selectedTipos.has(adv.tipo)) return false;
      if (selectedPatamares.size > 0 && !selectedPatamares.has(adv.patamar)) return false;
      if (selectedTags.size > 0 && !(adv.tags ?? []).some((t) => selectedTags.has(t))) return false;
      if (!q) return true;
      return normalizeSearch(`${adv.nome} ${adv.descricao ?? ''}`).includes(q);
    });
    if (sortKey === 'nome') {
      return [...filtered].sort((a, b) =>
        normalizeSearch(a.nome).localeCompare(normalizeSearch(b.nome)),
      );
    }
    return [...filtered].sort(
      (a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime(),
    );
  }, [items, favoriteItems, showFavoritesOnly, query, selectedTipos, selectedPatamares, sortKey, selectedTags]);

  const hasActiveFilters =
    query.trim() !== '' || selectedTipos.size > 0 || selectedPatamares.size > 0 || selectedTags.size > 0;

  const confirmDelete = (id: string) => {
    const adv = items.find((i) => i.id === id);
    const ok = confirm(`Excluir "${adv?.nome ?? 'adversária'}"? Essa ação não pode ser desfeita.`);
    if (ok) remove(id);
  };

  const handleReTier = (id: string, newPatamar: Patamar) => {
    const copy = reTier(id, newPatamar);
    if (copy) {
      setToast(`"${copy.nome}" adicionada à biblioteca.`);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleBundleImport = (
    adversarias: Adversary[],
    encontros: Encounter[],
    ambientes: Ambiente[],
    transformacoes: Transformacao[],
  ) => {
    adversarias.forEach((a) => importOne(a));
    encontros.forEach((e) => importEncounter(e));
    ambientes.forEach((a) => importAmbiente(a));
    transformacoes.forEach((t) => importTransformacao(t));
    const parts = [
      adversarias.length > 0 ? `${adversarias.length} adversária${adversarias.length !== 1 ? 's' : ''}` : '',
      encontros.length > 0 ? `${encontros.length} encontro${encontros.length !== 1 ? 's' : ''}` : '',
      ambientes.length > 0 ? `${ambientes.length} ambiente${ambientes.length !== 1 ? 's' : ''}` : '',
      transformacoes.length > 0 ? `${transformacoes.length} transformação${transformacoes.length !== 1 ? 'ões' : ''}` : '',
    ].filter(Boolean);
    setToast(`Pacote importado: ${parts.join(', ')}.`);
    setTimeout(() => setToast(null), 4000);
  };

  const handleConvert5e = (adversary: Adversary) => {
    const added = importOne(adversary);
    navigate(`/edit/${added.id}`);
  };

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <AppHeader
        subtitle="Biblioteca do usuário — adversárias salvas localmente"
        actions={
          <>
            <BundleButtons onImport={handleBundleImport} />
            <ImportButton onImport={importOne} />
            <Button variant="secondary" onClick={() => setConvertOpen(true)}>
              Converter de 5e
            </Button>
            <Link to="/new">
              <Button>+ Nova adversária</Button>
            </Link>
          </>
        }
      />

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
            active={selectedTipos.has(t.value)}
            onClick={() => setSelectedTipos((prev) => toggleSet(prev, t.value))}
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
            active={selectedPatamares.has(p.value)}
            onClick={() => setSelectedPatamares((prev) => toggleSet(prev, p.value))}
          >
            {p.label}
          </FilterChip>
        ))}
        {hasActiveFilters ? (
          <button
            onClick={() => {
              setQuery('');
              setSelectedTipos(new Set());
              setSelectedPatamares(new Set());
              setSelectedTags(new Set());
            }}
            className="ml-1 text-sm text-ink/60 underline hover:text-ink/80"
          >
            Limpar filtros
          </button>
        ) : null}
      </div>

      {allTags.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className="field-label mr-1">Tags:</span>
          {allTags.map((tag) => (
            <FilterChip
              key={tag}
              active={selectedTags.has(tag)}
              onClick={() => setSelectedTags((prev) => toggleSet(prev, tag))}
            >
              {tag}
            </FilterChip>
          ))}
        </div>
      )}

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
          {favoriteItems.length > 0 && (
            <span className="rounded-full bg-ink/10 px-1.5 py-0.5 text-xs leading-none">
              {favoriteItems.length}
            </span>
          )}
        </button>
        <ExportFavoritesButton adversaries={favoriteItems} filename="favoritos-biblioteca" />
        <div className="ml-auto flex items-center gap-1">
          {(['recente', 'nome'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setSortKey(k)}
              aria-pressed={sortKey === k}
              className={clsx(
                'rounded border px-2.5 py-0.5 text-sm font-semibold transition-colors',
                sortKey === k
                  ? 'border-gold bg-gold/20 text-amber-800'
                  : 'border-ink/30 bg-parchment text-ink/60 hover:border-gold/50 hover:text-ink/80',
              )}
            >
              {k === 'recente' ? 'Recente' : 'A–Z'}
            </button>
          ))}
        </div>
      </div>

      {toast ? (
        <p className="mb-3 rounded border border-green-800/30 bg-green-50 px-3 py-2 text-sm text-green-900 dark:border-green-700/30 dark:bg-green-950 dark:text-green-200">
          {toast}
        </p>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-ink/30 bg-white/40 dark:bg-white/5 p-10 text-center">
          <p className="text-lg text-ink/70">Biblioteca vazia</p>
          <p className="mt-2 text-sm text-ink/60">
            Crie sua primeira adversária ou copie uma pronta do bestiário oficial.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link to="/new">
              <Button>+ Nova adversária</Button>
            </Link>
            <Link to="/bestiario">
              <Button variant="secondary">Ver bestiário</Button>
            </Link>
          </div>
        </div>
      ) : showFavoritesOnly && favoriteItems.length === 0 ? (
        <div className="rounded-md border border-dashed border-ink/30 bg-white/40 dark:bg-white/5 p-8 text-center">
          <p className="text-ink/70">Nenhum favorito salvo ainda.</p>
          <p className="mt-1 text-sm text-ink/60">
            Use o botão ☆ em qualquer adversária para marcá-la como favorita.
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-md border border-dashed border-ink/30 bg-white/40 dark:bg-white/5 p-8 text-center">
          <p className="text-ink/70">
            {query.trim()
              ? `Nenhuma adversária encontrada para "${query}".`
              : 'Nenhuma adversária corresponde aos filtros ativos.'}
          </p>
          <button
            onClick={() => {
              setQuery('');
              setSelectedTipos(new Set());
              setSelectedPatamares(new Set());
              setSelectedTags(new Set());
            }}
            className="mt-2 text-sm text-gold hover:underline"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <LibraryGrid
          items={filteredItems}
          favorites={favorites}
          onToggleFavorite={toggle}
          onDuplicate={(id) => duplicate(id)}
          onDelete={confirmDelete}
          onExportJson={(adv) => exportJson(adv)}
          onReTier={handleReTier}
        />
      )}

      <ConvertFrom5eModal
        open={convertOpen}
        onClose={() => setConvertOpen(false)}
        onConvert={handleConvert5e}
      />
    </div>
  );
}
