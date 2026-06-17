import { useRef, useState } from 'react';
import clsx from 'clsx';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { Button } from '@/components/ui/Button';
import { TIER_BASELINES } from '@/data/baselines';
import {
  BATTLE_POINT_COST,
  ADJUSTMENTS,
  BASE_POINTS_PER_PC,
  BASE_POINTS_FLAT,
} from '@/data/encounterRules';
import { TIPO_LABEL } from '@/data/tipos';
import { PATAMARES } from '@/data/patamares';
import type { Patamar, Tipo } from '@/types/adversary';

interface QuickRefModalProps {
  open: boolean;
  onClose: () => void;
}

/** Tipos ordenados por custo de PB crescente, depois por função. */
const TIPO_ORDER: Tipo[] = [
  'lacaio',
  'assistente',
  'manipulador',
  'horda',
  'atirador',
  'oportunista',
  'comum',
  'lider',
  'brutamonte',
  'solo',
];

export function QuickRefModal({ open, onClose }: QuickRefModalProps) {
  const [activePatamar, setActivePatamar] = useState<Patamar>(1);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open, onClose);

  if (!open) return null;

  const baseline = TIER_BASELINES[activePatamar];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 dark:bg-black/60 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quickref-modal-title"
        className="flex max-h-[calc(100vh-1rem)] w-full max-w-3xl flex-col rounded-md border border-ink/30 bg-parchment shadow-xl sm:max-h-[min(90vh,700px)]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-ink/20 px-4 py-3">
          <h2 id="quickref-modal-title" className="font-display text-lg uppercase tracking-wide text-ink">
            Referência Rápida
          </h2>
          <Button size="sm" variant="ghost" onClick={onClose} aria-label="Fechar">
            ✕
          </Button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          {/* Orçamento */}
          <section>
            <h3 className="mb-2 font-display text-xs uppercase tracking-wider text-ink/60">
              Orçamento de Batalha
            </h3>
            <div className="rounded border border-ink/20 bg-white/40 dark:bg-white/5 px-4 py-3 text-center">
              <p className="font-semibold text-ink">
                PB = {BASE_POINTS_PER_PC} × nº de PCs + {BASE_POINTS_FLAT} + ajustes
              </p>
            </div>
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="border-b border-ink/20">
                  <th className="py-1 text-left font-semibold text-ink">Ajuste</th>
                  <th className="w-16 py-1 text-center font-semibold text-ink">Delta</th>
                </tr>
              </thead>
              <tbody>
                {ADJUSTMENTS.map((adj) => (
                  <tr key={adj.key} className="border-b border-ink/10">
                    <td className="py-1.5 text-ink/80">{adj.label}</td>
                    <td
                      className={clsx(
                        'py-1.5 text-center font-mono font-semibold',
                        adj.delta > 0
                          ? 'text-green-800 dark:text-green-400'
                          : 'text-red-800 dark:text-red-400',
                      )}
                    >
                      {adj.delta > 0 ? `+${adj.delta}` : adj.delta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Custo por tipo */}
          <section>
            <h3 className="mb-2 font-display text-xs uppercase tracking-wider text-ink/60">
              Custo em Pontos de Batalha por Tipo
            </h3>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {TIPO_ORDER.map((tipo) => (
                <div
                  key={tipo}
                  className="flex items-center justify-between rounded border border-ink/20 bg-white/40 dark:bg-white/5 px-3 py-1.5"
                >
                  <span className="text-sm text-ink">{TIPO_LABEL[tipo]}</span>
                  <span className="ml-2 font-mono font-semibold text-ink">
                    {tipo === 'lacaio'
                      ? '1 PB/grupo'
                      : `${BATTLE_POINT_COST[tipo]} PB`}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-ink/50">
              Lacaio: 1 PB por grupo igual ao nº de PCs (ceil(qtd / nPCs)).
            </p>
          </section>

          {/* Baselines por patamar */}
          <section>
            <h3 className="mb-2 font-display text-xs uppercase tracking-wider text-ink/60">
              Estatísticas de Referência por Patamar
            </h3>
            <div className="mb-3 flex gap-1">
              {PATAMARES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setActivePatamar(p.value)}
                  className={clsx(
                    'rounded px-3 py-1 text-sm font-semibold uppercase tracking-wide transition-colors',
                    activePatamar === p.value
                      ? 'bg-ink text-parchment shadow-[0_2px_0_#a3802e]'
                      : 'text-ink/70 hover:bg-ink/10',
                  )}
                >
                  {p.value}º
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-ink/20 text-ink">
                    <th className="py-1 text-left font-semibold">Tipo</th>
                    <th className="py-1 text-center font-semibold">Dif.</th>
                    <th className="py-1 text-center font-semibold">PV</th>
                    <th className="py-1 text-center font-semibold">PF</th>
                    <th className="py-1 text-center font-semibold">ATQ</th>
                    <th className="py-1 text-center font-semibold">L.Maior</th>
                    <th className="py-1 text-center font-semibold">L.Grave</th>
                    <th className="py-1 text-left font-semibold">Dano ref.</th>
                  </tr>
                </thead>
                <tbody>
                  {TIPO_ORDER.map((tipo) => {
                    const b = baseline[tipo];
                    return (
                      <tr key={tipo} className="border-b border-ink/10 hover:bg-white/30 dark:hover:bg-white/5">
                        <td className="py-1.5 font-medium text-ink">{TIPO_LABEL[tipo]}</td>
                        <td className="py-1.5 text-center text-ink/80">{b.dificuldade}</td>
                        <td className="py-1.5 text-center text-ink/80">{b.pv}</td>
                        <td className="py-1.5 text-center text-ink/80">{b.pf}</td>
                        <td className="py-1.5 text-center font-mono text-ink/80">
                          {b.atq >= 0 ? `+${b.atq}` : b.atq}
                        </td>
                        <td className="py-1.5 text-center text-ink/80">
                          {b.limiarMaior ?? '—'}
                        </td>
                        <td className="py-1.5 text-center text-ink/80">
                          {b.limiarGrave ?? '—'}
                        </td>
                        <td className="py-1.5 text-ink/80">{b.danoSugerido}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
