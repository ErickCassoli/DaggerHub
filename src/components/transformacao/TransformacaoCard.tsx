import { Link } from 'react-router-dom';
import type { Transformacao } from '@/types/transformacao';
import { Button } from '@/components/ui/Button';
import { TransformacaoBlock } from '@/components/TransformacaoBlock';
import { FitBlock } from '@/components/StatsBlock/FitBlock';

interface TransformacaoCardProps {
  transformacao: Transformacao;
  onDuplicate: () => void;
  onDelete: () => void;
  onExportJson: () => void;
}

export function TransformacaoCard({
  transformacao,
  onDuplicate,
  onDelete,
  onExportJson,
}: TransformacaoCardProps) {
  return (
    <article className="flex w-full flex-col items-center gap-3">
      <div className="w-full max-w-[450px]">
        <FitBlock>
          <TransformacaoBlock transformacao={transformacao} />
        </FitBlock>
      </div>

      <div className="flex w-full max-w-[450px] flex-wrap items-center gap-2">
        <Link to={`/transformacoes/edit/${transformacao.id}`}>
          <Button size="sm" variant="primary">Editar</Button>
        </Link>
        <Button size="sm" variant="secondary" onClick={onDuplicate}>Duplicar</Button>
        <Button size="sm" variant="secondary" onClick={onExportJson}>JSON</Button>
        <Button size="sm" variant="danger" onClick={onDelete}>Excluir</Button>
      </div>
    </article>
  );
}
