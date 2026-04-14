import type { Ability } from '@/types/adversary';
import { renderKeywords } from './renderKeywords';

const ABILITY_LABEL: Record<Ability['tipo'], string> = {
  acao: 'ação',
  reacao: 'reação',
  passiva: 'passiva',
};

export function AbilityItem({ ability }: { ability: Ability }) {
  return (
    <p className="text-[11.5px] leading-snug text-ink">
      <strong>{ability.nome}</strong>
      <em> ({ABILITY_LABEL[ability.tipo]}):</em>{' '}
      {renderKeywords(ability.descricao)}
    </p>
  );
}
