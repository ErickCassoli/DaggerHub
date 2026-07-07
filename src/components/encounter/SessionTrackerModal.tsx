import { useRef } from 'react';
import clsx from 'clsx';
import { Button } from '@/components/ui/Button';
import { useFocusTrap } from '@/hooks/useFocusTrap';

export interface InstanceState {
  key: string;
  nome: string;
  pvMax: number;
  pvAtual: number;
  estresse: number;
  limiarMaior: number | null;
  limiarGrave: number | null;
}

interface SessionTrackerModalProps {
  open: boolean;
  instances: InstanceState[];
  medo: number;
  nomeEncontro?: string;
  onUpdateInstance: (
    key: string,
    updates: Partial<Pick<InstanceState, 'pvAtual' | 'estresse'>>,
  ) => void;
  onUpdateMedo: (value: number) => void;
  onPause: () => void;
  onEnd: () => void;
}

function buildReportText(
  instances: InstanceState[],
  medo: number,
  nomeEncontro: string,
  dataHoje: string,
): string {
  const titulo = nomeEncontro ? `Resumo de Sessão — ${nomeEncontro}` : 'Resumo de Sessão';
  const linhas: string[] = [
    `=== ${titulo} ===`,
    `Data: ${dataHoje}`,
    '',
    'ADVERSÁRIAS:',
  ];

  for (const inst of instances) {
    const isDead = inst.pvAtual === 0;
    const isGrave = !isDead && inst.limiarGrave !== null && inst.pvAtual <= inst.limiarGrave;
    const icon = isDead ? '✗' : isGrave ? '⚠' : '○';
    const status = isDead ? 'Eliminada' : isGrave ? 'Limiar Grave' : 'Viva';
    const details = `(${inst.pvAtual}/${inst.pvMax} PV, ${inst.estresse} Estresse)`;
    linhas.push(`${icon} ${inst.nome.padEnd(20)} — ${status.padEnd(14)} ${details}`);
  }

  linhas.push('', `MEDO GLOBAL: ${medo} / 12`, '', 'Gerado por DaggerHub — https://erickcassoli.github.io/DaggerHub/');
  return linhas.join('\n');
}

