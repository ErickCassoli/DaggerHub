import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Transformacao } from '@/types/transformacao';
import { Button } from '@/components/ui/Button';
import { TransformacaoBlock } from '@/components/TransformacaoBlock';
import { FitBlock } from '@/components/StatsBlock/FitBlock';
import { buildTransformacaoShareUrl } from '@/lib/shareUtils';

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
  const [shareFeedback, setShareFeedback] = useState<'idle' | 'ok' | 'long'>('idle');

  async function handleShare() {
    const url = buildTransformacaoShareUrl(transformacao);
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
          <TransformacaoBlock transformacao={transformacao} />
        </FitBlock>
      </div>

      <div className="flex w-full max-w-[450px] flex-wrap items-center gap-2">
        <Link to={`/transformacoes/edit/${transformacao.id}`}>
          <Button size="sm" variant="primary">Editar</Button>
        </Link>
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
