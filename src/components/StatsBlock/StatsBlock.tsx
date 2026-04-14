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
    ataques,
    experiencias,
    habilidades,
  } = adversary;

  const experienciaLabel = experiencias.length === 1 ? 'Experiência' : 'Experiências';

  return (
    <div
      ref={ref}
      className="w-[450px] rounded-[12px] border border-[#d1c8b4] bg-[#f4efdf] p-[15px] text-[#1a1a1a] shadow-[2px_2px_10px_rgba(0,0,0,0.1)]"
      style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}
    >
      <header>
        <h1 className="m-0 text-[1.4rem] font-black uppercase leading-[1.15] tracking-[-0.5px] text-[#1a1a1a]">
          {nome || 'Nome da adversária'}
        </h1>
        <p className="my-[2px] text-[0.95rem] font-bold italic">
          {TIPO_LABEL[tipo]} ({PATAMAR_LABEL[patamar]})
        </p>
        {descricao ? (
          <p className="my-[5px] text-[0.9rem] italic">{descricao}</p>
        ) : null}
        <p className="mt-[5px] mb-[10px] text-[0.9rem]">
          <strong className="font-extrabold">Motivações e táticas:</strong>{' '}
          {motivacoes.length ? motivacoes.join(', ') : '—'}
        </p>
      </header>

      <section className="mb-[15px] overflow-hidden rounded border border-[#d1c8b4] bg-white">
        <div className="flex flex-wrap gap-[10px] border-b border-dotted border-[#d1c8b4] px-[10px] py-[6px] text-[0.9rem]">
          <span>
            <strong className="font-extrabold">Dificuldade:</strong> {dificuldade}
          </span>
          <span>
            <strong className="font-extrabold">Limiares:</strong> {limiarMaior}/{limiarGrave}
          </span>
          <span>
            <strong className="font-extrabold">{pv} PV</strong>
          </span>
          <span>
            <strong className="font-extrabold">{pf} PF</strong>
          </span>
        </div>

        <div
          className={`flex flex-wrap gap-[10px] px-[10px] py-[6px] text-[0.9rem] ${
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
          <div className="flex flex-wrap gap-[10px] px-[10px] py-[6px] text-[0.9rem]">
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
          <h2 className="mb-[8px] block w-full border-b-2 border-[#1a1a1a] text-[1.1rem] font-bold text-[#1a1a1a]">
            HABILIDADES
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
