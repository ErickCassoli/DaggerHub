import type { Patamar, Tipo } from '@/types/adversary';

export interface Baseline {
  dificuldade: number;
  /** null = lacaios e alguns manipuladores não têm limiares. */
  limiarMaior: number | null;
  limiarGrave: number | null;
  pv: number;
  pf: number;
  atq: number;
  danoSugerido: string; // Formato: "1d8+1 fís" ou "7 fís" (dano fixo para lacaios)
}

/**
 * Valores de referência por patamar × tipo alinhados ao Livro Básico PT-BR
 * (Cap. 4, pp. 193–208). Onde existe um arquetípico no livro, seus valores
 * são usados como âncora; demais células são interpoladas com a tabela
 * "Estatísticas improvisadas por patamar" (p. 208) como base média.
 *
 * Âncoras do livro:
 *  - Punhal Escarpado, Bandido (comum 1º, p. 193)
 *  - Druida da Floresta (assistente 1º, p. 198)
 *  - Cultista Adepto (assistente 2º, p. 198)
 *  - Mago de Batalha (atirador 2º, p. 199)
 *  - Minotauro Arrasador (brutamonte 2º, p. 200)
 *  - Ogro Atroz (brutamonte 3º, p. 200)
 *  - Guarda Armado (comum 1º, p. 201)
 *  - Bufão Dançarino da Lâmina (comum 4º, p. 201)
 *  - Horda de Zumbis (horda 1º, p. 202)
 *  - Mineradores Gananciosos (horda 3º, p. 202)
 *  - Rato Gigante (lacaio 1º, p. 203)
 *  - Diabrete Bajulador (lacaio 3º, p. 203)
 *  - Açoite de Sarça (líder 1º, p. 204)
 *  - Comerciante (manipulador 1º, p. 205)
 *  - Ancião do Vilarejo (manipulador 1º, p. 205)
 *  - Punhal Escarpado, Sombra (oportunista 1º, p. 206)
 *  - Serpe-boreal (oportunista 2º, p. 206)
 *  - Oscilume Jovem (solo 2º, p. 207)
 */
