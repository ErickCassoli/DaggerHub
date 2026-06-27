import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { AppHeader } from '@/components/nav/AppHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Section } from '@/components/ui/Section';
import { BudgetBar } from '@/components/encounter/BudgetBar';
import { PartyConfig } from '@/components/encounter/PartyConfig';
import { EntryRow } from '@/components/encounter/EntryRow';
import { AddAdversaryModal } from '@/components/encounter/AddAdversaryModal';
import { SessionTrackerModal } from '@/components/encounter/SessionTrackerModal';
import type { InstanceState } from '@/components/encounter/SessionTrackerModal';
import { EncounterSummaryBlock } from '@/components/encounter/EncounterSummaryBlock';
import type { SummaryEntry } from '@/components/encounter/EncounterSummaryBlock';
import { StatsBlock } from '@/components/StatsBlock/StatsBlock';
import { useEncounterLibrary } from '@/hooks/useEncounterLibrary';
import { useAdversaryLibrary } from '@/hooks/useAdversaryLibrary';
import { resolveAdversary } from '@/lib/adversarySources';
import { balanceVerdict, calculateBudget, encounterCost } from '@/lib/encounter';
import { exportEncounterJson, exportEncounterPdf } from '@/lib/encounterExport';
import type { Encounter, EncounterEntry } from '@/types/encounter';

function blankEncounter(): Encounter {
  return {
    id: nanoid(10),
    nome: '',
    descricao: '',
    party: { numPC: 4, nivelPC: 1 },
    ajustes: [],
    entries: [],
    notas: '',
    criadoEm: '',
    atualizadoEm: '',
  };
}

