import type { Encounter } from '@/types/encounter';
import { slugify } from '@/lib/slug';

function triggerDownload(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function exportEncounterJson(encounter: Encounter): void {
  const blob = new Blob([JSON.stringify(encounter, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${slugify(encounter.nome || 'encontro')}.json`);
  URL.revokeObjectURL(url);
}
