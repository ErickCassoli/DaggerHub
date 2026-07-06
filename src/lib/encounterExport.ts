import type { Encounter } from '@/types/encounter';
import { slugify } from '@/lib/slug';
import { downloadBlob, nodeToPng, triggerDownload } from '@/lib/exportUtils';

export type EncounterJsonImportResult =
  | { ok: true; data: Encounter }
  | { ok: false; error: string };

function isEncounterShape(v: unknown): v is Encounter {
  if (!v || typeof v !== 'object') return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj['id'] === 'string' &&
    typeof obj['nome'] === 'string' &&
    Array.isArray(obj['entries']) &&
    obj['party'] !== null &&
    typeof obj['party'] === 'object'
  );
}

export async function parseEncounterJsonImport(file: File): Promise<EncounterJsonImportResult> {
  try {
    const raw: unknown = JSON.parse(await file.text());
    if (!isEncounterShape(raw)) {
      return { ok: false, error: 'Arquivo inválido: não parece ser um encontro exportado pelo DaggerHub.' };
    }
    return { ok: true, data: raw };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erro desconhecido ao ler o arquivo' };
  }
}

export function exportEncounterJson(encounter: Encounter): void {
  const blob = new Blob([JSON.stringify(encounter, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `${slugify(encounter.nome, 'encontro')}.json`);
}

/** Exporta apenas o bloco-resumo do encontro como imagem PNG (sem os stat blocks individuais). */
export async function exportEncounterPng(summaryNode: HTMLElement, nome: string): Promise<void> {
  const { dataUrl } = await nodeToPng(summaryNode);
  triggerDownload(dataUrl, `${slugify(nome, 'encontro')}.png`);
}

/**
 * Exporta o encontro como PDF multi-página:
 * página 1 = bloco-resumo do encontro, páginas seguintes = um stat block por adversária.
 */
export async function exportEncounterPdf(
  summaryNode: HTMLElement,
  blockNodes: HTMLElement[],
  nome: string,
): Promise<void> {
  const allNodes = [summaryNode, ...blockNodes];
  const images = await Promise.all(allNodes.map((n) => nodeToPng(n)));

  const { default: jsPDF } = await import('jspdf');

  const first = images[0];
  const doc = new jsPDF({
    unit: 'pt',
    format: [first.width, first.height],
    orientation: first.width > first.height ? 'l' : 'p',
  });
  doc.addImage(first.dataUrl, 'PNG', 0, 0, first.width, first.height);

  for (let i = 1; i < images.length; i++) {
    const { dataUrl, width, height } = images[i];
    doc.addPage([width, height], width > height ? 'l' : 'p');
    doc.addImage(dataUrl, 'PNG', 0, 0, width, height);
  }

  doc.save(`${slugify(nome || 'encontro')}.pdf`);
}
