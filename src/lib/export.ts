import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import type { Adversary } from '@/types/adversary';
import { adversarySchema } from '@/lib/schema';
import { slugify } from '@/lib/slug';

function triggerDownload(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

async function nodeToPng(node: HTMLElement): Promise<{ dataUrl: string; width: number; height: number }> {
  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    cacheBust: true,
  });
  return { dataUrl, width: node.offsetWidth, height: node.offsetHeight };
}

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

export interface JsonImportResult {
  ok: boolean;
  data?: Adversary;
  error?: string;
}

export async function parseJsonImport(file: File): Promise<JsonImportResult> {
  try {
    const text = await file.text();
    const raw = JSON.parse(text);
    const parsed = adversarySchema.safeParse(raw);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return { ok: false, error: `Arquivo inválido: ${issue.path.join('.')} — ${issue.message}` };
    }
    return { ok: true, data: parsed.data as Adversary };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erro desconhecido ao ler o arquivo' };
  }
}
