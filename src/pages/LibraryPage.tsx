import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import type { Adversary, Patamar } from '@/types/adversary';
import type { Encounter } from '@/types/encounter';
import type { Ambiente } from '@/types/ambiente';
import { Button } from '@/components/ui/Button';
import { AppHeader } from '@/components/nav/AppHeader';
import { LibraryGrid } from '@/components/library/LibraryGrid';
import { ImportButton } from '@/components/library/ImportButton';
import { BundleButtons } from '@/components/library/BundleButtons';
import { ConvertFrom5eModal } from '@/components/library/ConvertFrom5eModal';
import { ExportFavoritesButton } from '@/components/library/ExportFavoritesButton';
import { useAdversaryLibrary } from '@/hooks/useAdversaryLibrary';
import { useEncounterLibrary } from '@/hooks/useEncounterLibrary';
import { useAmbienteLibrary } from '@/hooks/useAmbienteLibrary';
import { useLibraryFavorites } from '@/hooks/useLibraryFavorites';
import { exportJson } from '@/lib/export';

export function LibraryPage() {
  const navigate = useNavigate();
  const { items, remove, duplicate, importOne, reTier } = useAdversaryLibrary();
  const { importOne: importEncounter } = useEncounterLibrary();
  const { importOne: importAmbiente } = useAmbienteLibrary();
  const { favorites, toggle } = useLibraryFavorites();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [convertOpen, setConvertOpen] = useState(false);

  const favoriteItems = useMemo(
    () => items.filter((i) => favorites.has(i.id)),
    [items, favorites],
  );
  const visibleItems = showFavoritesOnly ? favoriteItems : items;

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
  ) => {
    adversarias.forEach((a) => importOne(a));
    encontros.forEach((e) => importEncounter(e));
    ambientes.forEach((a) => importAmbiente(a));
    const parts = [
      adversarias.length > 0 ? `${adversarias.length} adversária${adversarias.length !== 1 ? 's' : ''}` : '',
      encontros.length > 0 ? `${encontros.length} encontro${encontros.length !== 1 ? 's' : ''}` : '',
      ambientes.length > 0 ? `${ambientes.length} ambiente${ambientes.length !== 1 ? 's' : ''}` : '',
    ].filter(Boolean);
    setToast(`Pacote importado: ${parts.join(', ')}.`);
    setTimeout(() => setToast(null), 4000);
  };

  const handleConvert5e = (adversary: Adversary) => {
    importOne(adversary);
    navigate(`/edit/${adversary.id}`);
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
              {favoriteItems.length}
            </span>
          )}
        </button>
        <ExportFavoritesButton adversaries={favoriteItems} filename="favoritos-biblioteca" />
      </div>

      {toast ? (
        <p className="mb-3 rounded border border-green-800/30 bg-green-50 px-3 py-2 text-sm text-green-900 dark:border-green-700/30 dark:bg-green-950 dark:text-green-200">
          {toast}
        </p>
      ) : null}

      {showFavoritesOnly && visibleItems.length === 0 ? (
        <div className="rounded-md border border-dashed border-ink/30 bg-white/40 dark:bg-white/5 p-8 text-center">
          <p className="text-ink/70">Nenhum favorito salvo ainda.</p>
          <p className="mt-1 text-sm text-ink/60">
            Use o botão ☆ em qualquer adversária para marcá-la como favorita.
          </p>
        </div>
      ) : (
        <LibraryGrid
          items={visibleItems}
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
