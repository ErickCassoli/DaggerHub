import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { AppHeader } from '@/components/nav/AppHeader';
import { AmbienteCard } from '@/components/ambiente/AmbienteCard';
import { AmbienteImportButton } from '@/components/ambiente/AmbienteImportButton';
import { useAmbienteLibrary } from '@/hooks/useAmbienteLibrary';
import { exportAmbienteJson } from '@/lib/ambienteExport';

export function AmbientesPage() {
  const { items, remove, duplicate, importOne } = useAmbienteLibrary();

  const confirmDelete = (id: string) => {
    const amb = items.find((i) => i.id === id);
    const ok = confirm(`Excluir "${amb?.nome ?? 'ambiente'}"? Essa ação não pode ser desfeita.`);
    if (ok) remove(id);
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <AppHeader
        subtitle="Ambientes — pedaços de cena com regras próprias (Livro Básico p.240)"
        actions={
          <>
            <AmbienteImportButton onImport={importOne} />
            <Link to="/ambientes/new">
              <Button>+ Novo ambiente</Button>
            </Link>
          </>
        }
      />

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-ink/30 bg-white/40 p-8 text-center">
          <p className="text-ink/70">Nenhum ambiente salvo ainda.</p>
          <p className="mt-1 text-sm text-ink/60">Crie o primeiro no botão acima.</p>
        </div>
      ) : (
        <div className="[column-gap:1.5rem] [columns:450px]">
          {items.map((amb) => (
            <div key={amb.id} className="mb-6 break-inside-avoid">
              <AmbienteCard
                ambiente={amb}
                onDuplicate={() => duplicate(amb.id)}
                onDelete={() => confirmDelete(amb.id)}
                onExportJson={() => exportAmbienteJson(amb)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
