import type { Encounter } from '@/types/encounter';
import { slugify } from '@/lib/slug';
import { triggerDownload } from '@/lib/exportUtils';

export function exportEncounterJson(encounter: Encounter): void {
  const blob = new Blob([JSON.stringify(encounter, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${slugify(encounter.nome || 'encontro')}.json`);
  URL.revokeObjectURL(url);
}
