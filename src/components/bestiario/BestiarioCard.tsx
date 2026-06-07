import clsx from 'clsx';
import type { Adversary, Patamar } from '@/types/adversary';
import { Button } from '@/components/ui/Button';
import { StatsBlock } from '@/components/StatsBlock/StatsBlock';
import { PATAMARES } from '@/data/patamares';

interface BestiarioCardProps {
  adversary: Adversary;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onCopy: () => void;
  onCopyAsTier: (newPatamar: Patamar) => void;
}

export function BestiarioCard({
  adversary,
  isFavorite,
  onToggleFavorite,
  onCopy,
  onCopyAsTier,
}: BestiarioCardProps) {
  return (
    <article className="flex w-full flex-col items-center gap-3">
      <div className="relative w-full max-w-[450px] overflow-x-auto">
        <span className="absolute top-2 right-2 z-10 rounded bg-gold/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink shadow">
          oficial
        </span>
        <StatsBlock adversary={adversary} />
      </div>

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

        <Button size="sm" variant="primary" onClick={onCopy}>
          Copiar para minha biblioteca
        </Button>
        <select
          value=""
          aria-label="Copiar adversária para outro patamar"
          onChange={(e) => {
            const val = Number(e.target.value) as Patamar;
            if (val) onCopyAsTier(val);
          }}
          className="rounded border border-ink/30 bg-parchment px-2 py-1 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-ink/40"
        >
          <option value="" disabled>Copiar como patamar…</option>
          {PATAMARES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>
    </article>
  );
}
