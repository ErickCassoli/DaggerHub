import type { Adversary } from '@/types/adversary';
import { Button } from '@/components/ui/Button';
import { StatsBlock } from '@/components/StatsBlock/StatsBlock';

interface BestiarioCardProps {
  adversary: Adversary;
  onCopy: () => void;
}

export function BestiarioCard({ adversary, onCopy }: BestiarioCardProps) {
  return (
    <article className="flex flex-col items-center gap-3">
      <div className="relative">
        <span className="absolute -top-2 -right-2 z-10 rounded bg-gold/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink shadow">
          oficial
        </span>
        <StatsBlock adversary={adversary} />
      </div>

      <div className="flex w-[450px] max-w-full flex-wrap items-center gap-2">
        <Button size="sm" variant="primary" onClick={onCopy}>
          Copiar para minha biblioteca
        </Button>
      </div>
    </article>
  );
}
