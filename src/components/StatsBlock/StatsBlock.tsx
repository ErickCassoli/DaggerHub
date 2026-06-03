import { forwardRef, Fragment } from 'react';
import type { Adversary } from '@/types/adversary';
import { PATAMAR_LABEL } from '@/data/patamares';
import { TIPO_LABEL } from '@/data/tipos';
import { AbilityItem } from './AbilityItem';

/** Formata inteiros com sinal, usando en-dash para negativos (igual ao livro). */
function formatSigned(n: number): string {
  if (n > 0) return `+${n}`;
  if (n < 0) return `\u2013${Math.abs(n)}`;
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
    hordaRatio,
    ataques,
    experiencias,
    habilidades,
  } = adversary;

  const experienciaLabel = experiencias.length === 1 ? 'Experiência' : 'Experiências';

  const limiaresText =
    limiarMaior == null && limiarGrave == null
      ? 'Nenhum'
      : `${limiarMaior ?? 'Nenhum'}/${limiarGrave ?? 'Nenhum'}`;

  const tipoLinha = tipo === 'horda' && hordaRatio
    ? `${TIPO_LABEL[tipo]} (${PATAMAR_LABEL[patamar]}) (${hordaRatio})`
    : `${TIPO_LABEL[tipo]} (${PATAMAR_LABEL[patamar]})`;

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
          className="m-0 text-[1.4rem] font-black uppercase leading-[1.15] tracking-[-0.5px] text-[#1a1a1a]"
          style={{ fontFamily: '"Cinzel", serif' }}
        >
          {nome || 'Nome da adversária'}
        </h1>
        <p className="my-[2px] text-[0.95rem] font-bold italic">
          {tipoLinha}
        </p>
        {descricao ? (
          <p className="my-[5px] text-[0.9rem] italic leading-[1.5]">{descricao}</p>
        ) : null}
        <p className="mt-[5px] mb-[10px] text-[0.9rem] leading-[1.5]">
          <strong className="font-extrabold">Motivações e táticas:</strong>{' '}
          {motivacoes.length ? motivacoes.join(', ') : '—'}
        </p>
      </header>

      <section className="mb-[15px] overflow-hidden rounded border border-[#d1c8b4] bg-white/80">
        <div className="grid grid-cols-4 gap-0 border-b border-[#d1c8b4]">
          <div className="border-r border-[#d1c8b4] px-[8px] py-[6px] text-center">
            <div className="text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[#666]" style={{ fontFamily: '"Cinzel", serif' }}>
              Dificuldade
            </div>
            <div className="text-[1.2rem] font-bold text-[#a3802e]">{dificuldade}</div>
          </div>
          <div className="border-r border-[#d1c8b4] px-[8px] py-[6px] text-center">
            <div className="text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[#666]" style={{ fontFamily: '"Cinzel", serif' }}>
              Limiares
            </div>
            <div className="text-[1rem] font-bold">{limiaresText}</div>
          </div>
          <div className="border-r border-[#d1c8b4] px-[8px] py-[6px] text-center">
            <div className="text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[#666]" style={{ fontFamily: '"Cinzel", serif' }}>
              PV
            </div>
            <div className="text-[1.2rem] font-bold text-[#a3802e]">{pv}</div>
          </div>
          <div className="px-[8px] py-[6px] text-center">
            <div className="text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[#666]" style={{ fontFamily: '"Cinzel", serif' }}>
              PF
            </div>
            <div className="text-[1.2rem] font-bold text-[#a3802e]">{pf}</div>
          </div>
        </div>

        <div
          className={`flex flex-wrap gap-[10px] px-[10px] py-[6px] text-[0.9rem] leading-[1.5] ${
            experiencias.length > 0
              ? 'border-b border-dotted border-[#d1c8b4]'
              : ''
          }`}
        >
          <span>
            <strong className="font-extrabold">ATQ:</strong> {formatSigned(atq)}
          </span>
          {ataques.map((a) => (
            <Fragment key={a.id}>
              <span>
                <strong className="font-extrabold">{a.nome}:</strong> {a.alcance}
              </span>
              <span>{a.dano}</span>
            </Fragment>
          ))}
        </div>

        {experiencias.length > 0 ? (
          <div className="flex flex-wrap gap-[10px] px-[10px] py-[6px] text-[0.9rem] leading-[1.5]">
            <span>
              <strong className="font-extrabold">{experienciaLabel}:</strong>{' '}
              {experiencias.map((e, i) => (
                <span key={e.id}>
                  {i > 0 ? ', ' : ''}
                  {e.nome} {formatBonus(e.bonus)}
                </span>
              ))}
            </span>
          </div>
        ) : null}
      </section>

      {habilidades.length > 0 ? (
        <section>
          <div className="mb-[8px] flex items-center gap-[8px]" style={{ color: '#a3802e' }}>
            <span style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #a3802e)' }} />
            <span className="text-[0.6rem]">◆</span>
            <span style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #a3802e)' }} />
          </div>
          <h2
            className="mb-[8px] text-center text-[0.75rem] font-bold uppercase tracking-[0.15em] text-[#1a1a1a]"
            style={{ fontFamily: '"Cinzel", serif', fontVariant: 'small-caps' }}
          >
            Habilidades
          </h2>
          <div>
            {habilidades.map((h) => (
              <AbilityItem key={h.id} ability={h} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
});
