import type { Ambiente } from '@/types/ambiente';
import { ambienteSchema } from '@/lib/ambienteSchema';
import { slugify } from '@/lib/slug';
import { triggerDownload, nodeToPng } from '@/lib/exportUtils';

export async function exportAmbientePng(node: HTMLElement, nome: string): Promise<void> {
  const { dataUrl } = await nodeToPng(node);
  triggerDownload(dataUrl, `${slugify(nome || 'ambiente')}.png`);
}

export async function exportAmbientePdf(node: HTMLElement, nome: string): Promise<void> {
  const { dataUrl, width, height } = await nodeToPng(node);
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: [width, height], orientation: width > height ? 'l' : 'p' });
  doc.addImage(dataUrl, 'PNG', 0, 0, width, height);
  doc.save(`${slugify(nome || 'ambiente')}.pdf`);
}

export function exportAmbienteJson(ambiente: Ambiente): void {
  const blob = new Blob([JSON.stringify(ambiente, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${slugify(ambiente.nome || 'ambiente')}.json`);
  URL.revokeObjectURL(url);
}

export type AmbienteJsonImportResult =
  | { ok: true; data: Ambiente }
  | { ok: false; error: string };

export async function parseAmbienteJsonImport(file: File): Promise<AmbienteJsonImportResult> {
  try {
    const text = await file.text();
    const raw = JSON.parse(text);
    const parsed = ambienteSchema.safeParse(raw);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const msg = issue
        ? `Arquivo inválido: ${issue.path.join('.')} — ${issue.message}`
        : 'Arquivo inválido';
      return { ok: false, error: msg };
    }
    return { ok: true, data: parsed.data as Ambiente };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erro desconhecido ao ler o arquivo' };
  }
}
