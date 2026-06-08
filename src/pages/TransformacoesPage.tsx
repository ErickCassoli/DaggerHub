import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { AppHeader } from '@/components/nav/AppHeader';
import { TransformacaoCard } from '@/components/transformacao/TransformacaoCard';
import { TransformacaoImportButton } from '@/components/transformacao/TransformacaoImportButton';
import { useTransformacaoLibrary } from '@/hooks/useTransformacaoLibrary';
import { exportTransformacaoJson } from '@/lib/transformacaoExport';

export function TransformacoesPage() {
  const { items, remove, duplicate, importOne } = useTransformacaoLibrary();

  const confirmDelete = (id: string) => {
    const t = items.find((i) => i.id === id);
    const ok = confirm(
      `Excluir "${t?.nome ?? 'transformação'}"? Essa ação não pode ser desfeita.`,
    );
    if (ok) remove(id);
  };

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <AppHeader
        subtitle="Transformações — modificadores para personagens e adversárias (Hope & Fear)"
        actions={
          <>
            <TransformacaoImportButton onImport={importOne} />
            <Link to="/transformacoes/new">
              <Button>+ Nova transformação</Button>
            </Link>
          </>
        }
      />

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-ink/30 bg-white/40 dark:bg-white/5 p-8 text-center">
          <p className="text-ink/70">Nenhuma transformação salva ainda.</p>
          <p className="mt-1 text-sm text-ink/60">Crie a primeira no botão acima.</p>
        </div>
      ) : (
        <div className="columns-1 gap-6 sm:columns-[470px]">
          {items.map((t) => (
            <div key={t.id} className="mb-6 break-inside-avoid">
              <TransformacaoCard
                transformacao={t}
                onDuplicate={() => duplicate(t.id)}
                onDelete={() => confirmDelete(t.id)}
                onExportJson={() => exportTransformacaoJson(t)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
