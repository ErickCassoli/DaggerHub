import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Ambiente } from '@/types/ambiente';
import { Button } from '@/components/ui/Button';
import { AmbienteBlock } from '@/components/AmbienteBlock/AmbienteBlock';
import { FitBlock } from '@/components/StatsBlock/FitBlock';
import { useAdversaryLibrary } from '@/hooks/useAdversaryLibrary';
import { resolveAdversary } from '@/lib/adversarySources';
import { buildAmbienteShareUrl } from '@/lib/shareUtils';

interface AmbienteCardProps {
  ambiente: Ambiente;
  onDuplicate: () => void;
  onDelete: () => void;
  onExportJson: () => void;
  onCreateEncounter?: () => void;
}

export function AmbienteCard({ ambiente, onDuplicate, onDelete, onExportJson, onCreateEncounter }: AmbienteCardProps) {
  const { items: biblioteca } = useAdversaryLibrary();
  const [shareFeedback, setShareFeedback] = useState<'idle' | 'ok' | 'long'>('idle');
  const adversarios = ambiente.adversariosSugeridos
    .map((a) => resolveAdversary(a.adversaryRef, a.origem, biblioteca)?.nome)
    .filter((n): n is string => Boolean(n));

  async function handleShare() {
    const url = buildAmbienteShareUrl(ambiente);
    try {
      await navigator.clipboard.writeText(url);
      setShareFeedback(url.length > 1800 ? 'long' : 'ok');
      setTimeout(() => setShareFeedback('idle'), 2500);
    } catch {
      window.prompt('Copie o link de compartilhamento:', url);
    }
  }

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
        {onCreateEncounter && ambiente.adversariosSugeridos.length > 0 && (
          <Button size="sm" variant="secondary" onClick={onCreateEncounter} title="Cria um encontro pré-populado com as adversárias sugeridas deste ambiente">
            ⚔ Criar Encontro
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={onDuplicate}>Duplicar</Button>
        <Button size="sm" variant="secondary" onClick={onExportJson}>JSON</Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleShare}
          title={shareFeedback === 'long' ? 'Link muito longo (pode não funcionar em alguns apps)' : 'Copiar link de compartilhamento'}
        >
          {shareFeedback === 'ok' ? '✓ Copiado!' : shareFeedback === 'long' ? '⚠ Link longo' : 'Compartilhar'}
        </Button>
        <Button size="sm" variant="danger" onClick={onDelete}>Excluir</Button>
      </div>
    </article>
  );
}
