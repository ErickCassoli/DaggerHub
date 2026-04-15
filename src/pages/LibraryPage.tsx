import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { AppHeader } from '@/components/nav/AppHeader';
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
      <AppHeader
        subtitle="Biblioteca do usuário — adversárias salvas localmente"
        actions={
          <>
            <ImportButton onImport={importOne} />
            <Link to="/new">
              <Button>+ Nova adversária</Button>
            </Link>
          </>
        }
      />

      <LibraryGrid
        items={items}
        onDuplicate={(id) => duplicate(id)}
        onDelete={confirmDelete}
        onExportJson={(adv) => exportJson(adv)}
      />
    </div>
  );
}
