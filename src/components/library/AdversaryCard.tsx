import { Link } from 'react-router-dom';
import type { Adversary } from '@/types/adversary';
import { TIPO_LABEL } from '@/data/tipos';
import { PATAMAR_LABEL } from '@/data/patamares';
import { Button } from '@/components/ui/Button';

interface AdversaryCardProps {
  adversary: Adversary;
  onDuplicate: () => void;
  onDelete: () => void;
  onExportJson: () => void;
}

export function AdversaryCard({ adversary, onDuplicate, onDelete, onExportJson }: AdversaryCardProps) {
  return (
    <article className="flex flex-col justify-between rounded-md border border-ink/20 bg-white/60 p-4 shadow-sm">
      <div>
        <h3 className="font-display text-lg uppercase tracking-wide text-ink">{adversary.nome || 'Sem nome'}</h3>
        <p className="text-xs uppercase tracking-wide text-ink/60">
          {TIPO_LABEL[adversary.tipo]} · {PATAMAR_LABEL[adversary.patamar]}
        </p>
        {adversary.descricao ? (
          <p className="mt-2 line-clamp-2 text-sm italic text-ink/80">{adversary.descricao}</p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink/70">
          <span><strong>DIF</strong> {adversary.dificuldade}</span>
          <span><strong>LIM</strong> {adversary.limiarMaior}/{adversary.limiarGrave}</span>
          <span><strong>PV</strong> {adversary.pv}</span>
          <span><strong>PF</strong> {adversary.pf}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link to={`/edit/${adversary.id}`}>
          <Button size="sm" variant="primary">Editar</Button>
        </Link>
        <Button size="sm" variant="secondary" onClick={onDuplicate}>Duplicar</Button>
        <Button size="sm" variant="secondary" onClick={onExportJson}>JSON</Button>
        <Button size="sm" variant="danger" onClick={onDelete}>Excluir</Button>
      </div>
    </article>
  );
}
