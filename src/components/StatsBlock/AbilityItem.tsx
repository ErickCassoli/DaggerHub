import type { Ability } from '@/types/adversary';
import { renderKeywords } from './renderKeywords';

const ABILITY_LABEL: Record<Ability['tipo'], string> = {
  acao: 'ação',
  reacao: 'reação',
  passiva: 'passiva',
};

export function AbilityItem({ ability }: { ability: Ability }) {
  return (
    <p className="my-[8px] text-[14.4px] leading-[1.5]">
      <span className="text-[11.2px] text-[#a3802e]">◆ </span>
      <strong className="font-extrabold">{ability.nome}</strong>
      <em className="text-[#a3802e]"> ({ABILITY_LABEL[ability.tipo]})</em>:{' '}
      {renderKeywords(ability.descricao)}
    </p>
  );
}
