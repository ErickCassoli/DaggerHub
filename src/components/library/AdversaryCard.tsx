import { Link } from 'react-router-dom';
import clsx from 'clsx';
import type { Adversary, Patamar } from '@/types/adversary';
import { Button } from '@/components/ui/Button';
import { StatsBlock } from '@/components/StatsBlock/StatsBlock';
import { FitBlock } from '@/components/StatsBlock/FitBlock';
import { PATAMARES } from '@/data/patamares';

interface AdversaryCardProps {
  adversary: Adversary;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onExportJson: () => void;
  onReTier: (newPatamar: Patamar) => void;
}

export function AdversaryCard({
  adversary,
  isFavorite,
  onToggleFavorite,
  onDuplicate,
  onDelete,
  onExportJson,
  onReTier,
}: AdversaryCardProps) {
  return (
    <article className="flex w-full flex-col items-center gap-3">
      <FitBlock>
        <StatsBlock adversary={adversary} />
      </FitBlock>

      <div className="flex w-full max-w-[450px] flex-wrap items-center gap-2">
        <button
          onClick={onToggleFavorite}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          aria-pressed={isFavorite}
          title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className={clsx(
            'rounded border px-2 py-1 text-base leading-none transition-colors',
            isFavorite
              ? 'border-gold bg-gold/20 text-amber-700 hover:bg-gold/30'
              : 'border-ink/30 bg-parchment text-ink/40 hover:border-gold/60 hover:text-amber-600',
          )}
        >
          {isFavorite ? '★' : '☆'}
        </button>
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
