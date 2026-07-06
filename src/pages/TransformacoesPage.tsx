import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AppHeader } from '@/components/nav/AppHeader';
import { TransformacaoCard } from '@/components/transformacao/TransformacaoCard';
import { TransformacaoImportButton } from '@/components/transformacao/TransformacaoImportButton';
import { useTransformacaoLibrary } from '@/hooks/useTransformacaoLibrary';
import { exportTransformacaoJson } from '@/lib/transformacaoExport';
import { normalizeSearch } from '@/lib/normalize';

type SortKey = 'recente' | 'nome';

export function TransformacoesPage() {
  const { items, remove, duplicate, importOne } = useTransformacaoLibrary();
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('recente');

  const filtered = useMemo(() => {
    const q = normalizeSearch(query.trim());
    let base = items;
    if (q) {
      base = base.filter((t) =>
        normalizeSearch(`${t.nome} ${t.descricao ?? ''}`).includes(q),
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
  }, [items, query, sortKey]);

  const confirmDelete = (id: string) => {
    const t = items.find((i) => i.id === id);
    const ok = confirm(
      `Excluir "${t?.nome ?? 'transformação'}"? Essa ação não pode ser desfeita.`,
    );
    if (ok) remove(id);
  };

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <AppHeader
        subtitle="Transformações — modificadores para personagens e adversárias (Hope & Fear)"
        actions={
          <>
            <TransformacaoImportButton onImport={importOne} />
            <Link to="/transformacoes/new">
              <Button>+ Nova transformação</Button>
            </Link>
          </>
        }
      />

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-ink/30 bg-white/40 dark:bg-white/5 p-10 text-center">
          <p className="text-lg text-ink/70">Nenhuma transformação salva ainda</p>
          <p className="mt-2 text-sm text-ink/60">
            Crie a primeira transformação para modificar personagens ou adversárias.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link to="/transformacoes/new">
              <Button>+ Nova transformação</Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[180px] max-w-xs">
              <Input
                type="search"
                placeholder="Buscar transformações…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Buscar transformações"
              />
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
            {query && (
              <p className="text-sm text-ink/60">
                {filtered.length} de {items.length}
              </p>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-md border border-dashed border-ink/30 bg-white/40 dark:bg-white/5 p-8 text-center">
              <p className="text-ink/70">Nenhuma transformação encontrada para "{query}".</p>
              <button
                onClick={() => setQuery('')}
                className="mt-2 text-sm text-gold hover:underline"
              >
                Limpar busca
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {filtered.map((t) => (
                <div key={t.id}>
                  <TransformacaoCard
                    transformacao={t}
                    onDuplicate={() => duplicate(t.id)}
                    onDelete={() => confirmDelete(t.id)}
                    onExportJson={() => exportTransformacaoJson(t)}
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