export const TIER_BASELINES: Record<Patamar, Record<Tipo, Baseline>> = {
  1: {
    assistente:  { dificuldade: 11, limiarMaior: 6,  limiarGrave: 10, pv: 4, pf: 5, atq: 0,  danoSugerido: '1d4+2 mág' },
    atirador:    { dificuldade: 13, limiarMaior: 6,  limiarGrave: 10, pv: 4, pf: 3, atq: 2,  danoSugerido: '1d10+1 fís' },
    brutamonte:  { dificuldade: 13, limiarMaior: 9,  limiarGrave: 17, pv: 7, pf: 3, atq: 1,  danoSugerido: '2d6+2 fís' },
    comum:       { dificuldade: 12, limiarMaior: 5,  limiarGrave: 9,  pv: 5, pf: 2, atq: 1,  danoSugerido: '1d6+1 fís' },
    horda:       { dificuldade: 8,  limiarMaior: 6,  limiarGrave: 12, pv: 6, pf: 3, atq: -1, danoSugerido: '1d10+2 fís' },
    lacaio:      { dificuldade: 10, limiarMaior: null, limiarGrave: null, pv: 1, pf: 1, atq: -4, danoSugerido: '1 fís' },
    lider:       { dificuldade: 14, limiarMaior: 9,  limiarGrave: 14, pv: 6, pf: 4, atq: 3,  danoSugerido: '1d10+2 fís' },
    manipulador: { dificuldade: 12, limiarMaior: 4,  limiarGrave: 8,  pv: 3, pf: 3, atq: -4, danoSugerido: '1d4+1 fís' },
    oportunista: { dificuldade: 12, limiarMaior: 4,  limiarGrave: 8,  pv: 3, pf: 3, atq: 1,  danoSugerido: '1d4+4 fís' },
    solo:        { dificuldade: 15, limiarMaior: 12, limiarGrave: 22, pv: 10, pf: 5, atq: 3, danoSugerido: '2d6+3 fís' },
  },
  2: {
    assistente:  { dificuldade: 14, limiarMaior: 9,  limiarGrave: 18, pv: 4,  pf: 6, atq: 2, danoSugerido: '2d4+3 mág' },
    atirador:    { dificuldade: 16, limiarMaior: 11, limiarGrave: 23, pv: 5,  pf: 6, atq: 4, danoSugerido: '2d10+4 mág' },
    brutamonte:  { dificuldade: 16, limiarMaior: 14, limiarGrave: 27, pv: 7,  pf: 5, atq: 2, danoSugerido: '2d8+5 fís' },
    comum:       { dificuldade: 14, limiarMaior: 10, limiarGrave: 20, pv: 6,  pf: 3, atq: 2, danoSugerido: '2d6+3 fís' },
    horda:       { dificuldade: 13, limiarMaior: 10, limiarGrave: 20, pv: 7,  pf: 4, atq: 1, danoSugerido: '2d6+3 fís' },
    lacaio:      { dificuldade: 13, limiarMaior: null, limiarGrave: null, pv: 1, pf: 1, atq: 1, danoSugerido: '3 fís' },
    lider:       { dificuldade: 16, limiarMaior: 12, limiarGrave: 22, pv: 7,  pf: 5, atq: 3, danoSugerido: '2d8+2 fís' },
    manipulador: { dificuldade: 14, limiarMaior: 8,  limiarGrave: 15, pv: 4,  pf: 5, atq: -2, danoSugerido: '1d6+3 fís' },
    oportunista: { dificuldade: 14, limiarMaior: 9,  limiarGrave: 18, pv: 5,  pf: 4, atq: 2, danoSugerido: '2d8+3 fís' },
    solo:        { dificuldade: 14, limiarMaior: 13, limiarGrave: 26, pv: 10, pf: 5, atq: 3, danoSugerido: '2d10+4 fís' },
  },
  3: {
    assistente:  { dificuldade: 17, limiarMaior: 18, limiarGrave: 32, pv: 6,  pf: 7, atq: 2, danoSugerido: '2d8+3 mág' },
    atirador:    { dificuldade: 17, limiarMaior: 17, limiarGrave: 30, pv: 6,  pf: 5, atq: 4, danoSugerido: '3d10+4 fís' },
    brutamonte:  { dificuldade: 15, limiarMaior: 26, limiarGrave: 42, pv: 8,  pf: 4, atq: 2, danoSugerido: '3d12+5 fís' },
    comum:       { dificuldade: 17, limiarMaior: 20, limiarGrave: 32, pv: 7,  pf: 4, atq: 3, danoSugerido: '3d8+3 fís' },
    horda:       { dificuldade: 16, limiarMaior: 15, limiarGrave: 25, pv: 6,  pf: 3, atq: 1, danoSugerido: '3d12+10 mág' },
    lacaio:      { dificuldade: 17, limiarMaior: null, limiarGrave: null, pv: 1, pf: 1, atq: 0, danoSugerido: '7 fís' },
    lider:       { dificuldade: 18, limiarMaior: 22, limiarGrave: 36, pv: 8,  pf: 6, atq: 4, danoSugerido: '2d10+3 fís' },
    manipulador: { dificuldade: 16, limiarMaior: 18, limiarGrave: 28, pv: 5,  pf: 6, atq: -1, danoSugerido: '1d10+3 fís' },
    oportunista: { dificuldade: 18, limiarMaior: 17, limiarGrave: 30, pv: 6,  pf: 6, atq: 4, danoSugerido: '2d10+4 fís' },
    solo:        { dificuldade: 19, limiarMaior: 28, limiarGrave: 50, pv: 14, pf: 7, atq: 4, danoSugerido: '3d10+4 fís' },
  },
  4: {
    assistente:  { dificuldade: 19, limiarMaior: 23, limiarGrave: 44, pv: 7,  pf: 8, atq: 3, danoSugerido: '3d8+4 mág' },
    atirador:    { dificuldade: 19, limiarMaior: 22, limiarGrave: 40, pv: 7,  pf: 6, atq: 5, danoSugerido: '4d8+10 fís' },
    brutamonte:  { dificuldade: 19, limiarMaior: 32, limiarGrave: 56, pv: 11, pf: 5, atq: 4, danoSugerido: '4d10+10 fís' },
    comum:       { dificuldade: 19, limiarMaior: 22, limiarGrave: 50, pv: 5,  pf: 3, atq: 3, danoSugerido: '4d8+5 fís' },
    horda:       { dificuldade: 18, limiarMaior: 24, limiarGrave: 44, pv: 9,  pf: 5, atq: 3, danoSugerido: '4d8+10 fís' },
    lacaio:      { dificuldade: 20, limiarMaior: null, limiarGrave: null, pv: 1, pf: 1, atq: 2, danoSugerido: '15 fís' },
    lider:       { dificuldade: 21, limiarMaior: 28, limiarGrave: 50, pv: 9,  pf: 7, atq: 5, danoSugerido: '4d8+10 fís' },
    manipulador: { dificuldade: 19, limiarMaior: 24, limiarGrave: 44, pv: 6,  pf: 7, atq: 1, danoSugerido: '3d6+3 fís' },
    oportunista: { dificuldade: 20, limiarMaior: 22, limiarGrave: 40, pv: 7,  pf: 7, atq: 5, danoSugerido: '4d8+10 fís' },
    solo:        { dificuldade: 21, limiarMaior: 38, limiarGrave: 70, pv: 16, pf: 8, atq: 5, danoSugerido: '4d10+15 fís' },
  },
};

export function getBaseline(patamar: Patamar, tipo: Tipo): Baseline {
  return TIER_BASELINES[patamar][tipo];
}
