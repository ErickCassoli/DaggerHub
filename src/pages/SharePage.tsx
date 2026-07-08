import { useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { Adversary } from '@/types/adversary';
import type { Ambiente } from '@/types/ambiente';
import type { Transformacao } from '@/types/transformacao';
import { adversarySchema } from '@/lib/schema';
import { ambienteSchema } from '@/lib/ambienteSchema';
import { transformacaoSchema } from '@/lib/transformacaoSchema';
import { decodePayload } from '@/lib/shareUtils';
import { resolveAdversary } from '@/lib/adversarySources';
import { AppHeader } from '@/components/nav/AppHeader';
import { StatsBlock } from '@/components/StatsBlock/StatsBlock';
import { AmbienteBlock } from '@/components/AmbienteBlock/AmbienteBlock';
import { TransformacaoBlock } from '@/components/TransformacaoBlock/TransformacaoBlock';
import { Button } from '@/components/ui/Button';
import { useAdversaryLibrary } from '@/hooks/useAdversaryLibrary';
import { useAmbienteLibrary } from '@/hooks/useAmbienteLibrary';
import { useTransformacaoLibrary } from '@/hooks/useTransformacaoLibrary';
import { exportPng, exportPdf } from '@/lib/export';

type SharedKind = 'adversaria' | 'ambiente' | 'transformacao';

const BREADCRUMB_LABEL: Record<SharedKind, string> = {
  adversaria: 'Adversária compartilhada',
  ambiente: 'Ambiente compartilhado',
  transformacao: 'Transformação compartilhada',
};

export function SharePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const adversaryLibrary = useAdversaryLibrary();
  const ambienteLibrary = useAmbienteLibrary();
  const transformacaoLibrary = useTransformacaoLibrary();
  const offscreenRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const advParam = params.get('adv');
  const ambParam = params.get('amb');
  const traParam = params.get('tra');
  const kind: SharedKind | null = advParam ? 'adversaria' : ambParam ? 'ambiente' : traParam ? 'transformacao' : null;
  const encoded = advParam ?? ambParam ?? traParam;
  const raw = encoded ? decodePayload(encoded) : null;

  const result =
    kind === 'adversaria' && raw !== null
      ? adversarySchema.safeParse(raw)
      : kind === 'ambiente' && raw !== null
        ? ambienteSchema.safeParse(raw)
        : kind === 'transformacao' && raw !== null
          ? transformacaoSchema.safeParse(raw)
          : null;

  const adversary = kind === 'adversaria' && result?.success ? (result.data as Adversary) : null;
  const ambiente = kind === 'ambiente' && result?.success ? (result.data as Ambiente) : null;
  const transformacao = kind === 'transformacao' && result?.success ? (result.data as Transformacao) : null;
  const item = adversary ?? ambiente ?? transformacao;

  const adversariosSugeridos = ambiente
    ? ambiente.adversariosSugeridos
        .map((a) => resolveAdversary(a.adversaryRef, a.origem, adversaryLibrary.items)?.nome)
        .filter((n): n is string => Boolean(n))
    : [];

  function handleCopyToLibrary() {
    setSaving(true);
    if (adversary) {
      const saved = adversaryLibrary.importOne(adversary);
      navigate(`/edit/${saved.id}`);
    } else if (ambiente) {
      const saved = ambienteLibrary.importOne(ambiente);
      navigate(`/ambientes/edit/${saved.id}`);
    } else if (transformacao) {
      const saved = transformacaoLibrary.importOne(transformacao);
      navigate(`/transformacoes/edit/${saved.id}`);
    }
  }

  async function handleExportPng() {
    if (offscreenRef.current && item) {
      await exportPng(offscreenRef.current, item.nome);
    }
  }

  async function handleExportPdf() {
    if (offscreenRef.current && item) {
      await exportPdf(offscreenRef.current, item.nome);
    }
  }

  if (!encoded) {
    return (
      <>
        <AppHeader />
        <main className="mx-auto max-w-lg px-4 py-12 text-center">
          <p className="mb-4 text-ink/70">Link inválido ou sem dados para exibir.</p>
          <Link to="/" className="text-ink underline hover:text-ink/70">Ir para a biblioteca</Link>
        </main>
      </>
    );
  }

  if (!item) {
    const firstIssue =
      result && !result.success ? (result.error.issues[0]?.message ?? 'Dados inválidos') : 'Não foi possível decodificar o link';
    return (
      <>
        <AppHeader />
        <main className="mx-auto max-w-lg px-4 py-12 text-center">
          <p className="mb-2 text-ink/70">Não foi possível carregar o conteúdo deste link.</p>
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
          <span>{BREADCRUMB_LABEL[kind as SharedKind]}</span>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="w-full max-w-[450px]">
            {adversary ? <StatsBlock adversary={adversary} /> : null}
            {ambiente ? <AmbienteBlock ambiente={ambiente} adversarios={adversariosSugeridos} /> : null}
            {transformacao ? <TransformacaoBlock transformacao={transformacao} /> : null}
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
          {adversary ? <StatsBlock ref={offscreenRef} adversary={adversary} /> : null}
          {ambiente ? <AmbienteBlock ref={offscreenRef} ambiente={ambiente} adversarios={adversariosSugeridos} /> : null}
          {transformacao ? <TransformacaoBlock ref={offscreenRef} transformacao={transformacao} /> : null}
        </div>
      </main>
    </>
  );
}
