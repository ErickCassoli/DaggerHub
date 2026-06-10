import { toPng } from 'html-to-image';

export function triggerDownload(url: string, filename: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/** Baixa um blob revogando a object URL com atraso (revogar síncrono pode abortar o download em Firefox/Safari). */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function nodeToPng(
  node: HTMLElement,
): Promise<{ dataUrl: string; width: number; height: number }> {
  // cacheBust:false — os blocos de export usam fontes de sistema; não há recurso
  // externo crítico para embutir. Evita requisição desnecessária a fonts.googleapis.com
  // em cada export, melhorando privacidade e funcionamento offline.
  const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: false });
  return { dataUrl, width: node.offsetWidth, height: node.offsetHeight };
}
