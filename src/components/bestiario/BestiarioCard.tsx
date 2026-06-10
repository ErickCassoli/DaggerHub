import type { Adversary, Patamar } from '@/types/adversary';
import { Button } from '@/components/ui/Button';
import { StatsBlock } from '@/components/StatsBlock/StatsBlock';
import { FitBlock } from '@/components/StatsBlock/FitBlock';
import { PATAMARES } from '@/data/patamares';

interface BestiarioCardProps {
  adversary: Adversary;
  onCopy: () => void;
  onCopyAsTier: (newPatamar: Patamar) => void;
}

export function BestiarioCard({ adversary, onCopy, onCopyAsTier }: BestiarioCardProps) {
  return (
    <article className="flex w-full flex-col items-center gap-3">
      <div className="relative w-full">
        <FitBlock>
          <StatsBlock adversary={adversary} />
        </FitBlock>
        <span className="absolute top-2 right-2 z-10 rounded bg-gold/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink shadow">
          oficial
        </span>
      </div>

      <div className="flex w-full max-w-[450px] flex-wrap items-center gap-2">
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
