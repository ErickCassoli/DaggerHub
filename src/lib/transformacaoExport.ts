import type { Transformacao } from '@/types/transformacao';
import { transformacaoSchema } from '@/lib/transformacaoSchema';
import { slugify } from '@/lib/slug';
import { downloadBlob, triggerDownload, nodeToPng } from '@/lib/exportUtils';

export async function exportTransformacaoPng(node: HTMLElement, nome: string): Promise<void> {
  const { dataUrl } = await nodeToPng(node);
  triggerDownload(dataUrl, `${slugify(nome || 'transformacao')}.png`);
}

export async function exportTransformacaoPdf(node: HTMLElement, nome: string): Promise<void> {
  const { dataUrl, width, height } = await nodeToPng(node);
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({
    unit: 'pt',
    format: [width, height],
    orientation: width > height ? 'l' : 'p',
  });
  doc.addImage(dataUrl, 'PNG', 0, 0, width, height);
  doc.save(`${slugify(nome || 'transformacao')}.pdf`);
}

export function exportTransformacaoJson(t: Transformacao): void {
  const blob = new Blob([JSON.stringify(t, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `${slugify(t.nome, 'transformacao')}.json`);
}

export type TransformacaoJsonImportResult =
  | { ok: true; data: Transformacao }
  | { ok: false; error: string };

export async function parseTransformacaoJsonImport(
  file: File,
): Promise<TransformacaoJsonImportResult> {
  try {
    const raw = JSON.parse(await file.text());
    const parsed = transformacaoSchema.safeParse(raw);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const msg = issue
        ? `Arquivo inválido: ${issue.path.join('.')} — ${issue.message}`
        : 'Arquivo inválido';
      return { ok: false, error: msg };
    }
    return { ok: true, data: parsed.data as Transformacao };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Erro desconhecido ao ler o arquivo',
    };
  }
}
