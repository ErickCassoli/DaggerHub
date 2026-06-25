import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import clsx from 'clsx';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AppHeader } from '@/components/nav/AppHeader';
import { AmbienteCard } from '@/components/ambiente/AmbienteCard';
import { AmbienteImportButton } from '@/components/ambiente/AmbienteImportButton';
import { useAmbienteLibrary } from '@/hooks/useAmbienteLibrary';
import { useEncounterLibrary } from '@/hooks/useEncounterLibrary';
import { exportAmbienteJson } from '@/lib/ambienteExport';
import { normalizeSearch } from '@/lib/normalize';
import { AMBIENTE_TIPOS } from '@/data/ambienteTipos';
import type { AmbienteTipo, Ambiente } from '@/types/ambiente';
import type { Encounter, EncounterEntry } from '@/types/encounter';

type SortKey = 'recente' | 'nome';

// Patamar → nivelPC: Livro Básico — Patamar 1 é níveis 1-2, Patamar 2 é 3-5,
// Patamar 3 é 6-8, Patamar 4 é 9-10.
const PATAMAR_TO_NIVEL: Record<number, number> = { 1: 1, 2: 3, 3: 6, 4: 9 };

function buildEncounterFromAmbiente(amb: Ambiente): Encounter {
  const entries: EncounterEntry[] = amb.adversariosSugeridos.map((ref) => ({
    id: nanoid(8),
    adversaryRef: ref.adversaryRef,
    origem: ref.origem,
    quantidade: 1,
  }));
  return {
    id: nanoid(10),
    nome: `Encontro — ${amb.nome}`,
    descricao: '',
    party: { numPC: 4, nivelPC: PATAMAR_TO_NIVEL[amb.patamar] ?? 1 },
    ajustes: [],
    entries,
    notas: '',
    criadoEm: '',
    atualizadoEm: '',
  };
}

export function AmbientesPage() {
  const navigate = useNavigate();
  const { items, remove, duplicate, importOne } = useAmbienteLibrary();
  const { upsert: upsertEncounter } = useEncounterLibrary();
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

  const handleCreateEncounter = (amb: Ambiente) => {
    const enc = buildEncounterFromAmbiente(amb);
    const saved = upsertEncounter(enc);
    navigate(`/encounters/edit/${saved.id}`);
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
                    onCreateEncounter={() => handleCreateEncounter(amb)}
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
