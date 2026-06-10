import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Ambiente } from '@/types/ambiente';
import { ambienteSchema } from '@/lib/ambienteSchema';
import { blankAmbiente } from '@/lib/ambienteDefaults';
import { useAmbienteLibrary } from '@/hooks/useAmbienteLibrary';
import { useAdversaryLibrary } from '@/hooks/useAdversaryLibrary';
import { AmbienteForm } from '@/components/ambiente/AmbienteForm';
import { AmbienteBlock } from '@/components/AmbienteBlock/AmbienteBlock';
import { Button } from '@/components/ui/Button';
import { AppHeader } from '@/components/nav/AppHeader';
import {
  exportAmbienteJson,
  exportAmbientePdf,
  exportAmbientePng,
} from '@/lib/ambienteExport';
import { resolveAdversary } from '@/lib/adversarySources';

export function AmbienteBuilderPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { get, upsert } = useAmbienteLibrary();
  const { items: biblioteca } = useAdversaryLibrary();

  const initial = useMemo<Ambiente>(() => {
    if (id) {
      const found = get(id);
      if (found) return found;
    }
    return blankAmbiente();
  }, [id, get]);

  useEffect(() => {
    if (id && !get(id)) {
      navigate('/ambientes', { replace: true });
    }
  }, [id, get, navigate]);

  const form = useForm<Ambiente>({
    resolver: zodResolver(ambienteSchema) as never,
    mode: 'onBlur',
    defaultValues: initial,
  });

  const [lastSavedId, setLastSavedId] = useState<string | null>(id ?? null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const preview = form.watch();
  const previewRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  const adversarios = useMemo(
    () =>
      preview.adversariosSugeridos
        .map((a) => resolveAdversary(a.adversaryRef, a.origem, biblioteca)?.nome)
        .filter((n): n is string => Boolean(n)),
    [preview.adversariosSugeridos, biblioteca],
  );

  const onSubmit = (data: Ambiente) => {
    setSaveError(null);
    const saved = upsert(data);
    setLastSavedId(saved.id);
    if (!id) {
      navigate(`/ambientes/edit/${saved.id}`, { replace: true });
    }
  };

  const onInvalid = useCallback(() => {
    setSaveError('Não foi possível salvar — corrija os campos destacados.');
    const firstError = document.querySelector<HTMLElement>(
      '#ambiente-form [aria-invalid="true"], #ambiente-form .border-red-600',
    );
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError.focus?.();
    }
  }, []);

  const exportTargetNode = () => exportRef.current ?? previewRef.current;

  const doExportPng = async () => {
    const node = exportTargetNode();
    if (!node) return;
    try {
      setExporting('png');
      await exportAmbientePng(node, preview.nome || 'ambiente');
    } finally {
      setExporting(null);
    }
  };

  const doExportPdf = async () => {
    const node = exportTargetNode();
    if (!node) return;
    try {
      setExporting('pdf');
      await exportAmbientePdf(node, preview.nome || 'ambiente');
    } finally {
      setExporting(null);
    }
  };

  const doExportJson = () => exportAmbienteJson(preview);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <AppHeader
        subtitle={id ? 'Editar ambiente' : 'Novo ambiente'}
        actions={
          <>
            <Link to="/ambientes" className="text-sm text-ink/70 underline">← Ambientes</Link>
            <Button type="submit" form="ambiente-form" variant="primary">Salvar</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={doExportPng}
              disabled={!!exporting}
              title="Baixa o bloco como imagem PNG — ideal para compartilhar no Discord ou usar em VTTs"
            >
              {exporting === 'png' ? 'Exportando…' : 'PNG'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={doExportPdf}
              disabled={!!exporting}
              title="Baixa o bloco como PDF pronto para impressão"
            >
              {exporting === 'pdf' ? 'Exportando…' : 'PDF'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={doExportJson}
              title="Baixa os dados em JSON — serve de backup e pode ser importado em outro navegador"
            >
              JSON
            </Button>
          </>
        }
      />

      {lastSavedId && !form.formState.isDirty ? (
        <p className="mb-3 rounded border border-green-800/30 bg-green-50 px-3 py-2 text-sm text-green-900 dark:border-green-700/30 dark:bg-green-950 dark:text-green-200">
          Salvo no navegador (localStorage).
        </p>
      ) : null}

      {saveError ? (
        <p className="mb-3 rounded border border-red-800/30 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-700/30 dark:bg-red-950 dark:text-red-200">
          {saveError}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_470px]">
        <AmbienteForm form={form} onSubmit={onSubmit} onInvalid={onInvalid} />

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <h2 className="field-label mb-2">Preview</h2>
          <div className="flex justify-center overflow-x-auto">
            <AmbienteBlock ambiente={preview} adversarios={adversarios} ref={previewRef} />
          </div>
          <p className="mt-3 text-xs text-ink/60">
            Este é exatamente o bloco que será exportado. Use as keywords clicáveis nas
            descrições para destacar termos do sistema.
          </p>
        </aside>
      </div>

      <div style={{ position: 'absolute', left: -9999, top: 0, pointerEvents: 'none' }} aria-hidden>
        <AmbienteBlock ambiente={preview} adversarios={adversarios} ref={exportRef} />
      </div>
    </div>
  );
}
