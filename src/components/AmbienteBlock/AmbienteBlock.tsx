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
          {nome || 'Nome do ambiente'}
        </h1>
        <p className="my-[2px] text-[15.2px] font-bold italic">
          {AMBIENTE_TIPO_LABEL[tipo]} ({PATAMAR_LABEL[patamar]})
        </p>
        {descricao ? (
          <p className="my-[5px] text-[14.4px] italic leading-[1.5]">{descricao}</p>
        ) : null}
        <p className="mt-[5px] mb-[10px] text-[14.4px] leading-[1.5]">
          <strong className="font-extrabold">Impulsos:</strong>{' '}
          {impulsos.length ? impulsos.join(', ') : '—'}
        </p>
      </header>

      <section className="mb-[15px] overflow-hidden rounded border border-[#d1c8b4] bg-white/80">
        <div className="grid gap-0 border-b border-[#d1c8b4]" style={{ gridTemplateColumns: typeof potencialMedo === 'number' ? '1fr 1fr' : '1fr' }}>
          <div className={`px-[8px] py-[6px] text-center ${typeof potencialMedo === 'number' ? 'border-r border-[#d1c8b4]' : ''}`}>
            <div className="text-[9.6px] font-semibold uppercase tracking-[0.08em] text-[#666]" style={{ fontFamily: '"Cinzel", serif' }}>
              Dificuldade
            </div>
            <div className="text-[19.2px] font-bold text-[#a3802e]">{dificuldade}</div>
          </div>
          {typeof potencialMedo === 'number' ? (
            <div className="px-[8px] py-[6px] text-center">
              <div className="text-[9.6px] font-semibold uppercase tracking-[0.08em] text-[#666]" style={{ fontFamily: '"Cinzel", serif' }}>
                Potencial de Medo
              </div>
              <div className="text-[19.2px] font-bold text-[#a3802e]">{potencialMedo}</div>
            </div>
          ) : null}
        </div>

        {adversarios.length > 0 ? (
          <div className="px-[10px] py-[6px] text-[14.4px] leading-[1.5]">
            <strong className="font-extrabold">Adversários:</strong>{' '}
            {adversarios.join(', ')}
          </div>
        ) : null}
      </section>

      {caracteristicas.length > 0 ? (
        <section className="mb-[10px]">
          <div className="mb-[8px] flex items-center gap-[8px]" style={{ color: '#a3802e' }}>
            <span style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #a3802e)' }} />
            <span className="text-[9.6px]">◆</span>
            <span style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #a3802e)' }} />
          </div>
          <h2
            className="mb-[8px] text-center text-[12px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a]"
            style={{ fontFamily: '"Cinzel", serif', fontVariant: 'small-caps' }}
          >
            Características
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
          <div className="mb-[8px] flex items-center gap-[8px]" style={{ color: '#a3802e' }}>
            <span style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #a3802e)' }} />
            <span className="text-[9.6px]">◆</span>
            <span style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #a3802e)' }} />
          </div>
          <h2
            className="mb-[8px] text-center text-[12px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a]"
            style={{ fontFamily: '"Cinzel", serif', fontVariant: 'small-caps' }}
          >
            Habilidades
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
