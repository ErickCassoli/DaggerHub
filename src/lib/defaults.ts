import { nanoid } from 'nanoid';
import type { Ability, Adversary, Attack, Experience, Patamar, Tipo } from '@/types/adversary';
import { getBaseline } from '@/data/baselines';

export function blankAttack(): Attack {
  return { id: nanoid(8), nome: '', alcance: 'Corpo a corpo', dano: '1d6 fís' };
}

export function blankExperience(): Experience {
  return { id: nanoid(8), nome: '', bonus: 2 };
}

export function blankAbility(): Ability {
  return { id: nanoid(8), nome: '', tipo: 'acao', descricao: '' };
}

export function blankAdversary(): Adversary {
  const now = new Date().toISOString();
  const tipo: Tipo = 'padrao';
  const patamar: Patamar = 1;
  const base = getBaseline(patamar, tipo);
  return {
    id: nanoid(10),
    nome: '',
    tipo,
    patamar,
    descricao: '',
    motivacoes: [],
    dificuldade: base.dificuldade,
    limiarMaior: base.limiarMaior,
    limiarGrave: base.limiarGrave,
    pv: base.pv,
    pf: base.pf,
    atq: base.atq,
    ataques: [
      { id: nanoid(8), nome: 'Ataque', alcance: 'Corpo a corpo', dano: base.danoSugerido },
    ],
    experiencias: [],
    habilidades: [],
    criadoEm: now,
    atualizadoEm: now,
  };
}
