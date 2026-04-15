import { useEffect, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import { AppHeader } from '@/components/nav/AppHeader';
import { BestiarioCard } from '@/components/bestiario/BestiarioCard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { BESTIARIO } from '@/data/bestiario';
import { TIPOS } from '@/data/tipos';
import { PATAMARES } from '@/data/patamares';
import { useAdversaryLibrary } from '@/hooks/useAdversaryLibrary';
import { cloneBestiarioToLibrary } from '@/lib/adversarySources';
import type { Patamar, Tipo } from '@/types/adversary';

const PAGE_SIZE = 10;

export function BestiarioPage() {
  const { importOne } = useAdversaryLibrary();
  const [query, setQuery] = useState('');
  const [tipo, setTipo] = useState<Tipo | ''>('');
  const [patamar, setPatamar] = useState<Patamar | ''>('');
  const [toast, setToast] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BESTIARIO.filter((adv) => {
      if (tipo && adv.tipo !== tipo) return false;
      if (patamar && adv.patamar !== patamar) return false;
      if (!q) return true;
      const hay = `${adv.nome} ${adv.descricao ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, tipo, patamar]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [query, tipo, patamar]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return results.slice(start, start + PAGE_SIZE);
  }, [results, page]);

  const onCopy = (id: string) => {
    const source = BESTIARIO.find((a) => a.id === id);
    if (!source) return;
    const copy = cloneBestiarioToLibrary(source, nanoid(10));
    importOne(copy);
    setToast(`"${copy.nome}" copiada para sua biblioteca.`);
    setTimeout(() => setToast(null), 3000);
  };

  const goTo = (next: number) => {
    const clamped = Math.min(Math.max(1, next), totalPages);
    setPage(clamped);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <AppHeader subtitle="Bestiário oficial — Livro Básico pp.209–239" />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px_200px]">
        <Input
          type="search"
          placeholder="Buscar por nome…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select value={tipo} onChange={(e) => setTipo(e.target.value as Tipo | '')}>
          <option value="">Todos os tipos</option>
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </Select>
        <Select
          value={patamar === '' ? '' : String(patamar)}
          onChange={(e) =>
            setPatamar(e.target.value === '' ? '' : (Number(e.target.value) as Patamar))
          }
        >
          <option value="">Todos os patamares</option>
          {PATAMARES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </Select>
      </div>

      {toast ? (
        <p className="mb-3 rounded border border-green-800/30 bg-green-50 px-3 py-2 text-sm text-green-900">
          {toast}
        </p>
      ) : null}

      {BESTIARIO.length === 0 ? (
        <div className="rounded-md border border-dashed border-ink/30 bg-white/40 p-8 text-center">
          <p className="text-ink/70">O bestiário ainda não foi populado.</p>
          <p className="mt-1 text-sm text-ink/60">
            As adversárias do Livro Básico (pp.209–239) serão adicionadas aqui conforme o conteúdo
            for incorporado.
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-md border border-dashed border-ink/30 bg-white/40 p-8 text-center">
          <p className="text-ink/70">Nenhuma adversária corresponde aos filtros.</p>
        </div>
      ) : (
        <>
          <p className="mb-3 text-xs text-ink/60">
            Mostrando {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, results.length)} de {results.length}
          </p>

          <div className="[column-gap:1.5rem] [columns:450px]">
            {pageItems.map((adv) => (
              <div key={adv.id} className="mb-6 break-inside-avoid">
                <BestiarioCard adversary={adv} onCopy={() => onCopy(adv.id)} />
              </div>
            ))}
          </div>

          {totalPages > 1 ? (
            <nav
              aria-label="Paginação do bestiário"
              className="mt-6 flex flex-wrap items-center justify-center gap-2"
            >
              <Button
                size="sm"
                variant="secondary"
                onClick={() => goTo(page - 1)}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="px-2 text-sm text-ink/70">
                Página {page} de {totalPages}
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => goTo(page + 1)}
                disabled={page === totalPages}
              >
                Próxima
              </Button>
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}
