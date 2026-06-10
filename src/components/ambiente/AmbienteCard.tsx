import { Link } from 'react-router-dom';
import type { Ambiente } from '@/types/ambiente';
import { Button } from '@/components/ui/Button';
import { AmbienteBlock } from '@/components/AmbienteBlock/AmbienteBlock';
import { FitBlock } from '@/components/StatsBlock/FitBlock';
import { useAdversaryLibrary } from '@/hooks/useAdversaryLibrary';
import { resolveAdversary } from '@/lib/adversarySources';

interface AmbienteCardProps {
  ambiente: Ambiente;
  onDuplicate: () => void;
  onDelete: () => void;
  onExportJson: () => void;
}

export function AmbienteCard({ ambiente, onDuplicate, onDelete, onExportJson }: AmbienteCardProps) {
  const { items: biblioteca } = useAdversaryLibrary();
  const adversarios = ambiente.adversariosSugeridos
    .map((a) => resolveAdversary(a.adversaryRef, a.origem, biblioteca)?.nome)
    .filter((n): n is string => Boolean(n));

  return (
    <article className="flex w-full flex-col items-center gap-3">
      <div className="w-full max-w-[450px]">
        <FitBlock>
          <AmbienteBlock ambiente={ambiente} adversarios={adversarios} />
        </FitBlock>
      </div>

      <div className="flex w-full max-w-[450px] flex-wrap items-center gap-2">
        <Link to={`/ambientes/edit/${ambiente.id}`}>
          <Button size="sm" variant="primary">Editar</Button>
        </Link>
        <Button size="sm" variant="secondary" onClick={onDuplicate}>Duplicar</Button>
        <Button size="sm" variant="secondary" onClick={onExportJson}>JSON</Button>
        <Button size="sm" variant="danger" onClick={onDelete}>Excluir</Button>
      </div>
    </article>
  );
}
