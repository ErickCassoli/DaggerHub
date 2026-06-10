import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PATAMARES } from '@/data/patamares';
import { TIPO_LABEL } from '@/data/tipos';
import { BASE_POINTS_FLAT, BASE_POINTS_PER_PC } from '@/data/encounterRules';
import {
  generateEncounterEntries,
  generatedEntryCost,
  type GeneratedEntry,
} from '@/lib/encounterGenerator';
import type { Patamar } from '@/types/adversary';

interface GeneratorModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (numPC: number, patamar: Patamar, entries: GeneratedEntry[]) => void;
}

export function GeneratorModal({ open, onClose, onConfirm }: GeneratorModalProps) {
  const [numPC, setNumPC] = useState(4);
  const [patamar, setPatamar] = useState<Patamar>(1);
  const [entries, setEntries] = useState<GeneratedEntry[]>([]);
  const [generated, setGenerated] = useState(false);

  const budget = BASE_POINTS_PER_PC * Math.max(1, numPC) + BASE_POINTS_FLAT;

  const total = useMemo(
    () => entries.reduce((sum, e) => sum + generatedEntryCost(e, numPC), 0),
    [entries, numPC],
  );

  const handleGenerate = () => {
    setEntries(generateEncounterEntries(numPC, patamar));
    setGenerated(true);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 dark:bg-black/60 p-2 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex max-h-[calc(100vh-1rem)] w-full max-w-md flex-col rounded-md border border-ink/30 bg-parchment shadow-xl dark:bg-[var(--parchment-bg)]">
        <header className="flex items-center justify-between border-b border-ink/20 px-4 py-3">
          <h2 className="font-display text-lg uppercase tracking-wide text-ink">
            Gerar encontro
          </h2>
          <Button size="sm" variant="ghost" onClick={onClose} aria-label="Fechar">
            ✕
          </Button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="field-label">Nº de PCs</span>
              <Input
                type="number"
                min={1}
                max={10}
                value={numPC}
                onChange={(e) => setNumPC(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
              />
            </label>
            <label className="block">
              <span className="field-label">Patamar</span>
              <Select
                value={patamar}
                onChange={(e) => setPatamar(Number(e.target.value) as Patamar)}
              >
                {PATAMARES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <p className="text-sm text-ink/60">
            Orçamento: <strong className="text-ink">{budget} PB</strong> (3×{Math.max(1, numPC)} + 2)
          </p>

          {generated && (
            entries.length === 0 ? (
              <p className="rounded border border-dashed border-ink/30 bg-white/40 dark:bg-white/5 p-4 text-center text-sm text-ink/60">
                Nenhuma adversária encontrada no bestiário para este patamar.
              </p>
            ) : (
              <div>
                <p className="field-label mb-2">Adversárias geradas</p>
                <ul className="space-y-1.5">
                  {entries.map((e, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded border border-ink/15 bg-white/50 dark:bg-white/5 px-3 py-2 text-sm"
                    >
                      <span className="font-semibold text-ink">{e.adversary.nome}</span>
                      <span className="ml-2 shrink-0 text-xs text-ink/60">
                        {TIPO_LABEL[e.adversary.tipo]} · ×{e.quantidade} ·{' '}
                        <strong className="text-gold">{generatedEntryCost(e, numPC)} PB</strong>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-right text-sm text-ink/70">
                  Total:{' '}
                  <strong
                    className={total === budget ? 'text-green-700 dark:text-green-400' : 'text-ink'}
                  >
                    {total}
                  </strong>{' '}
                  / {budget} PB
                </p>
              </div>
            )
          )}
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-ink/20 px-4 py-3">
          <Button variant="secondary" onClick={handleGenerate}>
            {generated ? '↺ Re-gerar' : '✦ Gerar'}
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => onConfirm(numPC, patamar, entries)}
              disabled={!generated || entries.length === 0}
            >
              Criar encontro →
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
