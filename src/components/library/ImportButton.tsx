import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { parseJsonImport } from '@/lib/export';
import type { Adversary } from '@/types/adversary';

interface ImportButtonProps {
  onImport: (adversary: Adversary) => void;
}

export function ImportButton({ onImport }: ImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    const res = await parseJsonImport(file);
    if (!res.ok || !res.data) {
      setError(res.error ?? 'Erro ao importar');
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
