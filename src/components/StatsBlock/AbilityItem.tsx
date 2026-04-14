import type { Ability } from '@/types/adversary';
import { renderKeywords } from './renderKeywords';

const ABILITY_LABEL: Record<Ability['tipo'], string> = {
  acao: 'ação',
  reacao: 'reação',
  passiva: 'passiva',
};

export function AbilityItem({ ability }: { ability: Ability }) {
  return (
    <p className="my-[8px] text-[0.9rem] leading-[1.4]">
      <strong className="font-extrabold">{ability.nome}</strong>
      <em> ({ABILITY_LABEL[ability.tipo]}):</em>{' '}
      {renderKeywords(ability.descricao)}
    </p>
  );
}
