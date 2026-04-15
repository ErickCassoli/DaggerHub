import type { Adversary } from '@/types/adversary';
import { AdversaryCard } from './AdversaryCard';

interface LibraryGridProps {
  items: Adversary[];
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onExportJson: (adv: Adversary) => void;
}

export function LibraryGrid({ items, onDuplicate, onDelete, onExportJson }: LibraryGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-ink/30 bg-white/40 p-8 text-center">
        <p className="text-ink/70">Nenhuma adversária salva ainda.</p>
        <p className="mt-1 text-sm text-ink/60">Crie sua primeira no botão acima.</p>
      </div>
    );
  }

  return (
    <div className="[column-gap:1.5rem] [columns:450px]">
      {items.map((adv) => (
        <div key={adv.id} className="mb-6 break-inside-avoid">
          <AdversaryCard
            adversary={adv}
            onDuplicate={() => onDuplicate(adv.id)}
            onDelete={() => onDelete(adv.id)}
            onExportJson={() => onExportJson(adv)}
          />
        </div>
      ))}
    </div>
  );
}
