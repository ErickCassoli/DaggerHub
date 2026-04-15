import { Link } from 'react-router-dom';
import type { Adversary } from '@/types/adversary';
import { Button } from '@/components/ui/Button';
import { StatsBlock } from '@/components/StatsBlock/StatsBlock';

interface AdversaryCardProps {
  adversary: Adversary;
  onDuplicate: () => void;
  onDelete: () => void;
  onExportJson: () => void;
}

export function AdversaryCard({ adversary, onDuplicate, onDelete, onExportJson }: AdversaryCardProps) {
  return (
    <article className="flex flex-col items-center gap-3">
      <StatsBlock adversary={adversary} />

      <div className="flex w-[450px] max-w-full flex-wrap items-center gap-2">
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
