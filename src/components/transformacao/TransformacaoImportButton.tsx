import { useRef, useState } from 'react';
import type { Transformacao } from '@/types/transformacao';
import { Button } from '@/components/ui/Button';
import { parseTransformacaoJsonImport } from '@/lib/transformacaoExport';

interface TransformacaoImportButtonProps {
  onImport: (t: Transformacao) => void;
}

export function TransformacaoImportButton({ onImport }: TransformacaoImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    const res = await parseTransformacaoJsonImport(file);
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
          const file = e.target.files?.[0];
          // Limpa sempre: permite re-selecionar o mesmo arquivo após erro.
          e.target.value = '';
          void onFile(file);
        }}
      />
      <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
        Importar JSON
      </Button>
      {error ? (
        <p className="mt-1 text-xs text-red-800 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
