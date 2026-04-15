import { useMemo, useState } from 'react';
import type { Adversary, Patamar, Tipo } from '@/types/adversary';
import { TIPOS, TIPO_LABEL } from '@/data/tipos';
import { PATAMARES, PATAMAR_LABEL } from '@/data/patamares';
import { BATTLE_POINT_COST } from '@/data/encounterRules';
import { searchAdversaries } from '@/lib/adversarySources';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { EncounterEntry } from '@/types/encounter';

interface AddAdversaryModalProps {
  open: boolean;
  biblioteca: Adversary[];
  onClose: () => void;
  onPick: (adversary: Adversary, origem: EncounterEntry['origem']) => void;
}

type OrigemFilter = 'todos' | 'biblioteca' | 'bestiario';

export function AddAdversaryModal({ open, biblioteca, onClose, onPick }: AddAdversaryModalProps) {
  const [query, setQuery] = useState('');
  const [origem, setOrigem] = useState<OrigemFilter>('todos');
  const [tipo, setTipo] = useState<Tipo | ''>('');
  const [patamar, setPatamar] = useState<Patamar | ''>('');

  const results = useMemo(
    () =>
      searchAdversaries(biblioteca, {
        query,
        origem,
        tipo: tipo || undefined,
        patamar: patamar || undefined,
      }),
    [biblioteca, query, origem, tipo, patamar],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="flex max-h-[min(90vh,800px)] w-full max-w-3xl flex-col rounded-md border border-ink/30 bg-parchment shadow-xl">
        <header className="flex items-center justify-between border-b border-ink/20 px-4 py-3">
          <h2 className="font-display text-lg uppercase tracking-wide text-ink">
            Adicionar adversária
          </h2>
          <Button size="sm" variant="ghost" onClick={onClose} aria-label="Fechar">✕</Button>
        </header>

        <div className="grid grid-cols-1 gap-3 border-b border-ink/20 px-4 py-3 sm:grid-cols-4">
          <Input
            type="search"
            placeholder="Buscar por nome…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="sm:col-span-2"
          />
          <Select value={origem} onChange={(e) => setOrigem(e.target.value as OrigemFilter)}>
            <option value="todos">Origem: todos</option>
            <option value="biblioteca">Biblioteca</option>
            <option value="bestiario">Bestiário</option>
          </Select>
          <div className="grid grid-cols-2 gap-2 sm:col-span-1">
            <Select value={tipo} onChange={(e) => setTipo(e.target.value as Tipo | '')}>
              <option value="">Tipo</option>
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
            <Select
              value={patamar === '' ? '' : String(patamar)}
              onChange={(e) => setPatamar(e.target.value === '' ? '' : (Number(e.target.value) as Patamar))}
            >
              <option value="">Patamar</option>
              {PATAMARES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {results.length === 0 ? (
            <p className="rounded border border-dashed border-ink/30 bg-white/40 p-6 text-center text-sm text-ink/70">
              Nada encontrado. {origem === 'bestiario' ? 'O bestiário oficial ainda não foi populado.' : 'Ajuste os filtros ou crie uma adversária na biblioteca.'}
            </p>
          ) : (
            <ul className="space-y-2">
              {results.map(({ adversary, origem: resultOrigem }) => (
                <li
                  key={`${resultOrigem}:${adversary.id}`}
                  className="flex items-center gap-3 rounded border border-ink/20 bg-white/60 px-3 py-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold text-ink">
                      {adversary.nome}
                      {resultOrigem === 'bestiario' ? (
                        <span className="ml-2 rounded bg-gold/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink/70">
                          oficial
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-ink/60">
                      {TIPO_LABEL[adversary.tipo]} · {PATAMAR_LABEL[adversary.patamar]} ·{' '}
                      {adversary.tipo === 'lacaio'
                        ? '1 PB / conjunto de PCs'
                        : `${BATTLE_POINT_COST[adversary.tipo]} PB`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    type="button"
                    onClick={() => onPick(adversary, resultOrigem)}
                  >
                    Adicionar
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
