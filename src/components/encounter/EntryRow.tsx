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
  if (!adversary) {
    return (
      <li className="flex items-center justify-between rounded border border-red-900/30 bg-red-50 px-3 py-2 text-sm">
        <span className="text-red-900">
          Referência quebrada ({entry.origem}: {entry.adversaryRef})
        </span>
        <Button size="sm" variant="danger" onClick={onRemove}>Remover</Button>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 rounded border border-ink/20 bg-white/60 px-3 py-2">
      <div className="flex-1 min-w-0">
        <p className="truncate font-semibold text-ink">
          {adversary.nome}
          {entry.origem === 'bestiario' ? (
            <span className="ml-2 rounded bg-gold/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink/70">
              oficial
            </span>
          ) : null}
        </p>
        <p className="text-xs text-ink/60">
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
    </li>
  );
}
