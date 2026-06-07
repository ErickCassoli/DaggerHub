import type { Adversary, Patamar } from '@/types/adversary';
import { AdversaryCard } from './AdversaryCard';

interface LibraryGridProps {
  items: Adversary[];
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onExportJson: (adv: Adversary) => void;
  onReTier: (id: string, newPatamar: Patamar) => void;
}

export function LibraryGrid({ items, onDuplicate, onDelete, onExportJson, onReTier }: LibraryGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-ink/30 bg-white/40 dark:bg-white/5 p-8 text-center">
        <p className="text-ink/70">Nenhuma adversária salva ainda.</p>
        <p className="mt-1 text-sm text-ink/60">Crie sua primeira no botão acima.</p>
      </div>
    );
  }

  return (
    <div className="columns-1 gap-6 sm:columns-[470px]">
      {items.map((adv) => (
        <div key={adv.id} className="mb-6 break-inside-avoid">
          <AdversaryCard
            adversary={adv}
            onDuplicate={() => onDuplicate(adv.id)}
            onDelete={() => onDelete(adv.id)}
            onExportJson={() => onExportJson(adv)}
            onReTier={(newPatamar) => onReTier(adv.id, newPatamar)}
          />
        </div>
      ))}
    </div>
  );
}
