import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import clsx from 'clsx';
import { AppHeader } from '@/components/nav/AppHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GeneratorModal } from '@/components/encounter/GeneratorModal';
import { EncounterImportButton } from '@/components/encounter/EncounterImportButton';
import { useEncounterLibrary } from '@/hooks/useEncounterLibrary';
import { useAdversaryLibrary } from '@/hooks/useAdversaryLibrary';
import { resolveAdversary } from '@/lib/adversarySources';
import { calculateBudget, encounterCost, balanceVerdict } from '@/lib/encounter';
import { exportEncounterJson } from '@/lib/encounterExport';
import { normalizeSearch } from '@/lib/normalize';
import type { GeneratedEntry } from '@/lib/encounterGenerator';
import type { BalanceVerdict } from '@/lib/encounter';
import type { Encounter, EncounterEntry } from '@/types/encounter';
import type { Patamar } from '@/types/adversary';

const VERDICT_LABEL: Record<BalanceVerdict, string> = {
  abaixo: 'Abaixo',
  equilibrado: 'Equilibrado',
  acima: 'Acima',
};

const VERDICT_COLOR: Record<BalanceVerdict, string> = {
  abaixo: 'text-blue-700 dark:text-blue-400',
  equilibrado: 'text-green-800 dark:text-green-400',
  acima: 'text-red-700 dark:text-red-400',
};

type SortKey = 'recente' | 'nome';

export function EncountersPage() {
  const navigate = useNavigate();
  const { items, remove, duplicate, upsert, importOne } = useEncounterLibrary();
  const { items: biblioteca } = useAdversaryLibrary();
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('recente');

  const filtered = useMemo(() => {
    const q = normalizeSearch(query.trim());
    let base = items;
    if (q) {
      base = base.filter((enc) =>
        normalizeSearch(`${enc.nome} ${enc.descricao ?? ''}`).includes(q),
      );
    }
    if (sortKey === 'nome') {
      base = [...base].sort((a, b) =>
        normalizeSearch(a.nome || '').localeCompare(normalizeSearch(b.nome || '')),
      );
    } else {
      base = [...base].sort(
        (a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime(),
      );
    }
    return base;
  }, [items, query, sortKey]);

  const confirmDelete = (enc: Encounter) => {
    if (confirm(`Excluir "${enc.nome || 'encontro'}"? Essa ação não pode ser desfeita.`)) {
      remove(enc.id);
    }
  };

  const handleGenerate = (numPC: number, patamar: Patamar, generated: GeneratedEntry[]) => {
    const entries: EncounterEntry[] = generated.map((ge) => ({
      id: nanoid(8),
      adversaryRef: ge.adversaryRef,
      origem: ge.origem,
      quantidade: ge.quantidade,
    }));
    const nivelPC = patamar === 1 ? 1 : patamar === 2 ? 3 : patamar === 3 ? 6 : 9;
    const saved = upsert({
      id: nanoid(10),
      nome: '',
      descricao: '',
      party: { numPC, nivelPC },
      ajustes: [],
      entries,
      notas: '',
      criadoEm: '',
      atualizadoEm: '',
    });
    setGeneratorOpen(false);
    navigate(`/encounters/edit/${saved.id}`);
  };

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <AppHeader
        subtitle="Construtor de encontros — Livro Básico p.197"
        actions={
          <>
            <EncounterImportButton onImport={(enc) => { importOne(enc); }} />
            <Button variant="secondary" onClick={() => setGeneratorOpen(true)}>
              ✦ Gerar encontro
            </Button>
            <Link to="/encounters/new">
              <Button>+ Novo encontro</Button>
            </Link>
          </>
        }
      />

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-ink/30 bg-white/40 dark:bg-white/5 p-10 text-center">
          <p className="text-lg text-ink/70">Nenhum encontro salvo ainda</p>
          <p className="mt-2 text-sm text-ink/60">
            Monte um encontro do zero ou deixe o gerador sugerir um balanceado.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link to="/encounters/new">
              <Button>+ Novo encontro</Button>
            </Link>
            <Button variant="secondary" onClick={() => setGeneratorOpen(true)}>
              ✦ Gerar encontro
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[180px] max-w-xs">
              <Input
                type="search"
                placeholder="Buscar encontros…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Buscar encontros"
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
              <p className="text-ink/70">Nenhum encontro encontrado para "{query}".</p>
              <button
                onClick={() => setQuery('')}
                className="mt-2 text-sm text-gold hover:underline"
              >
                Limpar busca
              </button>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((enc) => {
                const budget = calculateBudget(enc.party, enc.ajustes);
                const { total } = encounterCost(
                  enc.entries,
                  (ref, origem) => resolveAdversary(ref, origem, biblioteca),
                  enc.party,
                );
                const verdict = balanceVerdict(budget, total);
                return (
                  <li
                    key={enc.id}
                    className="flex flex-col justify-between rounded-md border border-ink/20 bg-white/60 dark:bg-white/5 p-4 shadow-sm"
                  >
                    <div>
                      <h3 className="font-display text-lg uppercase tracking-wide text-ink">
                        {enc.nome || 'Sem nome'}
                      </h3>
                      {enc.descricao ? (
                        <p className="mt-1 line-clamp-2 text-sm italic text-ink/80">{enc.descricao}</p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink/70">
                        <span><strong>PCs</strong> {enc.party.numPC}</span>
                        <span><strong>Nível</strong> {enc.party.nivelPC}</span>
                        <span><strong>Adversárias</strong> {enc.entries.length}</span>
                        <span><strong>Pts</strong> {total}/{budget}</span>
                        <span className={clsx('font-semibold uppercase', VERDICT_COLOR[verdict])}>
                          {VERDICT_LABEL[verdict]}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Link to={`/encounters/edit/${enc.id}`}>
                        <Button size="sm" variant="primary">Editar</Button>
                      </Link>
                      <Button size="sm" variant="secondary" onClick={() => duplicate(enc.id)}>
                        Duplicar
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => exportEncounterJson(enc)}>
                        JSON
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => confirmDelete(enc)}>
                        Excluir
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <GeneratorModal
        open={generatorOpen}
        onClose={() => setGeneratorOpen(false)}
        onConfirm={handleGenerate}
      />
    </div>
  );
}