export function EncounterBuilderPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { get, upsert } = useEncounterLibrary();
  const { items: biblioteca } = useAdversaryLibrary();

  const initial = useMemo<Encounter>(() => {
    if (id) {
      const found = get(id);
      if (found) return found;
    }
    return blankEncounter();
  }, [id, get]);

  const [encounter, setEncounter] = useState<Encounter>(initial);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sessionInstances, setSessionInstances] = useState<InstanceState[] | null>(null);
  const [sessionMedo, setSessionMedo] = useState(0);
  const [sessionOpen, setSessionOpen] = useState(false);

  const summaryExportRef = useRef<HTMLDivElement>(null);
  const blockNodesRef = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (id && !get(id)) {
      navigate('/encounters', { replace: true });
    }
  }, [id, get, navigate]);

  const budget = calculateBudget(encounter.party, encounter.ajustes);
  const costBreakdown = encounterCost(
    encounter.entries,
    (ref, origem) => resolveAdversary(ref, origem, biblioteca),
    encounter.party,
  );
  const verdict = balanceVerdict(budget, costBreakdown.total);

  const summaryEntries = useMemo<SummaryEntry[]>(
    () =>
      costBreakdown.porEntry
        .filter((p): p is typeof p & { adversary: NonNullable<typeof p.adversary> } => !!p.adversary)
        .map((p) => ({
          adversary: p.adversary,
          quantidade: encounter.entries.find((e) => e.id === p.entryId)?.quantidade ?? 1,
          custo: p.custo,
        })),
    [costBreakdown, encounter.entries],
  );

  const doExportPdf = async () => {
    if (!summaryExportRef.current) return;
    const blockNodes = encounter.entries
      .map((e) => blockNodesRef.current.get(e.id))
      .filter((n): n is HTMLDivElement => n !== undefined);
    try {
      setExporting(true);
      await exportEncounterPdf(summaryExportRef.current, blockNodes, encounter.nome);
    } finally {
      setExporting(false);
    }
  };

  const save = () => {
    const saved = upsert(encounter);
    setEncounter(saved);
    setSavedAt(saved.atualizadoEm);
    if (!id) navigate(`/encounters/edit/${saved.id}`, { replace: true });
  };

  const addEntry = (adversary: { id: string }, origem: EncounterEntry['origem']) => {
    setEncounter((prev) => {
      const existing = prev.entries.find(
        (e) => e.adversaryRef === adversary.id && e.origem === origem,
      );
      if (existing) {
        return {
          ...prev,
          entries: prev.entries.map((e) =>
            e.id === existing.id ? { ...e, quantidade: e.quantidade + 1 } : e,
          ),
        };
      }
      return {
        ...prev,
        entries: [
          ...prev.entries,
          { id: nanoid(8), adversaryRef: adversary.id, origem, quantidade: 1 },
        ],
      };
    });
    setModalOpen(false);
  };

  const updateEntryQty = (entryId: string, qty: number) => {
    setEncounter((prev) => ({
      ...prev,
      entries: prev.entries.map((e) => (e.id === entryId ? { ...e, quantidade: qty } : e)),
    }));
  };

  const removeEntry = (entryId: string) => {
    setEncounter((prev) => ({ ...prev, entries: prev.entries.filter((e) => e.id !== entryId) }));
  };

  const startSession = () => {
    const instances = costBreakdown.porEntry.flatMap((p) => {
      const adversary = p.adversary;
      if (!adversary) return [];
      const qty = encounter.entries.find((e) => e.id === p.entryId)?.quantidade ?? 1;
      return Array.from({ length: qty }, (_, i) => ({
        key: `${p.entryId}-${i}`,
        nome: qty > 1 ? `${adversary.nome} ${i + 1}` : adversary.nome,
        pvMax: adversary.pv,
        pvAtual: adversary.pv,
        estresse: 0,
        limiarMaior: adversary.limiarMaior,
        limiarGrave: adversary.limiarGrave,
      }));
    });
    setSessionInstances(instances);
    setSessionMedo(0);
    setSessionOpen(true);
  };

  const updateSessionInstance = (
    key: string,
    updates: Partial<Pick<InstanceState, 'pvAtual' | 'estresse'>>,
  ) => {
    setSessionInstances((prev) =>
      prev?.map((inst) => (inst.key === key ? { ...inst, ...updates } : inst)) ?? null,
    );
  };

  const endSession = () => {
    setSessionInstances(null);
    setSessionMedo(0);
    setSessionOpen(false);
  };

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <AppHeader
        subtitle={id ? 'Editar encontro' : 'Novo encontro'}
        actions={
          <>
            <Link to="/encounters" className="text-sm text-ink/70 underline">← Encontros</Link>
            <Button type="button" variant="primary" onClick={save}>Salvar</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={doExportPdf}
              disabled={exporting || encounter.entries.length === 0}
            >
              {exporting ? 'PDF…' : 'PDF'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => exportEncounterJson(encounter)}>
              JSON
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={sessionInstances ? () => setSessionOpen(true) : startSession}
              disabled={encounter.entries.length === 0}
              title={encounter.entries.length === 0 ? 'Adicione adversárias primeiro' : undefined}
            >
              {sessionInstances ? '▶ Retomar' : '▶ Sessão'}
            </Button>
          </>
        }
      />

      {savedAt ? (
        <p className="mb-3 rounded border border-green-800/30 bg-green-50 px-3 py-2 text-sm text-green-900">
          Salvo no navegador (localStorage).
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Section title="Identidade">
            <label className="block">
              <span className="field-label">Nome do encontro</span>
              <Input
                value={encounter.nome}
                onChange={(e) => setEncounter((p) => ({ ...p, nome: e.target.value }))}
                placeholder="Ex.: Emboscada na Floresta"
              />
            </label>
            <label className="block">
              <span className="field-label">Descrição</span>
              <Textarea
                rows={3}
                value={encounter.descricao}
                onChange={(e) => setEncounter((p) => ({ ...p, descricao: e.target.value }))}
                placeholder="Cenário, gancho, objetivos…"
              />
            </label>
          </Section>

          <PartyConfig
            party={encounter.party}
            ajustes={encounter.ajustes}
            onPartyChange={(party) => setEncounter((p) => ({ ...p, party }))}
            onAjustesChange={(ajustes) => setEncounter((p) => ({ ...p, ajustes }))}
          />

          <BudgetBar budget={budget} total={costBreakdown.total} verdict={verdict} />

          <Section title="Notas do mestre" defaultOpen={false}>
            <Textarea
              rows={6}
              value={encounter.notas}
              onChange={(e) => setEncounter((p) => ({ ...p, notas: e.target.value }))}
              placeholder="Táticas, gatilhos narrativos, loot…"
            />
          </Section>
        </aside>

        <main>
          <Section
            title="Adversárias no encontro"
            subtitle={`${encounter.entries.length} entrada${encounter.entries.length === 1 ? '' : 's'}`}
            actions={
              <Button size="sm" variant="primary" type="button" onClick={() => setModalOpen(true)}>
                + Adicionar
              </Button>
            }
          >
            {encounter.entries.length === 0 ? (
              <p className="rounded border border-dashed border-ink/30 bg-white/40 dark:bg-white/5 p-6 text-center text-sm text-ink/70">
                Adicione adversárias da sua biblioteca ou do bestiário oficial.
              </p>
            ) : (
              <ul className="space-y-2">
                {encounter.entries.map((entry) => {
                  const breakdown = costBreakdown.porEntry.find((p) => p.entryId === entry.id);
                  return (
                    <EntryRow
                      key={entry.id}
                      entry={entry}
                      adversary={breakdown?.adversary}
                      custo={breakdown?.custo ?? 0}
                      onChangeQty={(qty) => updateEntryQty(entry.id, qty)}
                      onRemove={() => removeEntry(entry.id)}
                    />
                  );
                })}
              </ul>
            )}
          </Section>
        </main>
      </div>

      <AddAdversaryModal
        open={modalOpen}
        biblioteca={biblioteca}
        onClose={() => setModalOpen(false)}
        onPick={addEntry}
      />

      <SessionTrackerModal
        open={sessionOpen}
        instances={sessionInstances ?? []}
        medo={sessionMedo}
        nomeEncontro={encounter.nome}
        onUpdateInstance={updateSessionInstance}
        onUpdateMedo={setSessionMedo}
        onPause={() => setSessionOpen(false)}
        onEnd={endSession}
      />

      {/* Off-screen nodes for PDF export */}
      <div aria-hidden className="pointer-events-none absolute left-[-9999px] top-[-9999px]">
        <EncounterSummaryBlock
          ref={summaryExportRef}
          encounter={encounter}
          entries={summaryEntries}
          budget={budget}
          total={costBreakdown.total}
          verdict={verdict}
        />
        {costBreakdown.porEntry.map((p) => {
          if (!p.adversary) return null;
          return (
            <StatsBlock
              key={p.entryId}
              adversary={p.adversary}
              ref={(el) => {
                if (el) blockNodesRef.current.set(p.entryId, el);
                else blockNodesRef.current.delete(p.entryId);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
