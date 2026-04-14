import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Adversary } from '@/types/adversary';
import { adversarySchema } from '@/lib/schema';
import { blankAdversary } from '@/lib/defaults';
import { useAdversaryLibrary } from '@/hooks/useAdversaryLibrary';
import { AdversaryForm } from '@/components/form/AdversaryForm';
import { StatsBlock } from '@/components/StatsBlock/StatsBlock';
import { Button } from '@/components/ui/Button';
import { exportJson, exportPdf, exportPng } from '@/lib/export';

export function BuilderPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { get, upsert } = useAdversaryLibrary();

  const initial = useMemo<Adversary>(() => {
    if (id) {
      const found = get(id);
      if (found) return found;
    }
    return blankAdversary();
  }, [id, get]);

  useEffect(() => {
    if (id && !get(id)) {
      navigate('/', { replace: true });
    }
  }, [id, get, navigate]);

  const form = useForm<Adversary>({
    resolver: zodResolver(adversarySchema) as never,
    mode: 'onBlur',
    defaultValues: initial,
  });

  const [lastSavedId, setLastSavedId] = useState<string | null>(id ?? null);
  const preview = form.watch();
  const previewRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  const onSubmit = (data: Adversary) => {
    const saved = upsert(data);
    setLastSavedId(saved.id);
    if (!id) {
      navigate(`/edit/${saved.id}`, { replace: true });
    }
  };

  const exportTargetNode = () => exportRef.current ?? previewRef.current;

  const doExportPng = async () => {
    const node = exportTargetNode();
    if (!node) return;
    try {
      setExporting('png');
      await exportPng(node, preview.nome || 'adversaria');
    } finally {
      setExporting(null);
    }
  };

  const doExportPdf = async () => {
    const node = exportTargetNode();
    if (!node) return;
    try {
      setExporting('pdf');
      await exportPdf(node, preview.nome || 'adversaria');
    } finally {
      setExporting(null);
    }
  };

  const doExportJson = () => {
    exportJson(preview);
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm text-ink/70 underline">← Voltar</Link>
          <h1 className="font-display text-2xl uppercase tracking-wider text-ink">
            {id ? 'Editar adversária' : 'Nova adversária'}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" form="adversary-form" variant="primary">
            Salvar
          </Button>
          <Button type="button" variant="secondary" onClick={doExportPng} disabled={!!exporting}>
            {exporting === 'png' ? 'Exportando…' : 'PNG'}
          </Button>
          <Button type="button" variant="secondary" onClick={doExportPdf} disabled={!!exporting}>
            {exporting === 'pdf' ? 'Exportando…' : 'PDF'}
          </Button>
          <Button type="button" variant="secondary" onClick={doExportJson}>
            JSON
          </Button>
        </div>
      </header>

      {lastSavedId && !form.formState.isDirty ? (
        <p className="mb-3 rounded border border-green-800/30 bg-green-50 px-3 py-2 text-sm text-green-900">
          Salva no navegador (localStorage).
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_470px]">
        <AdversaryForm form={form} onSubmit={onSubmit} />

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <h2 className="field-label mb-2">Preview</h2>
          <div className="flex justify-center">
            <StatsBlock adversary={preview} ref={previewRef} />
          </div>
          <p className="mt-3 text-xs text-ink/60">
            Este é exatamente o bloco que será exportado. Dica: use as keywords clicáveis nas
            descrições de habilidades para destacar termos do sistema.
          </p>
        </aside>
      </div>

      {/* Off-screen render com largura fixa para exportação consistente */}
      <div style={{ position: 'absolute', left: -9999, top: 0, pointerEvents: 'none' }} aria-hidden>
        <StatsBlock adversary={preview} ref={exportRef} />
      </div>
    </div>
  );
}
