import { nanoid } from 'nanoid';
import type { Patamar } from '@/types/adversary';
import type { Ambiente, AmbienteFeature, AmbienteTipo } from '@/types/ambiente';
import { getAmbienteBaseline } from '@/data/ambienteBaselines';

export function blankFeature(): AmbienteFeature {
  return { id: nanoid(8), nome: '', tipo: 'passiva', descricao: '' };
}

export function blankAmbiente(): Ambiente {
  const now = new Date().toISOString();
  const tipo: AmbienteTipo = 'travessia';
  const patamar: Patamar = 1;
  const base = getAmbienteBaseline(patamar);
  return {
    id: nanoid(10),
    nome: '',
    tipo,
    patamar,
    descricao: '',
    impulsos: [],
    dificuldade: base.dificuldade,
    potencialMedo: base.potencialMedo,
    adversariosSugeridos: [],
    habilidades: [],
    caracteristicas: [],
    criadoEm: now,
    atualizadoEm: now,
  };
}
