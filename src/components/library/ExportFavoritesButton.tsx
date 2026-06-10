import { useEffect, useRef, useState } from 'react';
import type { Adversary } from '@/types/adversary';
import { Button } from '@/components/ui/Button';
import { StatsBlock } from '@/components/StatsBlock/StatsBlock';
import { exportAdversariesPdf } from '@/lib/export';

interface ExportFavoritesButtonProps {
  /** Adversárias favoritadas, na ordem em que devem sair no PDF. */
  adversaries: Adversary[];
  /** Nome-base do arquivo (será slugificado). */
  filename: string;
}

/**
 * Botão "Imprimir favoritos": gera um PDF com um stat block por página.
 * Os blocos são montados off-screen apenas durante a exportação, com a mesma
 * largura fixa usada nos exports individuais.
 */
export function ExportFavoritesButton({ adversaries, filename }: ExportFavoritesButtonProps) {
  const [exporting, setExporting] = useState(false);
  const nodesRef = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    if (!exporting) return;
    let cancelled = false;
    (async () => {
      try {
        const nodes = adversaries
          .map((a) => nodesRef.current.get(a.id))
          .filter((n): n is HTMLDivElement => Boolean(n));
        await exportAdversariesPdf(nodes, filename);
      } finally {
        if (!cancelled) setExporting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Dispara apenas na transição de `exporting`; a lista capturada no clique
    // é a que vai para o PDF.
  }, [exporting]);

  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        disabled={adversaries.length === 0 || exporting}
        onClick={() => setExporting(true)}
        title="Gera um PDF com um stat block por página de todos os itens favoritados — ideal para imprimir"
      >
        {exporting ? 'Gerando PDF…' : `Imprimir favoritos (${adversaries.length})`}
      </Button>

      {exporting ? (
        <div style={{ position: 'absolute', left: -9999, top: 0, pointerEvents: 'none' }} aria-hidden>
          {adversaries.map((adv) => (
            <StatsBlock
              key={adv.id}
              adversary={adv}
              ref={(el) => {
                if (el) nodesRef.current.set(adv.id, el);
                else nodesRef.current.delete(adv.id);
              }}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
