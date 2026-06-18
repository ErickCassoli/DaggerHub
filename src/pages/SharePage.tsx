import { useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { Adversary } from '@/types/adversary';
import { adversarySchema } from '@/lib/schema';
import { decodeAdversaryPayload } from '@/lib/shareUtils';
import { AppHeader } from '@/components/nav/AppHeader';
import { StatsBlock } from '@/components/StatsBlock/StatsBlock';
import { Button } from '@/components/ui/Button';
import { useAdversaryLibrary } from '@/hooks/useAdversaryLibrary';
import { exportPng, exportPdf } from '@/lib/export';

export function SharePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { importOne } = useAdversaryLibrary();
  const offscreenRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const encoded = params.get('adv');
  const raw = encoded ? decodeAdversaryPayload(encoded) : null;
  const result = raw !== null ? adversarySchema.safeParse(raw) : null;
  const adversary = result?.success ? (result.data as Adversary) : null;

  function handleCopyToLibrary() {
    if (!adversary) return;
    setSaving(true);
    const saved = importOne(adversary);
    navigate(`/edit/${saved.id}`);
  }

  async function handleExportPng() {
    if (offscreenRef.current && adversary) {
      await exportPng(offscreenRef.current, adversary.nome);
    }
  }

  async function handleExportPdf() {
    if (offscreenRef.current && adversary) {
      await exportPdf(offscreenRef.current, adversary.nome);
    }
  }

  if (!encoded) {
    return (
      <>
        <AppHeader />
        <main className="mx-auto max-w-lg px-4 py-12 text-center">
          <p className="mb-4 text-ink/70">Link inválido ou sem dados de adversária.</p>
          <Link to="/" className="text-ink underline hover:text-ink/70">Ir para a biblioteca</Link>
        </main>
      </>
    );
  }

  if (!adversary) {
    const firstIssue =
      result && !result.success ? (result.error.issues[0]?.message ?? 'Dados inválidos') : 'Não foi possível decodificar o link';
    return (
      <>
        <AppHeader />
        <main className="mx-auto max-w-lg px-4 py-12 text-center">
          <p className="mb-2 text-ink/70">Não foi possível carregar a adversária deste link.</p>
          <p className="mb-4 text-xs text-ink/40">{firstIssue}</p>
          <Link to="/" className="text-ink underline hover:text-ink/70">Ir para a biblioteca</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-4 flex items-center gap-2 text-sm text-ink/50">
          <Link to="/" className="hover:text-ink/70">← Biblioteca</Link>
          <span>/</span>
          <span>Adversária compartilhada</span>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="w-full max-w-[450px]">
            <StatsBlock adversary={adversary} />
          </div>

          <div className="flex w-full max-w-[450px] flex-wrap gap-2">
            <Button variant="primary" onClick={handleCopyToLibrary} disabled={saving}>
              {saving ? 'Copiando…' : 'Copiar para minha biblioteca'}
            </Button>
            <Button variant="secondary" onClick={handleExportPng}>PNG</Button>
            <Button variant="secondary" onClick={handleExportPdf}>PDF</Button>
          </div>
        </div>

        {/* Nó off-screen fixo em largura para exportação determinística */}
        <div className="pointer-events-none fixed left-[-9999px] top-0" aria-hidden="true">
          <StatsBlock ref={offscreenRef} adversary={adversary} />
        </div>
      </main>
    </>
  );
}
