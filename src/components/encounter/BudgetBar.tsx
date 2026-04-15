import clsx from 'clsx';
import type { BalanceVerdict } from '@/lib/encounter';

interface BudgetBarProps {
  budget: number;
  total: number;
  verdict: BalanceVerdict;
}

const VERDICT_STYLES: Record<BalanceVerdict, { bar: string; label: string; text: string }> = {
  abaixo: {
    bar: 'bg-blue-600',
    label: 'Abaixo do orçamento',
    text: 'text-blue-900',
  },
  equilibrado: {
    bar: 'bg-green-700',
    label: 'Equilibrado',
    text: 'text-green-900',
  },
  acima: {
    bar: 'bg-red-700',
    label: 'Acima do orçamento',
    text: 'text-red-900',
  },
};

export function BudgetBar({ budget, total, verdict }: BudgetBarProps) {
  const safeBudget = Math.max(1, budget);
  const pct = Math.min(100, Math.round((Math.max(0, total) / safeBudget) * 100));
  const { bar, label, text } = VERDICT_STYLES[verdict];
  const remaining = budget - total;

  return (
    <div className="rounded-md border border-ink/20 bg-white/70 p-4 shadow-sm">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="font-display text-sm uppercase tracking-wide text-ink">
          Pontos de Batalha
        </span>
        <span className={clsx('text-sm font-semibold', text)}>{label}</span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded bg-ink/10">
        <div className={clsx('h-full transition-all', bar)} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink/80">
        <span><strong>Gasto:</strong> {total}</span>
        <span><strong>Orçamento:</strong> {budget}</span>
        <span className={clsx('font-semibold', text)}>
          <strong>Restante:</strong> {remaining}
        </span>
      </div>
    </div>
  );
}
