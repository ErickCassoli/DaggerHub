import { forwardRef } from 'react';
import type { Ambiente } from '@/types/ambiente';
import { AMBIENTE_TIPO_LABEL } from '@/data/ambienteTipos';
import { PATAMAR_LABEL } from '@/data/patamares';
import { FeatureItem } from './FeatureItem';

interface AmbienteBlockProps {
  ambiente: Ambiente;
  /** Nomes resolvidos das adversárias sugeridas (livre para "—" se quebrado). */
  adversarios?: string[];
}

export const AmbienteBlock = forwardRef<HTMLDivElement, AmbienteBlockProps>(function AmbienteBlock(
  { ambiente, adversarios = [] },
  ref,
) {
  const {
    nome,
    tipo,
    patamar,
    descricao,
    impulsos,
    dificuldade,
    potencialMedo,
    habilidades,
    caracteristicas,
  } = ambiente;

  return (
    <div
      ref={ref}
      className="w-[450px] rounded-[12px] border border-[#d1c8b4] bg-[#f4efdf] p-[15px] text-[#1a1a1a] shadow-[2px_2px_10px_rgba(0,0,0,0.1)]"
      style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}
    >
      <header>
        <h1 className="m-0 text-[1.4rem] font-black uppercase leading-[1.15] tracking-[-0.5px] text-[#1a1a1a]">
          {nome || 'Nome do ambiente'}
        </h1>
        <p className="my-[2px] text-[0.95rem] font-bold italic">
          {AMBIENTE_TIPO_LABEL[tipo]} ({PATAMAR_LABEL[patamar]})
        </p>
        {descricao ? (
          <p className="my-[5px] text-[0.9rem] italic">{descricao}</p>
        ) : null}
        <p className="mt-[5px] mb-[10px] text-[0.9rem]">
          <strong className="font-extrabold">Impulsos:</strong>{' '}
          {impulsos.length ? impulsos.join(', ') : '—'}
        </p>
      </header>

      <section className="mb-[15px] overflow-hidden rounded border border-[#d1c8b4] bg-white">
        <div className="flex flex-wrap gap-[10px] border-b border-dotted border-[#d1c8b4] px-[10px] py-[6px] text-[0.9rem]">
          <span>
            <strong className="font-extrabold">Dificuldade:</strong> {dificuldade}
          </span>
          {typeof potencialMedo === 'number' ? (
            <span>
              <strong className="font-extrabold">Potencial de Medo:</strong> {potencialMedo}
            </span>
          ) : null}
        </div>

        {adversarios.length > 0 ? (
          <div className="px-[10px] py-[6px] text-[0.9rem]">
            <strong className="font-extrabold">Adversários:</strong>{' '}
            {adversarios.join(', ')}
          </div>
        ) : null}
      </section>

      {caracteristicas.length > 0 ? (
        <section className="mb-[10px]">
          <h2 className="mb-[8px] block w-full border-b-2 border-[#1a1a1a] text-[1.1rem] font-bold text-[#1a1a1a]">
            CARACTERÍSTICAS
          </h2>
          <div>
            {caracteristicas.map((c) => (
              <FeatureItem key={c.id} feature={c} />
            ))}
          </div>
        </section>
      ) : null}

      {habilidades.length > 0 ? (
        <section>
          <h2 className="mb-[8px] block w-full border-b-2 border-[#1a1a1a] text-[1.1rem] font-bold text-[#1a1a1a]">
            HABILIDADES
          </h2>
          <div>
            {habilidades.map((h) => (
              <FeatureItem key={h.id} feature={h} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
});
