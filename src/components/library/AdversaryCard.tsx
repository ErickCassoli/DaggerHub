import { Link } from 'react-router-dom';
import type { Adversary, Patamar } from '@/types/adversary';
import { Button } from '@/components/ui/Button';
import { StatsBlock } from '@/components/StatsBlock/StatsBlock';
import { PATAMARES } from '@/data/patamares';

interface AdversaryCardProps {
  adversary: Adversary;
  onDuplicate: () => void;
  onDelete: () => void;
  onExportJson: () => void;
  onReTier: (newPatamar: Patamar) => void;
}

export function AdversaryCard({ adversary, onDuplicate, onDelete, onExportJson, onReTier }: AdversaryCardProps) {
  return (
    <article className="flex w-full flex-col items-center gap-3">
      <div className="w-full max-w-[450px] overflow-x-auto">
        <StatsBlock adversary={adversary} />
      </div>

      <div className="flex w-full max-w-[450px] flex-wrap items-center gap-2">
        <Link to={`/edit/${adversary.id}`}>
          <Button size="sm" variant="primary">Editar</Button>
        </Link>
        <Button size="sm" variant="secondary" onClick={onDuplicate}>Duplicar</Button>
        <select
          value=""
          aria-label="Re-escalar adversária para outro patamar"
          onChange={(e) => {
            const val = Number(e.target.value) as Patamar;
            if (val) onReTier(val);
          }}
          className="rounded border border-ink/30 bg-parchment px-2 py-1 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-ink/40"
        >
          <option value="" disabled>Re-escalar…</option>
          {PATAMARES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <Button size="sm" variant="secondary" onClick={onExportJson}>JSON</Button>
        <Button size="sm" variant="danger" onClick={onDelete}>Excluir</Button>
      </div>
    </article>
  );
}
