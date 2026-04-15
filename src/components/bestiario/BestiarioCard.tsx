import type { Adversary } from '@/types/adversary';
import { TIPO_LABEL } from '@/data/tipos';
import { PATAMAR_LABEL } from '@/data/patamares';
import { Button } from '@/components/ui/Button';

interface BestiarioCardProps {
  adversary: Adversary;
  onCopy: () => void;
}

export function BestiarioCard({ adversary, onCopy }: BestiarioCardProps) {
  return (
    <article className="flex flex-col justify-between rounded-md border border-ink/20 bg-white/60 p-4 shadow-sm">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg uppercase tracking-wide text-ink">
            {adversary.nome}
          </h3>
          <span className="rounded bg-gold/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink/70">
            oficial
          </span>
        </div>
        <p className="text-xs uppercase tracking-wide text-ink/60">
          {TIPO_LABEL[adversary.tipo]} · {PATAMAR_LABEL[adversary.patamar]}
        </p>
        {adversary.descricao ? (
          <p className="mt-2 line-clamp-3 text-sm italic text-ink/80">{adversary.descricao}</p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink/70">
          <span><strong>DIF</strong> {adversary.dificuldade}</span>
          <span><strong>LIM</strong> {adversary.limiarMaior ?? '—'}/{adversary.limiarGrave ?? '—'}</span>
          <span><strong>PV</strong> {adversary.pv}</span>
          <span><strong>PF</strong> {adversary.pf}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button size="sm" variant="primary" onClick={onCopy}>
          Copiar para minha biblioteca
        </Button>
      </div>
    </article>
  );
}