function downloadReport(instances: InstanceState[], medo: number, nomeEncontro: string) {
  const hoje = new Date().toISOString().slice(0, 10);
  const text = buildReportText(instances, medo, nomeEncontro, hoje);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sessao-${hoje}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function CounterButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-6 w-6 items-center justify-center rounded border border-ink/30 text-sm font-bold leading-none hover:bg-ink/10 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

export function SessionTrackerModal({
  open,
  instances,
  medo,
  nomeEncontro = '',
  onUpdateInstance,
  onUpdateMedo,
  onPause,
  onEnd,
}: SessionTrackerModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useFocusTrap(containerRef, open, onPause);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-2 dark:bg-black/60 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onPause();
      }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-tracker-title"
        className="flex max-h-[calc(100vh-1rem)] w-full max-w-2xl flex-col rounded-md border border-ink/30 bg-parchment shadow-xl dark:bg-[#1a1714] sm:max-h-[min(90vh,700px)]"
      >
        <header className="flex items-center justify-between border-b border-ink/20 px-4 py-3">
          <h2
            id="session-tracker-title"
            className="font-display text-lg uppercase tracking-wide text-ink"
          >
            ▶ Sessão ao vivo
          </h2>
          <Button size="sm" variant="ghost" onClick={onPause} aria-label="Pausar sessão">
            ◀ Pausar
          </Button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {instances.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink/60">
              Nenhuma adversária no encontro.
            </p>
          ) : (
            instances.map((inst) => {
              const pct =
                inst.pvMax === 0 ? 0 : Math.round((inst.pvAtual / inst.pvMax) * 100);
              const isDead = inst.pvAtual === 0;
              const isGrave =
                !isDead && inst.limiarGrave !== null && inst.pvAtual <= inst.limiarGrave;
              const isMaior =
                !isDead &&
                !isGrave &&
                inst.limiarMaior !== null &&
                inst.pvAtual <= inst.limiarMaior;

              return (
                <div
                  key={inst.key}
                  className={clsx(
                    'rounded border px-3 py-2 transition-colors',
                    isDead
                      ? 'border-red-400/50 bg-red-50 opacity-70 dark:bg-red-950/30'
                      : isGrave
                        ? 'border-orange-400/50 bg-orange-50/50 dark:bg-orange-950/20'
                        : isMaior
                          ? 'border-yellow-400/50 bg-yellow-50/50 dark:bg-yellow-950/20'
                          : 'border-ink/20 bg-white/60 dark:bg-white/5',
                  )}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p
                      className={clsx(
                        'min-w-0 flex-1 truncate font-semibold text-ink',
                        isDead && 'opacity-60 line-through',
                      )}
                    >
                      {inst.nome}
                    </p>
                    {isDead && (
                      <span className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">
                        Eliminada
                      </span>
                    )}
                    {isGrave && (
                      <span className="text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-400">
                        ✦✦ Limiar Grave
                      </span>
                    )}
                    {isMaior && (
                      <span className="text-xs font-semibold uppercase tracking-wide text-yellow-700 dark:text-yellow-500">
                        ✦ Limiar Maior
                      </span>
                    )}
                  </div>

                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="w-6 text-xs text-ink/50">PV</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10">
                      <div
                        className={clsx(
                          'h-full rounded-full transition-all',
                          isDead
                            ? 'bg-red-400'
                            : isGrave
                              ? 'bg-orange-500'
                              : isMaior
                                ? 'bg-yellow-500'
                                : 'bg-green-500',
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs tabular-nums text-ink/70">
                      {inst.pvAtual}/{inst.pvMax}
                    </span>
                    <CounterButton
                      onClick={() =>
                        onUpdateInstance(inst.key, { pvAtual: Math.max(0, inst.pvAtual - 1) })
                      }
                      disabled={isDead}
                      label={`Dano em ${inst.nome}`}
                    >
                      −
                    </CounterButton>
                    <CounterButton
                      onClick={() =>
                        onUpdateInstance(inst.key, {
                          pvAtual: Math.min(inst.pvMax, inst.pvAtual + 1),
                        })
                      }
                      disabled={inst.pvAtual === inst.pvMax}
                      label={`Cura em ${inst.nome}`}
                    >
                      +
                    </CounterButton>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-14 text-xs text-ink/50">Estresse</span>
                    <CounterButton
                      onClick={() =>
                        onUpdateInstance(inst.key, {
                          estresse: Math.max(0, inst.estresse - 1),
                        })
                      }
                      disabled={inst.estresse === 0}
                      label={`Reduzir estresse de ${inst.nome}`}
                    >
                      −
                    </CounterButton>
                    <span className="w-6 text-center text-sm font-semibold tabular-nums text-ink">
                      {inst.estresse}
                    </span>
                    <CounterButton
                      onClick={() =>
                        onUpdateInstance(inst.key, { estresse: inst.estresse + 1 })
                      }
                      label={`Aumentar estresse de ${inst.nome}`}
                    >
                      +
                    </CounterButton>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <footer className="flex flex-wrap items-center gap-3 border-t border-ink/20 px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="whitespace-nowrap text-sm font-semibold text-ink/80">🔥 Medo</span>
            <CounterButton
              onClick={() => onUpdateMedo(Math.max(0, medo - 1))}
              disabled={medo === 0}
              label="Reduzir Medo"
            >
              −
            </CounterButton>
            <span className="w-8 text-center text-xl font-bold tabular-nums text-ink">
              {medo}
            </span>
            <CounterButton
              onClick={() => onUpdateMedo(Math.min(12, medo + 1))}
              disabled={medo === 12}
              label="Aumentar Medo"
            >
              +
            </CounterButton>
            <span className="text-xs text-ink/40">/12</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => downloadReport(instances, medo, nomeEncontro)}
            disabled={instances.length === 0}
            className="text-sm"
            title="Exportar resumo da sessão como .txt"
          >
            📋 Exportar Resumo
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onEnd}
            className="text-sm text-red-700 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
          >
            ✕ Encerrar Sessão
          </Button>
        </footer>
      </div>
    </div>
  );
}
