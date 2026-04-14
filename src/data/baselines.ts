import type { Patamar, Tipo } from '@/types/adversary';

export interface Baseline {
  dificuldade: number;
  limiarMaior: number;
  limiarGrave: number;
  pv: number;
  pf: number;
  atq: number;
  danoSugerido: string; // Formato: "1d8+1 fís"
}

/**
 * Valores de referência por patamar x tipo, aproximados das tabelas do livro.
 * São apenas sugestões; o usuário pode editar livremente cada campo.
 * A ideia é acelerar o preenchimento sem travar customizações.
 */
export const TIER_BASELINES: Record<Patamar, Record<Tipo, Baseline>> = {
  1: {
    brutamontes:  { dificuldade: 14, limiarMaior: 9,  limiarGrave: 17, pv: 8, pf: 3, atq: 2,  danoSugerido: '2d6+2 fís' },
    horda:        { dificuldade: 13, limiarMaior: 7,  limiarGrave: 13, pv: 5, pf: 2, atq: 1,  danoSugerido: '1d8+2 fís' },
    lider:        { dificuldade: 14, limiarMaior: 8,  limiarGrave: 15, pv: 6, pf: 4, atq: 2,  danoSugerido: '1d10+1 fís' },
    lacaio:       { dificuldade: 11, limiarMaior: 5,  limiarGrave: 10, pv: 1, pf: 1, atq: 0,  danoSugerido: '1d6+1 fís' },
    distancia:    { dificuldade: 13, limiarMaior: 7,  limiarGrave: 14, pv: 4, pf: 3, atq: 2,  danoSugerido: '1d10+1 fís' },
    furtivo:      { dificuldade: 14, limiarMaior: 7,  limiarGrave: 14, pv: 4, pf: 4, atq: 2,  danoSugerido: '1d8+3 fís' },
    manipulador:  { dificuldade: 13, limiarMaior: 8,  limiarGrave: 15, pv: 5, pf: 4, atq: 1,  danoSugerido: '1d6+2 fís' },
    solo:         { dificuldade: 15, limiarMaior: 12, limiarGrave: 22, pv: 10, pf: 5, atq: 3, danoSugerido: '2d8+2 fís' },
    padrao:       { dificuldade: 13, limiarMaior: 8,  limiarGrave: 14, pv: 5, pf: 3, atq: 1,  danoSugerido: '1d8+2 fís' },
    suporte:      { dificuldade: 13, limiarMaior: 7,  limiarGrave: 13, pv: 4, pf: 4, atq: 0,  danoSugerido: '1d6+1 fís' },
  },
  2: {
    brutamontes:  { dificuldade: 16, limiarMaior: 14, limiarGrave: 27, pv: 9,  pf: 4, atq: 3, danoSugerido: '3d6+3 fís' },
    horda:        { dificuldade: 15, limiarMaior: 12, limiarGrave: 22, pv: 7,  pf: 3, atq: 2, danoSugerido: '2d6+3 fís' },
    lider:        { dificuldade: 16, limiarMaior: 13, limiarGrave: 24, pv: 7,  pf: 5, atq: 3, danoSugerido: '2d8+2 fís' },
    lacaio:       { dificuldade: 13, limiarMaior: 8,  limiarGrave: 15, pv: 1,  pf: 1, atq: 1, danoSugerido: '1d8+2 fís' },
    distancia:    { dificuldade: 15, limiarMaior: 11, limiarGrave: 21, pv: 6,  pf: 4, atq: 3, danoSugerido: '2d8+2 fís' },
    furtivo:      { dificuldade: 16, limiarMaior: 11, limiarGrave: 21, pv: 5,  pf: 5, atq: 3, danoSugerido: '2d6+4 fís' },
    manipulador:  { dificuldade: 15, limiarMaior: 12, limiarGrave: 22, pv: 6,  pf: 5, atq: 2, danoSugerido: '1d10+2 fís' },
    solo:         { dificuldade: 17, limiarMaior: 18, limiarGrave: 33, pv: 12, pf: 6, atq: 4, danoSugerido: '3d8+3 fís' },
    padrao:       { dificuldade: 15, limiarMaior: 12, limiarGrave: 22, pv: 6,  pf: 4, atq: 2, danoSugerido: '2d6+3 fís' },
    suporte:      { dificuldade: 15, limiarMaior: 11, limiarGrave: 21, pv: 5,  pf: 5, atq: 1, danoSugerido: '1d10+1 fís' },
  },
  3: {
    brutamontes:  { dificuldade: 17, limiarMaior: 22, limiarGrave: 40, pv: 10, pf: 5, atq: 4, danoSugerido: '3d8+4 fís' },
    horda:        { dificuldade: 16, limiarMaior: 18, limiarGrave: 33, pv: 8,  pf: 4, atq: 3, danoSugerido: '2d8+4 fís' },
    lider:        { dificuldade: 17, limiarMaior: 20, limiarGrave: 36, pv: 8,  pf: 6, atq: 4, danoSugerido: '2d10+3 fís' },
    lacaio:       { dificuldade: 14, limiarMaior: 12, limiarGrave: 22, pv: 1,  pf: 1, atq: 2, danoSugerido: '1d10+3 fís' },
    distancia:    { dificuldade: 16, limiarMaior: 17, limiarGrave: 32, pv: 7,  pf: 5, atq: 4, danoSugerido: '2d10+3 fís' },
    furtivo:      { dificuldade: 17, limiarMaior: 17, limiarGrave: 32, pv: 6,  pf: 6, atq: 4, danoSugerido: '2d8+5 fís' },
    manipulador:  { dificuldade: 16, limiarMaior: 18, limiarGrave: 33, pv: 7,  pf: 6, atq: 3, danoSugerido: '2d8+3 fís' },
    solo:         { dificuldade: 18, limiarMaior: 27, limiarGrave: 50, pv: 14, pf: 7, atq: 5, danoSugerido: '3d10+4 fís' },
    padrao:       { dificuldade: 16, limiarMaior: 18, limiarGrave: 33, pv: 7,  pf: 5, atq: 3, danoSugerido: '2d8+4 fís' },
    suporte:      { dificuldade: 16, limiarMaior: 17, limiarGrave: 32, pv: 6,  pf: 6, atq: 2, danoSugerido: '1d12+2 fís' },
  },
  4: {
    brutamontes:  { dificuldade: 19, limiarMaior: 31, limiarGrave: 56, pv: 12, pf: 6, atq: 5, danoSugerido: '4d8+5 fís' },
    horda:        { dificuldade: 18, limiarMaior: 26, limiarGrave: 48, pv: 9,  pf: 5, atq: 4, danoSugerido: '3d8+5 fís' },
    lider:        { dificuldade: 19, limiarMaior: 28, limiarGrave: 52, pv: 9,  pf: 7, atq: 5, danoSugerido: '3d10+4 fís' },
    lacaio:       { dificuldade: 15, limiarMaior: 16, limiarGrave: 30, pv: 1,  pf: 1, atq: 3, danoSugerido: '2d8+4 fís' },
    distancia:    { dificuldade: 18, limiarMaior: 24, limiarGrave: 44, pv: 8,  pf: 6, atq: 5, danoSugerido: '3d10+4 fís' },
    furtivo:      { dificuldade: 19, limiarMaior: 24, limiarGrave: 44, pv: 7,  pf: 7, atq: 5, danoSugerido: '3d8+6 fís' },
    manipulador:  { dificuldade: 18, limiarMaior: 26, limiarGrave: 48, pv: 8,  pf: 7, atq: 4, danoSugerido: '2d12+4 fís' },
    solo:         { dificuldade: 20, limiarMaior: 38, limiarGrave: 70, pv: 16, pf: 8, atq: 6, danoSugerido: '4d10+5 fís' },
    padrao:       { dificuldade: 18, limiarMaior: 26, limiarGrave: 48, pv: 8,  pf: 6, atq: 4, danoSugerido: '3d8+5 fís' },
    suporte:      { dificuldade: 18, limiarMaior: 24, limiarGrave: 44, pv: 7,  pf: 7, atq: 3, danoSugerido: '2d10+3 fís' },
  },
};

export function getBaseline(patamar: Patamar, tipo: Tipo): Baseline {
  return TIER_BASELINES[patamar][tipo];
}
