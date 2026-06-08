import { forwardRef } from 'react';
import type { Transformacao, TransformacaoAbilityKind } from '@/types/transformacao';
import { renderKeywords } from '@/components/StatsBlock/renderKeywords';

const ABILITY_LABEL: Record<TransformacaoAbilityKind, string> = {
  acao: 'ação',
  reacao: 'reação',
  passiva: 'passiva',
  gatilho: 'gatilho',
};

interface TransformacaoBlockProps {
  transformacao: Transformacao;
}

export const TransformacaoBlock = forwardRef<HTMLDivElement, TransformacaoBlockProps>(
  function TransformacaoBlock({ transformacao }, ref) {
    const { nome, descricao, formaAlternativa, habilidades, tokens } = transformacao;

    return (
      <div
        ref={ref}
        className="w-[450px] rounded-[12px] border border-[#d1c8b4] bg-[#f4efdf] p-[15px] text-[#1a1a1a]"
        style={{
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          boxShadow:
            '0 10px 26px -10px rgba(58,38,16,.45), inset 0 1px 0 rgba(255,255,255,.3)',
          outline: '1px solid rgba(163,128,46,.25)',
          outlineOffset: '-6px',
        }}
      >
        {/* Cabeçalho */}
        <header className="mb-[12px]">
          <div className="mb-[4px] text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-[#a3802e]"
            style={{ fontFamily: '"Cinzel", serif' }}>
            Transformação
          </div>
          <h1
            className="m-0 text-[1.4rem] font-black uppercase leading-[1.15] tracking-[-0.5px] text-[#1a1a1a]"
            style={{ fontFamily: '"Cinzel", serif' }}
          >
            {nome || 'Nome da transformação'}
          </h1>
          {descricao ? (
            <p className="mt-[5px] text-[0.9rem] italic leading-[1.5]">{descricao}</p>
          ) : null}
        </header>

        {/* Sistema de Tokens */}
        {tokens ? (
          <section className="mb-[14px] overflow-hidden rounded border border-[#d1c8b4] bg-white/80">
            <div className="px-[10px] py-[8px] text-center">
              <div
                className="mb-[2px] text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[#666]"
                style={{ fontFamily: '"Cinzel", serif' }}
              >
                {tokens.nome}
              </div>
              <div className="text-[1.2rem] font-bold text-[#a3802e]">{tokens.maximo}</div>
              {tokens.descricao ? (
                <p className="mt-[4px] text-[0.8rem] leading-[1.4] text-[#1a1a1a]">
                  {renderKeywords(tokens.descricao)}
                </p>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* Forma Alternativa */}
        {formaAlternativa ? (
          <section className="mb-[14px]">
            <Divider />
            <h2
              className="mb-[8px] text-center text-[0.75rem] font-bold uppercase tracking-[0.15em] text-[#1a1a1a]"
              style={{ fontFamily: '"Cinzel", serif', fontVariant: 'small-caps' }}
            >
              {formaAlternativa.nome || 'Forma Alternativa'}
            </h2>
            <p className="text-[0.9rem] leading-[1.5]">
              {renderKeywords(formaAlternativa.descricao)}
            </p>
          </section>
        ) : null}

        {/* Habilidades */}
        {habilidades.length > 0 ? (
          <section>
            <Divider />
            <h2
              className="mb-[8px] text-center text-[0.75rem] font-bold uppercase tracking-[0.15em] text-[#1a1a1a]"
              style={{ fontFamily: '"Cinzel", serif', fontVariant: 'small-caps' }}
            >
              Habilidades
            </h2>
            <div>
              {habilidades.map((h) => (
                <p key={h.id} className="my-[8px] text-[0.9rem] leading-[1.5]">
                  <span className="text-[0.7rem] text-[#a3802e]">◆ </span>
                  <strong className="font-extrabold">{h.nome}</strong>
                  <em className="text-[#a3802e]"> ({ABILITY_LABEL[h.tipo]})</em>:{' '}
                  {renderKeywords(h.descricao)}
                </p>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    );
  },
);

function Divider() {
  return (
    <div className="mb-[8px] flex items-center gap-[8px]" style={{ color: '#a3802e' }}>
      <span
        style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #a3802e)' }}
      />
      <span className="text-[0.6rem]">◆</span>
      <span
        style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #a3802e)' }}
      />
    </div>
  );
}
