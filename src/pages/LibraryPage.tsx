import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Adversary, Patamar } from '@/types/adversary';
import type { Encounter } from '@/types/encounter';
import type { Ambiente } from '@/types/ambiente';
import { Button } from '@/components/ui/Button';
import { AppHeader } from '@/components/nav/AppHeader';
import { LibraryGrid } from '@/components/library/LibraryGrid';
import { ImportButton } from '@/components/library/ImportButton';
import { BundleButtons } from '@/components/library/BundleButtons';
import { useAdversaryLibrary } from '@/hooks/useAdversaryLibrary';
import { useEncounterLibrary } from '@/hooks/useEncounterLibrary';
import { useAmbienteLibrary } from '@/hooks/useAmbienteLibrary';
import { exportJson } from '@/lib/export';

export function LibraryPage() {
  const { items, remove, duplicate, importOne, reTier } = useAdversaryLibrary();
  const { importOne: importEncounter } = useEncounterLibrary();
  const { importOne: importAmbiente } = useAmbienteLibrary();
  const [toast, setToast] = useState<string | null>(null);

  const confirmDelete = (id: string) => {
    const adv = items.find((i) => i.id === id);
    const ok = confirm(`Excluir "${adv?.nome ?? 'adversária'}"? Essa ação não pode ser desfeita.`);
    if (ok) remove(id);
  };

  const handleReTier = (id: string, newPatamar: Patamar) => {
    const copy = reTier(id, newPatamar);
    if (copy) {
      setToast(`"${copy.nome}" adicionada à biblioteca.`);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleBundleImport = (
    adversarias: Adversary[],
    encontros: Encounter[],
    ambientes: Ambiente[],
  ) => {
    adversarias.forEach((a) => importOne(a));
    encontros.forEach((e) => importEncounter(e));
    ambientes.forEach((a) => importAmbiente(a));
    const parts = [
      adversarias.length > 0 ? `${adversarias.length} adversária${adversarias.length !== 1 ? 's' : ''}` : '',
      encontros.length > 0 ? `${encontros.length} encontro${encontros.length !== 1 ? 's' : ''}` : '',
      ambientes.length > 0 ? `${ambientes.length} ambiente${ambientes.length !== 1 ? 's' : ''}` : '',
    ].filter(Boolean);
    setToast(`Pacote importado: ${parts.join(', ')}.`);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <AppHeader
        subtitle="Biblioteca do usuário — adversárias salvas localmente"
        actions={
          <>
            <BundleButtons onImport={handleBundleImport} />
            <ImportButton onImport={importOne} />
            <Link to="/new">
              <Button>+ Nova adversária</Button>
            </Link>
          </>
        }
      />

      {toast ? (
        <p className="mb-3 rounded border border-green-800/30 bg-green-50 px-3 py-2 text-sm text-green-900 dark:border-green-700/30 dark:bg-green-950 dark:text-green-200">
          {toast}
        </p>
      ) : null}

      <LibraryGrid
        items={items}
        onDuplicate={(id) => duplicate(id)}
        onDelete={confirmDelete}
        onExportJson={(adv) => exportJson(adv)}
        onReTier={handleReTier}
      />
    </div>
  );
}
