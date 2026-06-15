import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AppHeader } from '@/components/nav/AppHeader';
import { AmbienteCard } from '@/components/ambiente/AmbienteCard';
import { AmbienteImportButton } from '@/components/ambiente/AmbienteImportButton';
import { useAmbienteLibrary } from '@/hooks/useAmbienteLibrary';
import { exportAmbienteJson } from '@/lib/ambienteExport';
import { normalizeSearch } from '@/lib/normalize';
import { AMBIENTE_TIPOS } from '@/data/ambienteTipos';
import type { AmbienteTipo } from '@/types/ambiente';

type SortKey = 'recente' | 'nome';

export function AmbientesPage() {
  const { items, remove, duplicate, importOne } = useAmbienteLibrary();
  const [query, setQuery] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<AmbienteTipo | ''>('');
  const [sortKey, setSortKey] = useState<SortKey>('recente');

  const filtered = useMemo(() => {
    const q = normalizeSearch(query.trim());
    let base = items;
    if (selectedTipo) {
      base = base.filter((amb) => amb.tipo === selectedTipo);
    }
    if (q) {
      base = base.filter((amb) =>
        normalizeSearch(`${amb.nome} ${amb.descricao ?? ''}`).includes(q),
      );
    }
    if (sortKey === 'nome') {
      base = [...base].sort((a, b) =>
        normalizeSearch(a.nome).localeCompare(normalizeSearch(b.nome)),
      );
    } else {
      base = [...base].sort(
        (a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime(),
      );
    }
    return base;
  }, [items, query, selectedTipo, sortKey]);

  const confirmDelete = (id: string) => {
    const amb = items.find((i) => i.id === id);
    const ok = confirm(`Excluir "${amb?.nome ?? 'ambiente'}"? Essa ação não pode ser desfeita.`);
    if (ok) remove(id);
  };

  const hasFilters = !!query.trim() || !!selectedTipo;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <AppHeader
        subtitle="Ambientes — pedaços de cena com regras próprias (Livro Básico p.240)"
        actions={
          <>
            <AmbienteImportButton onImport={importOne} />
            <Link to="/ambientes/new">
              <Button>+ Novo ambiente</Button>
            </Link>
          </>
        }
      />

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-ink/30 bg-white/40 dark:bg-white/5 p-8 text-center">
          <p className="text-ink/70">Nenhum ambiente salvo ainda.</p>
          <p className="mt-1 text-sm text-ink/60">Crie o primeiro no botão acima.</p>
        </div>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[180px] max-w-xs">
              <Input
                type="search"
                placeholder="Buscar ambientes…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Buscar ambientes"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1">
              <button
                onClick={() => setSelectedTipo('')}
                aria-pressed={selectedTipo === ''}
                className={clsx(
                  'rounded border px-2.5 py-0.5 text-sm font-semibold transition-colors',
                  selectedTipo === ''
                    ? 'border-gold bg-gold/20 text-amber-800 dark:text-amber-400'
                    : 'border-ink/30 bg-parchment text-ink/60 hover:border-gold/50 hover:text-ink/80',
                )}
              >
                Todos
              </button>
              {AMBIENTE_TIPOS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setSelectedTipo(selectedTipo === t.value ? '' : t.value)}
                  aria-pressed={selectedTipo === t.value}
                  className={clsx(
                    'rounded border px-2.5 py-0.5 text-sm font-semibold transition-colors',
                    selectedTipo === t.value
                      ? 'border-gold bg-gold/20 text-amber-800 dark:text-amber-400'
                      : 'border-ink/30 bg-parchment text-ink/60 hover:border-gold/50 hover:text-ink/80',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              {(['recente', 'nome'] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setSortKey(k)}
                  aria-pressed={sortKey === k}
                  className={clsx(
                    'rounded border px-2.5 py-0.5 text-sm font-semibold transition-colors',
                    sortKey === k
                      ? 'border-gold bg-gold/20 text-amber-800 dark:text-amber-400'
                      : 'border-ink/30 bg-parchment text-ink/60 hover:border-gold/50 hover:text-ink/80',
                  )}
                >
                  {k === 'recente' ? 'Recente' : 'A–Z'}
                </button>
              ))}
            </div>

            {hasFilters && (
              <p className="text-sm text-ink/60">
                {filtered.length} de {items.length}
              </p>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-md border border-dashed border-ink/30 bg-white/40 dark:bg-white/5 p-8 text-center">
              <p className="text-ink/70">Nenhum ambiente encontrado.</p>
              <button
                onClick={() => { setQuery(''); setSelectedTipo(''); }}
                className="mt-2 text-sm text-gold hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {filtered.map((amb) => (
                <div key={amb.id}>
                  <AmbienteCard
                    ambiente={amb}
                    onDuplicate={() => duplicate(amb.id)}
                    onDelete={() => confirmDelete(amb.id)}
                    onExportJson={() => exportAmbienteJson(amb)}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
