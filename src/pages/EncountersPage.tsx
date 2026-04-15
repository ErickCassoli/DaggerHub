import { Link } from 'react-router-dom';
import { AppHeader } from '@/components/nav/AppHeader';
import { Button } from '@/components/ui/Button';
import { useEncounterLibrary } from '@/hooks/useEncounterLibrary';
import { useAdversaryLibrary } from '@/hooks/useAdversaryLibrary';
import { resolveAdversary } from '@/lib/adversarySources';
import { calculateBudget, encounterCost, balanceVerdict } from '@/lib/encounter';
import { exportEncounterJson } from '@/lib/encounterExport';
import type { Encounter } from '@/types/encounter';

export function EncountersPage() {
  const { items, remove, duplicate } = useEncounterLibrary();
  const { items: biblioteca } = useAdversaryLibrary();

  const confirmDelete = (enc: Encounter) => {
    if (confirm(`Excluir "${enc.nome || 'encontro'}"? Essa ação não pode ser desfeita.`)) {
      remove(enc.id);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <AppHeader
        subtitle="Construtor de encontros — Livro Básico p.197"
        actions={
          <Link to="/encounters/new">
            <Button>+ Novo encontro</Button>
          </Link>
        }
      />

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-ink/30 bg-white/40 p-8 text-center">
          <p className="text-ink/70">Nenhum encontro salvo ainda.</p>
          <p className="mt-1 text-sm text-ink/60">Crie o primeiro no botão acima.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((enc) => {
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
                className="flex flex-col justify-between rounded-md border border-ink/20 bg-white/60 p-4 shadow-sm"
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
                    <span className="uppercase">{verdict}</span>
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
    </div>
  );
}
