import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { parseAmbienteJsonImport } from '@/lib/ambienteExport';
import type { Ambiente } from '@/types/ambiente';

interface AmbienteImportButtonProps {
  onImport: (ambiente: Ambiente) => void;
}

export function AmbienteImportButton({ onImport }: AmbienteImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    const res = await parseAmbienteJsonImport(file);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onImport(res.data);
  };

  return (
    <div className="inline-flex flex-col items-start">
      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          void onFile(e.target.files?.[0]);
          if (inputRef.current) inputRef.current.value = '';
        }}
      />
      <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
        Importar JSON
      </Button>
      {error ? <p className="mt-1 text-xs text-red-800">{error}</p> : null}
    </div>
  );
}
