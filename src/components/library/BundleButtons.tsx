import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { exportBundle, parseBundleImport } from '@/lib/bundleExport';
import type { Adversary } from '@/types/adversary';
import type { Encounter } from '@/types/encounter';
import type { Ambiente } from '@/types/ambiente';

interface BundleButtonsProps {
  onImport: (adversarias: Adversary[], encontros: Encounter[], ambientes: Ambiente[]) => void;
}

export function BundleButtons({ onImport }: BundleButtonsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);

    const res = await parseBundleImport(file);
    if (!res.ok) {
      setError(res.error);
      return;
    }

    const { adversarias, encontros, ambientes } = res;
    const parts = [
      adversarias.length > 0 ? `${adversarias.length} adversária${adversarias.length !== 1 ? 's' : ''}` : '',
      encontros.length > 0 ? `${encontros.length} encontro${encontros.length !== 1 ? 's' : ''}` : '',
      ambientes.length > 0 ? `${ambientes.length} ambiente${ambientes.length !== 1 ? 's' : ''}` : '',
    ].filter(Boolean);

    const msg = `Importar ${parts.join(', ')}? IDs duplicados serão renomeados automaticamente.`;
    if (!confirm(msg)) return;

    onImport(adversarias, encontros, ambientes);

    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={exportBundle}>
          Exportar pacote
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            void onFile(e.target.files?.[0]);
          }}
        />
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
          Importar pacote
        </Button>
      </div>
      {error ? <p className="text-xs text-red-800 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
