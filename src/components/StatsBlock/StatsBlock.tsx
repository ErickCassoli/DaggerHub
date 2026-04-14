import { forwardRef } from 'react';
import type { Adversary } from '@/types/adversary';
import { PATAMAR_LABEL } from '@/data/patamares';
import { TIPO_LABEL } from '@/data/tipos';
import { AbilityItem } from './AbilityItem';

function formatSigned(n: number): string {
  if (n === 0) return '+0';
  return n > 0 ? `+${n}` : `${n}`;
}

interface StatsBlockProps {
  adversary: Adversary;
}

export const StatsBlock = forwardRef<HTMLDivElement, StatsBlockProps>(function StatsBlock(
  { adversary },
  ref,
) {
  const {
    nome,
    tipo,
    patamar,
    descricao,
    motivacoes,
    dificuldade,
    limiarMaior,
    limiarGrave,
    pv,
    pf,
    atq,
    ataques,
    experiencias,
    habilidades,
  } = adversary;

  return (
    <div
      ref={ref}
      className="w-[340px] border border-ink/30 bg-parchment text-ink shadow-md"
      style={{
        fontFamily: '"Cormorant Garamond", Georgia, serif',
      }}
    >
      {/* Header */}
      <div className="bg-ink px-3 py-2 text-parchment">
        <h1 className="font-display text-[22px] font-bold uppercase tracking-wider leading-none">
          {nome || 'Nome da adversária'}
        </h1>
        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-parchment/80">
          {TIPO_LABEL[tipo]} ({PATAMAR_LABEL[patamar]})
        </p>
      </div>

      <div className="px-3 py-2 space-y-1.5">
        {descricao ? (
          <p className="text-[11.5px] italic leading-snug">{descricao}</p>
        ) : null}

        <p className="text-[11.5px] leading-snug">
          <strong>Motivações e táticas:</strong>{' '}
          {motivacoes.length ? motivacoes.join(', ') : '—'}
        </p>
      </div>

      {/* Stats grid */}
      <div className="mx-3 mb-2 border-y border-ink/40">
        <div className="grid grid-cols-4 text-[11px]">
          <StatCell label="Dificuldade" value={String(dificuldade)} />
          <StatCell label="Limiares" value={`${limiarMaior}/${limiarGrave}`} />
          <StatCell label="PV" value={String(pv)} />
          <StatCell label="PF" value={String(pf)} />
        </div>
      </div>

      {/* ATQ + ataques */}
      <div className="px-3 pb-2 space-y-0.5 text-[11.5px] leading-snug">
        <p>
          <strong>ATQ:</strong> {formatSigned(atq)}
          {ataques.length > 0 && (
            <>
              {' | '}
              {ataques.map((a, idx) => (
                <span key={a.id}>
                  {idx > 0 ? ' | ' : ''}
                  <strong>{a.nome}</strong>: {a.alcance} | {a.dano}
                </span>
              ))}
            </>
          )}
        </p>
      </div>

      {/* Experiências */}
      {experiencias.length > 0 ? (
        <div className="px-3 pb-2 text-[11.5px] leading-snug">
          <p>
            <strong>Experiências:</strong>{' '}
            {experiencias.map((e, i) => (
              <span key={e.id}>
                {i > 0 ? ', ' : ''}
                {e.nome} {e.bonus >= 0 ? `+${e.bonus}` : e.bonus}
              </span>
            ))}
          </p>
        </div>
      ) : null}

      {/* Habilidades */}
      {habilidades.length > 0 ? (
        <div className="border-t border-ink/30 bg-[#ead9b8]/40 px-3 py-2">
          <h2 className="mb-1 font-display text-[11px] font-bold uppercase tracking-widest text-ink">
            Habilidades
          </h2>
          <div className="space-y-1.5">
            {habilidades.map((h) => (
              <AbilityItem key={h.id} ability={h} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
});

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center border-ink/40 px-1 py-1.5 [&:not(:last-child)]:border-r">
      <span className="text-[9px] font-semibold uppercase tracking-wider text-ink/70">
        {label}
      </span>
      <span className="font-display text-base font-bold leading-none text-ink">{value}</span>
    </div>
  );
}
