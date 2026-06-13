import { useState } from 'react';
import type { Adversary } from '@/types/adversary';
import type { EncounterEntry } from '@/types/encounter';
import { TIPO_LABEL } from '@/data/tipos';
import { PATAMAR_LABEL } from '@/data/patamares';
import { Button } from '@/components/ui/Button';

interface EntryRowProps {
  entry: EncounterEntry;
  adversary: Adversary | undefined;
  custo: number;
  onChangeQty: (qty: number) => void;
  onRemove: () => void;
}

export function EntryRow({ entry, adversary, custo, onChangeQty, onRemove }: EntryRowProps) {
  const [expanded, setExpanded] = useState(false);

  if (!adversary) {
    return (
      <li className="flex items-center justify-between rounded border border-red-900/30 bg-red-50 dark:bg-red-950/50 px-3 py-2 text-sm">
        <span className="text-red-900 dark:text-red-300">
          Referência quebrada ({entry.origem}: {entry.adversaryRef})
        </span>
        <Button size="sm" variant="danger" onClick={onRemove}>Remover</Button>
      </li>
    );
  }

  const firstAtaque = adversary.ataques[0];
  const extraAtaques = adversary.ataques.length - 1;
  const atqStr = adversary.atq >= 0 ? `+${adversary.atq}` : String(adversary.atq);

  return (
    <li className="rounded border border-ink/20 bg-white/60 dark:bg-white/5">
      {/* Linha principal */}
      <div className="flex flex-wrap items-center gap-3 px-3 py-2">
        <div className="min-w-0 flex-1 basis-full sm:basis-0">
          <button
            type="button"
            className="flex w-full items-center gap-1.5 text-left"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-label={expanded ? 'Ocultar stats' : 'Ver stats'}
          >
            <span className="shrink-0 text-[10px] text-ink/40">{expanded ? '▾' : '▸'}</span>
            <p className="truncate font-semibold text-ink">
              {adversary.nome}
              {entry.origem === 'bestiario' ? (
                <span className="ml-2 rounded bg-gold/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink/70">
                  oficial
                </span>
              ) : null}
            </p>
          </button>
          <p className="ml-4 text-xs text-ink/60">
            {TIPO_LABEL[adversary.tipo]} · {PATAMAR_LABEL[adversary.patamar]}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="secondary"
            type="button"
            onClick={() => onChangeQty(Math.max(1, entry.quantidade - 1))}
            aria-label="Diminuir quantidade"
          >
            −
          </Button>
          <span className="w-6 text-center text-sm font-semibold">{entry.quantidade}</span>
          <Button
            size="sm"
            variant="secondary"
            type="button"
            onClick={() => onChangeQty(entry.quantidade + 1)}
            aria-label="Aumentar quantidade"
          >
            +
          </Button>
        </div>
        <div className="w-16 text-right text-sm text-ink/80">
          <strong>{custo}</strong> pts
        </div>
        <Button size="sm" variant="danger" type="button" onClick={onRemove}>
          Remover
        </Button>
      </div>

      {/* Stats expandíveis */}
      {expanded ? (
        <div className="border-t border-ink/10 px-3 pb-3 pt-2">
          <dl className="grid grid-cols-3 gap-x-4 gap-y-2 text-xs sm:grid-cols-6">
            <div>
              <dt className="uppercase tracking-wide text-ink/50">PV</dt>
              <dd className="font-semibold text-ink">{adversary.pv}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-wide text-ink/50">PF</dt>
              <dd className="font-semibold text-ink">{adversary.pf}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-wide text-ink/50">ATQ</dt>
              <dd className="font-semibold text-ink">{atqStr}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-wide text-ink/50">Dif</dt>
              <dd className="font-semibold text-ink">{adversary.dificuldade}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-wide text-ink/50">L.Maior</dt>
              <dd className="font-semibold text-ink">
                {adversary.limiarMaior != null ? adversary.limiarMaior : '—'}
              </dd>
            </div>
            <div>
              <dt className="uppercase tracking-wide text-ink/50">L.Grave</dt>
              <dd className="font-semibold text-ink">
                {adversary.limiarGrave != null ? adversary.limiarGrave : '—'}
              </dd>
            </div>
          </dl>
          {firstAtaque ? (
            <p className="mt-2.5 text-xs text-ink/80">
              <span className="font-semibold text-ink">{firstAtaque.nome}</span>
              {firstAtaque.alcance ? (
                <span className="text-ink/50"> ({firstAtaque.alcance})</span>
              ) : null}
              {' · '}
              <span className="text-ink/70">{firstAtaque.dano}</span>
              {extraAtaques > 0 ? (
                <span className="ml-2 text-ink/50">
                  +{extraAtaques} ataque{extraAtaques > 1 ? 's' : ''}
                </span>
              ) : null}
            </p>
          ) : null}
          {adversary.hordaRatio ? (
            <p className="mt-1 text-xs text-ink/60">
              Horda: <span className="font-semibold text-ink">{adversary.hordaRatio}</span>
            </p>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
