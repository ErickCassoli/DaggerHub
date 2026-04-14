import { forwardRef } from 'react';
import type { Adversary } from '@/types/adversary';
import { PATAMAR_LABEL } from '@/data/patamares';
import { TIPO_LABEL } from '@/data/tipos';
import { AbilityItem } from './AbilityItem';

/** Formata inteiros com sinal, usando en-dash para negativos (igual ao livro). */
function formatSigned(n: number): string {
  if (n > 0) return `+${n}`;
  if (n < 0) return `\u2013${Math.abs(n)}`; // en-dash
  return '+0';
}

function formatBonus(n: number): string {
  return n >= 0 ? `+${n}` : `\u2013${Math.abs(n)}`;
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
      className="w-[340px] border border-ink/40 bg-parchment text-ink shadow-md"
      style={{
        fontFamily: '"Cormorant Garamond", Georgia, serif',
      }}
    >
      {/* Barra escura com o nome */}
      <div className="bg-ink px-3 py-1.5 text-parchment">
        <h1 className="font-display text-[20px] font-bold uppercase tracking-[0.08em] leading-none">
          {nome || 'Nome da adversária'}
        </h1>
      </div>

      {/* Corpo */}
      <div className="px-3 pt-2 pb-2.5">
        {/* Subtítulo: tipo (patamar) em italic */}
        <p className="text-[12px] italic text-ink/80 leading-tight">
          {TIPO_LABEL[tipo]} ({PATAMAR_LABEL[patamar]})
        </p>

        {/* Descrição */}
        {descricao ? (
          <p className="mt-0.5 text-[11.5px] italic leading-snug">{descricao}</p>
        ) : null}

        {/* Motivações */}
        <p className="mt-1 text-[11.5px] leading-snug">
          <strong>Motivações e táticas:</strong>{' '}
          {motivacoes.length ? motivacoes.join(', ') : '—'}
        </p>

        {/* Stats inline com pipe */}
        <p className="mt-1 text-[11.5px] leading-snug">
          <strong>Dificuldade:</strong> {dificuldade}
          <Sep />
          <strong>Limiares:</strong> {limiarMaior}/{limiarGrave}
          <Sep />
          {pv} <strong>PV</strong>
          <Sep />
          {pf} <strong>PF</strong>
        </p>

        {/* ATQ + ataques, todos inline */}
        <p className="mt-0.5 text-[11.5px] leading-snug">
          <strong>ATQ:</strong> {formatSigned(atq)}
          {ataques.map((a) => (
            <span key={a.id}>
              <Sep />
              <strong>{a.nome}:</strong> {a.alcance} | {a.dano}
            </span>
          ))}
        </p>

        {/* Experiências */}
        {experiencias.length > 0 ? (
          <p className="mt-0.5 text-[11.5px] leading-snug">
            <strong>Experiências:</strong>{' '}
            {experiencias.map((e, i) => (
              <span key={e.id}>
                {i > 0 ? ', ' : ''}
                {e.nome} {formatBonus(e.bonus)}
              </span>
            ))}
          </p>
        ) : null}
      </div>

      {/* Divisor antes das habilidades */}
      {habilidades.length > 0 ? (
        <>
          <div className="mx-3 h-px bg-ink/60" />
          <div className="px-3 py-2">
            <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.15em] leading-none text-ink">
              Habilidades
            </h2>
            <div className="mt-1.5 space-y-1">
              {habilidades.map((h) => (
                <AbilityItem key={h.id} ability={h} />
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
});

function Sep() {
  return <span className="mx-1 text-ink/60">|</span>;
}
