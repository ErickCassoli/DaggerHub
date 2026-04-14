import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { LibraryGrid } from '@/components/library/LibraryGrid';
import { ImportButton } from '@/components/library/ImportButton';
import { useAdversaryLibrary } from '@/hooks/useAdversaryLibrary';
import { exportJson } from '@/lib/export';

export function LibraryPage() {
  const { items, remove, duplicate, importOne } = useAdversaryLibrary();

  const confirmDelete = (id: string) => {
    const adv = items.find((i) => i.id === id);
    const ok = confirm(`Excluir "${adv?.nome ?? 'adversária'}"? Essa ação não pode ser desfeita.`);
    if (ok) remove(id);
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wider text-ink">DaggerHub</h1>
          <p className="text-sm text-ink/70">Gerador de stats block — Daggerheart (pt-BR)</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportButton onImport={importOne} />
          <Link to="/new">
            <Button>+ Nova adversária</Button>
          </Link>
        </div>
      </header>

      <LibraryGrid
        items={items}
        onDuplicate={(id) => duplicate(id)}
        onDelete={confirmDelete}
        onExportJson={(adv) => exportJson(adv)}
      />
    </div>
  );
}
