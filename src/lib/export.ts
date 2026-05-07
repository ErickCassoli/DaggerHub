import jsPDF from 'jspdf';
import type { Adversary } from '@/types/adversary';
import { adversarySchema } from '@/lib/schema';
import { slugify } from '@/lib/slug';
import { triggerDownload, nodeToPng } from '@/lib/exportUtils';

export async function exportPng(node: HTMLElement, nome: string): Promise<void> {
  const { dataUrl } = await nodeToPng(node);
  triggerDownload(dataUrl, `${slugify(nome)}.png`);
}

export async function exportPdf(node: HTMLElement, nome: string): Promise<void> {
  const { dataUrl, width, height } = await nodeToPng(node);
  const doc = new jsPDF({ unit: 'pt', format: [width, height], orientation: width > height ? 'l' : 'p' });
  doc.addImage(dataUrl, 'PNG', 0, 0, width, height);
  doc.save(`${slugify(nome)}.pdf`);
}

export function exportJson(adversary: Adversary): void {
  const blob = new Blob([JSON.stringify(adversary, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${slugify(adversary.nome)}.json`);
  URL.revokeObjectURL(url);
}

export type JsonImportResult =
  | { ok: true; data: Adversary }
  | { ok: false; error: string };

export async function parseJsonImport(file: File): Promise<JsonImportResult> {
  try {
    const text = await file.text();
    const raw = JSON.parse(text);
    const parsed = adversarySchema.safeParse(raw);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const msg = issue
        ? `Arquivo inválido: ${issue.path.join('.')} — ${issue.message}`
        : 'Arquivo inválido';
      return { ok: false, error: msg };
    }
    return { ok: true, data: parsed.data as Adversary };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erro desconhecido ao ler o arquivo' };
  }
}
