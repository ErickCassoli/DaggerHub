import { nanoid } from 'nanoid';
import type { Transformacao, TransformacaoAbility } from '@/types/transformacao';

export function blankTransformacaoAbility(): TransformacaoAbility {
  return { id: nanoid(8), nome: '', tipo: 'passiva', descricao: '' };
}

export function blankTransformacao(): Transformacao {
  const now = new Date().toISOString();
  return {
    id: nanoid(10),
    nome: '',
    descricao: '',
    habilidades: [],
    notas: '',
    criadoEm: now,
    atualizadoEm: now,
  };
}
