import { forwardRef } from 'react';
import type { Adversary } from '@/types/adversary';
import type { Encounter } from '@/types/encounter';
import { TIPO_LABEL } from '@/data/tipos';
import { PATAMAR_LABEL } from '@/data/patamares';
import { ADJUSTMENT_BY_KEY } from '@/data/encounterRules';
import type { BalanceVerdict } from '@/lib/encounter';

export interface SummaryEntry {
  adversary: Adversary;
  quantidade: number;
  custo: number;
}

interface EncounterSummaryBlockProps {
  encounter: Encounter;
  entries: SummaryEntry[];
  budget: number;
  total: number;
  verdict: BalanceVerdict;
}

const VERDICT_LABEL: Record<BalanceVerdict, string> = {
  abaixo: 'Abaixo do orçamento',
  equilibrado: 'Equilibrado',
  acima: 'Acima do orçamento',
};

const VERDICT_COLOR: Record<BalanceVerdict, string> = {
  abaixo: '#2563eb',
  equilibrado: '#15803d',
  acima: '#dc2626',
};

export const EncounterSummaryBlock = forwardRef<HTMLDivElement, EncounterSummaryBlockProps>(
  function EncounterSummaryBlock({ encounter, entries, budget, total, verdict }, ref) {
    const { nome, party, ajustes, descricao, notas } = encounter;

    const activeAjustes = ajustes
      .map((k) => ADJUSTMENT_BY_KEY[k]?.label)
      .filter((l): l is string => !!l);

    return (
      <div
        ref={ref}
        className="w-[450px] rounded-[12px] border border-[#d1c8b4] bg-[#f4efdf] p-[15px] text-[#1a1a1a]"
        style={{
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          boxShadow: '0 10px 26px -10px rgba(58,38,16,.45), inset 0 1px 0 rgba(255,255,255,.3)',
          outline: '1px solid rgba(163,128,46,.25)',
          outlineOffset: '-6px',
        }}
      >
        <header>
          <h1
            className="m-0 text-[22.4px] font-black uppercase leading-[1.15] tracking-[-0.5px] text-[#1a1a1a]"
            style={{ fontFamily: '"Cinzel", serif' }}
          >
            {nome || 'Encontro sem nome'}
          </h1>
          <p className="my-[2px] text-[15.2px] font-bold italic">Encontro</p>
          {descricao ? (
            <p className="my-[5px] text-[14.4px] italic leading-[1.5]">{descricao}</p>
          ) : null}
          <p className="mt-[5px] mb-[10px] text-[14.4px] leading-[1.5]">
            <strong className="font-extrabold">Grupo:</strong>{' '}
            {party.numPC} PCs · Nível {party.nivelPC}°
          </p>
        </header>

        {/* Combat budget block */}
        <section className="mb-[15px] overflow-hidden rounded border border-[#d1c8b4] bg-white/80">
          <div className="grid grid-cols-3 gap-0 border-b border-[#d1c8b4]">
            <div className="border-r border-[#d1c8b4] px-[8px] py-[6px] text-center">
              <div
                className="text-[9.6px] font-semibold uppercase tracking-[0.08em] text-[#666]"
                style={{ fontFamily: '"Cinzel", serif' }}
              >
                Orçamento
              </div>
              <div className="text-[19.2px] font-bold text-[#a3802e]">{budget} PB</div>
            </div>
            <div className="border-r border-[#d1c8b4] px-[8px] py-[6px] text-center">
              <div
                className="text-[9.6px] font-semibold uppercase tracking-[0.08em] text-[#666]"
                style={{ fontFamily: '"Cinzel", serif' }}
              >
                Total
              </div>
              <div className="text-[19.2px] font-bold">{total} PB</div>
            </div>
            <div className="px-[8px] py-[6px] text-center">
              <div
                className="text-[9.6px] font-semibold uppercase tracking-[0.08em] text-[#666]"
                style={{ fontFamily: '"Cinzel", serif' }}
              >
                Balanço
              </div>
              <div
                className="text-[13.6px] font-bold leading-tight"
                style={{ color: VERDICT_COLOR[verdict] }}
              >
                {VERDICT_LABEL[verdict]}
              </div>
            </div>
          </div>

          {activeAjustes.length > 0 ? (
            <div className="flex flex-wrap gap-[6px] px-[10px] py-[6px] text-[13.6px] leading-[1.5]">
              <strong className="font-extrabold">Ajustes:</strong>{' '}
              <span>{activeAjustes.join(' · ')}</span>
            </div>
          ) : null}
        </section>

        {/* Adversary list */}
        {entries.length > 0 ? (
          <section>
            <div className="mb-[8px] flex items-center gap-[8px]" style={{ color: '#a3802e' }}>
              <span
                style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #a3802e)' }}
              />
              <span className="text-[9.6px]">◆</span>
              <span
                style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #a3802e)' }}
              />
            </div>
            <h2
              className="mb-[8px] text-center text-[12px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a]"
              style={{ fontFamily: '"Cinzel", serif', fontVariant: 'small-caps' }}
            >
              Adversárias
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {entries.map((e, i) => (
                  <tr
                    key={i}
                    style={
                      i < entries.length - 1
                        ? { borderBottom: '1px dotted #d1c8b4' }
                        : undefined
                    }
                  >
                    <td className="py-[4px] pr-[8px] text-[14.4px] font-bold leading-[1.4]">
                      {e.adversary.nome}
                    </td>
                    <td className="py-[4px] pr-[8px] text-[13.6px] italic text-[#5c4a1e]">
                      {TIPO_LABEL[e.adversary.tipo]} · {PATAMAR_LABEL[e.adversary.patamar]}°
                    </td>
                    <td className="py-[4px] pr-[8px] text-center text-[13.6px]">
                      ×{e.quantidade}
                    </td>
                    <td className="py-[4px] text-right text-[13.6px] text-[#a3802e] font-bold">
                      {e.custo} PB
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        {/* Notes */}
        {notas ? (
          <>
            <div className="mt-[12px] mb-[8px] flex items-center gap-[8px]" style={{ color: '#a3802e' }}>
              <span
                style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #a3802e)' }}
              />
              <span className="text-[9.6px]">◆</span>
              <span
                style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #a3802e)' }}
              />
            </div>
            <h2
              className="mb-[6px] text-center text-[12px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a]"
              style={{ fontFamily: '"Cinzel", serif', fontVariant: 'small-caps' }}
            >
              Notas do Mestre
            </h2>
            <p className="text-[14.4px] leading-[1.5]">{notas}</p>
          </>
        ) : null}
      </div>
    );
  },
);
