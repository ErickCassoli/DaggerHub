import type { Encounter } from '@/types/encounter';
import { slugify } from '@/lib/slug';
import { downloadBlob, nodeToPng } from '@/lib/exportUtils';

export function exportEncounterJson(encounter: Encounter): void {
  const blob = new Blob([JSON.stringify(encounter, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `${slugify(encounter.nome, 'encontro')}.json`);
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
